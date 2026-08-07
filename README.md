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

All commands are enabled in direct messages. The bot only accepts commands from
the Discord user IDs in `ALLOWED_USER_IDS`, which lets you limit it to you and
your friend.

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

Commands are registered globally. Discord can take a while to show global
command changes after the first deploy.

The current Roblox endpoints require the account represented by the cookie to
have permission to manage group members and accept join requests. Roblox
recommends Open Cloud API keys or OAuth for production instead of cookies; this
bot uses `ROBLOX_COOKIE` because that is the requested setup.

## Run locally

```bash
pnpm install
pnpm start
```