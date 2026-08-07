import { config } from "./config.js";

const ROBLOX_API = "https://www.roblox.com";
const GROUPS_API = "https://groups.roblox.com";
const USERS_API = "https://users.roblox.com";

let csrfToken = "";

function requireRobloxConfig() {
  if (!config.robloxCookie) {
    throw new Error("ROBLOX_COOKIE is not configured.");
  }

  if (!config.robloxXRoleId) {
    throw new Error("ROBLOX_X_ROLE_ID is not configured.");
  }
}

function cookieHeader() {
  const cookie = config.robloxCookie.replace(/^\.ROBLOSECURITY=/, "");
  return `.ROBLOSECURITY=${cookie}`;
}

async function robloxFetch(url, options = {}, retry = true) {
  requireRobloxConfig();

  const headers = new Headers(options.headers);
  headers.set("Cookie", cookieHeader());
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (csrfToken) {
    headers.set("X-CSRF-TOKEN", csrfToken);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 403 && retry) {
    const nextCsrfToken = response.headers.get("x-csrf-token");

    if (nextCsrfToken) {
      csrfToken = nextCsrfToken;
      return robloxFetch(url, options, false);
    }
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Roblox request failed (${response.status} ${response.statusText}): ${body.slice(0, 500)}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function findUser(username) {
  const result = await robloxFetch(`${USERS_API}/v1/usernames/users`, {
    method: "POST",
    body: JSON.stringify({
      usernames: [username],
      excludeBannedUsers: false,
    }),
  });

  const user = result.data?.[0];

  if (!user) {
    throw new Error(`Roblox user "${username}" was not found.`);
  }

  return {
    id: String(user.id),
    name: user.name,
    displayName: user.displayName,
  };
}

async function getGroupMembership(userId) {
  const result = await robloxFetch(
    `${GROUPS_API}/v2/users/${userId}/groups/roles`,
    { method: "GET" },
  );

  return result.data?.find(
    (membership) => String(membership.group?.id) === String(config.robloxGroupId),
  );
}

async function updateGroupRole(userId, roleId) {
  await robloxFetch(
    `${GROUPS_API}/v1/groups/${config.robloxGroupId}/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ roleId: Number(roleId) }),
    },
  );
}

export async function giveXTag(username) {
  const user = await findUser(username);
  const membership = await getGroupMembership(user.id);

  if (!membership) {
    throw new Error(`${user.name} is not a member of the Roblox group.`);
  }

  if (String(membership.role?.id) === String(config.robloxXRoleId)) {
    return { user, changed: false, message: "already has the X tag role" };
  }

  await updateGroupRole(user.id, config.robloxXRoleId);
  return { user, changed: true, message: "was given the X tag role" };
}

export async function stripXTag(username) {
  const user = await findUser(username);
  const membership = await getGroupMembership(user.id);

  if (!membership) {
    throw new Error(`${user.name} is not a member of the Roblox group.`);
  }

  if (String(membership.role?.id) !== String(config.robloxXRoleId)) {
    return { user, changed: false, message: "does not currently have the X tag role" };
  }

  await updateGroupRole(user.id, config.robloxMemberRoleId);
  return { user, changed: true, message: "was returned to the base member role" };
}

async function findJoinRequest(username) {
  let cursor;

  do {
    const query = new URLSearchParams({
      sortOrder: "Asc",
      limit: "100",
    });

    if (cursor) {
      query.set("cursor", cursor);
    }

    const result = await robloxFetch(
      `${GROUPS_API}/v1/groups/${config.robloxGroupId}/join-requests?${query}`,
      { method: "GET" },
    );

    const match = result.data?.find(
      (request) =>
        request.requester?.username?.toLowerCase() === username.toLowerCase(),
    );

    if (match) {
      return match;
    }

    cursor = result.nextPageCursor;
  } while (cursor);

  return null;
}

export async function acceptJoinRequest(username) {
  const user = await findUser(username);
  const membership = await getGroupMembership(user.id);

  if (membership) {
    return { user, changed: false, message: "is already in the Roblox group" };
  }

  const request = await findJoinRequest(user.name);

  if (!request) {
    throw new Error(`${user.name} does not have a pending group join request.`);
  }

  await robloxFetch(
    `${GROUPS_API}/v1/groups/${config.robloxGroupId}/join-requests/users/${user.id}`,
    { method: "POST", body: JSON.stringify({}) },
  );

  return { user, changed: true, message: "was accepted into the Roblox group" };
}