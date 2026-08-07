import { config } from "./config.js";

const groupsApi = "https://groups.roblox.com";
const usersApi = "https://users.roblox.com";
let csrfToken;

function checkConfig() {
  if (!config.robloxCookie) {
    throw new Error("ROBLOX_COOKIE is not configured.");
  }

  if (!config.robloxXRoleId) {
    throw new Error("ROBLOX_X_ROLE_ID is not configured.");
  }
}

function cookieValue() {
  return config.robloxCookie.replace(/^\.ROBLOSECURITY=/, "");
}

async function request(url, options = {}, retry = true) {
  checkConfig();

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("Cookie", `.ROBLOSECURITY=${cookieValue()}`);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (csrfToken) {
    headers.set("X-CSRF-TOKEN", csrfToken);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 403 && retry) {
    const token = response.headers.get("x-csrf-token");

    if (token) {
      csrfToken = token;
      return request(url, options, false);
    }
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Roblox returned ${response.status}: ${message.slice(0, 400)}`);
  }

  return response.status === 204 ? null : response.json();
}

async function getUser(username) {
  const response = await request(`${usersApi}/v1/usernames/users`, {
    method: "POST",
    body: JSON.stringify({
      usernames: [username],
      excludeBannedUsers: false,
    }),
  });

  const user = response.data?.[0];

  if (!user) {
    throw new Error(`Roblox user "${username}" was not found.`);
  }

  return { id: String(user.id), name: user.name };
}

async function getMembership(userId) {
  const response = await request(
    `${groupsApi}/v2/users/${userId}/groups/roles`,
  );

  return response.data?.find(
    (item) => String(item.group?.id) === String(config.robloxGroupId),
  );
}

async function setRole(userId, roleId) {
  await request(
    `${groupsApi}/v1/groups/${config.robloxGroupId}/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ roleId: Number(roleId) }),
    },
  );
}

export async function giveXTag(username) {
  const user = await getUser(username);
  const membership = await getMembership(user.id);

  if (!membership) {
    throw new Error(`${user.name} is not a member of the Roblox group.`);
  }

  if (String(membership.role?.id) === String(config.robloxXRoleId)) {
    return { user, changed: false, message: "already has the X tag role" };
  }

  await setRole(user.id, config.robloxXRoleId);
  return { user, changed: true, message: "was given the X tag role" };
}

export async function stripXTag(username) {
  const user = await getUser(username);
  const membership = await getMembership(user.id);

  if (!membership) {
    throw new Error(`${user.name} is not a member of the Roblox group.`);
  }

  if (String(membership.role?.id) !== String(config.robloxXRoleId)) {
    return {
      user,
      changed: false,
      message: "does not currently have the X tag role",
    };
  }

  await setRole(user.id, config.robloxMemberRoleId);
  return {
    user,
    changed: true,
    message: "was returned to the base member role",
  };
}

async function findJoinRequest(username) {
  let cursor;

  do {
    const params = new URLSearchParams({
      sortOrder: "Asc",
      limit: "100",
    });

    if (cursor) {
      params.set("cursor", cursor);
    }

    const response = await request(
      `${groupsApi}/v1/groups/${config.robloxGroupId}/join-requests?${params}`,
    );

    const requestForUser = response.data?.find(
      (item) =>
        item.requester?.username?.toLowerCase() === username.toLowerCase(),
    );

    if (requestForUser) {
      return requestForUser;
    }

    cursor = response.nextPageCursor;
  } while (cursor);

  return null;
}

export async function acceptJoinRequest(username) {
  const user = await getUser(username);
  const membership = await getMembership(user.id);

  if (membership) {
    return { user, changed: false, message: "is already in the Roblox group" };
  }

  const joinRequest = await findJoinRequest(user.name);

  if (!joinRequest) {
    throw new Error(`${user.name} does not have a pending group join request.`);
  }

  await request(
    `${groupsApi}/v1/groups/${config.robloxGroupId}/join-requests/users/${user.id}`,
    { method: "POST", body: JSON.stringify({}) },
  );

  return { user, changed: true, message: "was accepted into the Roblox group" };
}