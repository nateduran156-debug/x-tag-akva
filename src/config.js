function required(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeDiscordId(value) {
  return value
    .trim()
    .replace(/^<@!?/, "")
    .replace(/>$/, "")
    .replace(/^@/, "");
}

const allowedUserIds = required("ALLOWED_USER_IDS")
  .split(",")
  .map(normalizeDiscordId)
  .filter(Boolean);

if (allowedUserIds.length === 0) {
  throw new Error("ALLOWED_USER_IDS must contain at least one Discord user ID.");
}

const robloxGroupId = process.env.ROBLOX_GROUP_ID?.trim() || "396910998";

export const config = {
  botToken: required("DISCORD_BOT_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  allowedUserIds,
  robloxCookie: process.env.ROBLOX_COOKIE?.trim(),
  robloxGroupId,
  robloxXRoleId:
    process.env.ROBLOX_X_ROLE_ID?.trim() ||
    process.env.X_TAG_ROLE_ID?.trim() ||
    "",
  robloxMemberRoleId: process.env.ROBLOX_MEMBER_ROLE_ID?.trim() || "1",
  groupUrl: `https://www.roblox.com/communities/${robloxGroupId}/we-all-use-tb-xvxvvxxv#!/about`,
};