# X Discord Bot

This is a small Discord bot written in plain JavaScript. It uses Discord Components
V2 for its responses and does not need a database or data file.

Whitelist entries and tag history are kept in memory while the bot is running.
They reset whenever Railway restarts or redeploys the service.

## Commands

- `/whitelist add user`
- `/whitelist remove user`
- `/x-tag username`
- `/strip-x username`
- `/tag-history`
- `/accept username`
- `/group`

All commands are available in servers, normal DMs, and group DMs. The bot only
accepts commands from the Discord user IDs in `ALLOWED_USER_IDS`, which lets you
limit it to you and your friend.

## Included reliability fixes

- Commands now defer their Discord response before contacting Roblox, so slow
  user lookups and role changes do not expire the interaction.
- The same command handler works in servers, bot DMs, and private/group DMs.
- Roblox role IDs are validated before a role update is sent.
- Roblox/API errors are shown in the command response and logged with the
  command, user, and interaction location.
- Whitelist accepts a raw ID, `@ID`, `<@ID>`, or `<@!ID>`.

`/x-tag` finds the Roblox username, confirms that the account is in the group,
and gives it the configured Roblox X tag role.

`/strip-x` only changes a member who currently has the configured X tag role.
It returns that account to the configured base member role. It does not remove
people from the group.

`/accept` finds the pending join request for the Roblox username and accepts it
into the group. If the account is already a member, it reports that no change
was needed.

## Railway variables

Add these variables to the Railway service:

```text
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
ALLOWED_USER_IDS=your_discord_id,your_friends_discord_id
ROBLOX_COOKIE=your_.ROBLOSECURITY_cookie
ROBLOX_GROUP_ID=396910998
ROBLOX_X_ROLE_ID=your_roblox_x_role_id
ROBLOX_MEMBER_ROLE_ID=1
```

`ROBLOX_X_ROLE_ID` is the recommended name for the Roblox X group role.
`X_TAG_ROLE_ID` is also accepted as a backwards-compatible alias.

`ROBLOX_COOKIE` is a sensitive credential. Store it as a Railway variable or
Replit Secret; never put it in this ZIP, source code, or a public repository.
The Roblox cookie is used only for the Roblox group API requests.

## Discord setup

1. Create an application in the Discord Developer Portal.
2. Create a bot and copy its token into Railway as `DISCORD_BOT_TOKEN`.
3. Copy the application ID into `DISCORD_CLIENT_ID`.
4. Create the Roblox group role IDs in the group settings and copy the X tag
   role ID into `ROBLOX_X_ROLE_ID`. The base member role is normally `1`.
5. Create a Roblox API credential/session with permission to manage group
   members, then store the `.ROBLOSECURITY` value as `ROBLOX_COOKIE`.
6. Invite the Discord bot with the `bot` and `applications.commands` scopes.
7. For private or group DMs, install the app for each Discord account that
   should use the commands. In Discord, open the bot's profile, choose **Add
   App**, and allow the app to access the account. This is required for
   user-installed commands to appear there. A server install alone does not
   make every user-installed command appear in a user's private command list.

If commands are missing after installation, restart Discord or wait a few
minutes for global command registration to refresh. The bot logs the command,
user, and whether the interaction came from a server or DM so setup problems
can be diagnosed without guessing.

Commands are registered globally with both server-install and user-install
contexts. Discord can take a short time to refresh global command changes after
the bot restarts. The bot also defers every command response because Roblox
lookups and role changes can take longer than Discord's three-second response
window. Make sure `ALLOWED_USER_IDS` contains both IDs, with no `@` symbols:

```text
ALLOWED_USER_IDS=your_discord_id,your_friends_discord_id
```

The current Roblox endpoints require the account represented by the cookie to
have permission to manage group members and accept join requests. Roblox
recommends Open Cloud API keys or OAuth for production instead of cookies; this
bot uses `ROBLOX_COOKIE` because that is the requested setup.

## Run locally

```bash
pnpm install
pnpm start
```