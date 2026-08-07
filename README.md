# X Discord Bot

This is a small Discord bot written in plain JavaScript. It uses Discord Components
V2 for its responses and does not need a database or data file.

Whitelist entries and tag history are kept in memory while the bot is running.
They reset whenever Railway restarts or redeploys the service.

## Commands

- `/whitelist add user`
- `/whitelist remove user`
- `/x-tag username`
- `/tag-history`
- `/accept username`
- `/group`

All commands are enabled in direct messages. The bot only accepts commands from
the Discord user IDs in `ALLOWED_USER_IDS`, which lets you limit it to you and
your friend.

`/x-tag` records the Roblox username. When it is used inside a server, it also
adds the configured X tag role to the person who ran the command. In a DM, it
only records the username because Discord roles are server-specific.

`/accept` records the acceptance and sends the official group link. Roblox does
not let a normal Discord bot force a person into a group without a Roblox
account credential and additional authorization, so the person still joins
through Roblox.

## Railway variables

Add these variables to the Railway service:

```text
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
ALLOWED_USER_IDS=your_discord_id,your_friends_discord_id
X_TAG_ROLE_ID=8
```

The bot token is never stored in the source code.

## Discord setup

1. Create an application in the Discord Developer Portal.
2. Create a bot and copy its token into Railway as `DISCORD_BOT_TOKEN`.
3. Copy the application ID into `DISCORD_CLIENT_ID`.
4. Invite the bot with the `bot` and `applications.commands` scopes.
5. Give the bot permission to manage roles if `/x-tag` should add the role.
6. Make sure the bot's highest role is above the X tag role.

Commands are registered globally. Discord can take a while to show global
command changes after the first deploy.

## Run locally

```bash
pnpm install
pnpm start
```