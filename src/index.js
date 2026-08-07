import {
  Client,
  GatewayIntentBits,
  MessageFlags,
  REST,
  Routes,
} from "discord.js";
import { config } from "./config.js";
import {
  acceptTag,
  addToWhitelist,
  addTag,
  getRecentTags,
  removeFromWhitelist,
} from "./data.js";
import { commandDefinitions } from "./commands.js";
import {
  cleanUsername,
  formatDate,
  parseUserId,
  reply,
} from "./replies.js";
import {
  acceptJoinRequest,
  giveXTag,
  stripXTag,
} from "./roblox.js";

const commands = commandDefinitions.map((command) => command.toJSON());

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function isAllowed(userId) {
  return config.allowedUserIds.includes(userId);
}

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(config.botToken);

  await rest.put(Routes.applicationCommands(config.clientId), {
    body: commands,
  });

  console.log("Slash commands registered.");
}

function describeLocation(interaction) {
  if (interaction.guildId) {
    return `server ${interaction.guildId}`;
  }

  return interaction.context === 1 ? "bot DM" : "private channel";
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}.`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (!isAllowed(interaction.user.id)) {
    await interaction.reply(reply(
      "Not allowed",
      "Add your Discord user ID to ALLOWED_USER_IDS before using this bot.",
    ));
    return;
  }

  try {
    // Roblox lookups and role changes can take longer than Discord's
    // three-second initial response window. A deferred response keeps the
    // interaction valid in servers, DMs, and group DMs alike.
    await interaction.deferReply({ flags: MessageFlags.IsComponentsV2 });

    if (interaction.commandName === "whitelist") {
      const action = interaction.options.getString("action", true);
      const input = interaction.options.getString("user", true);
      const userId = parseUserId(input);

      if (!userId) {
        await interaction.editReply(
          reply(
            "Invalid user",
            "Use a Discord user ID or a mention like `<@123456789012345678>`.",
          ),
        );
        return;
      }

      if (action === "add") {
        const added = await addToWhitelist(userId, interaction.user.id);
        await interaction.editReply(
          reply(
            added ? "Whitelisted" : "Already whitelisted",
            added
              ? `<@${userId}> was added to the whitelist.`
              : `<@${userId}> is already on the whitelist.`,
          ),
        );
        return;
      }

      const removed = await removeFromWhitelist(userId);
      await interaction.editReply(
        reply(
          removed ? "Removed" : "Not found",
          removed
            ? `<@${userId}> was removed from the whitelist.`
            : `<@${userId}> was not on the whitelist.`,
        ),
      );
      return;
    }

    if (interaction.commandName === "x-tag") {
      const username = cleanUsername(
        interaction.options.getString("username", true),
      );
      const result = await giveXTag(username);
      await addTag(username, interaction.user.id);

      await interaction.editReply(reply(
        "X tag added",
        `Roblox username: **${result.user.name}**\n\n${result.user.name} ${result.message}.`,
      ));
      return;
    }

    if (interaction.commandName === "strip-x") {
      const username = cleanUsername(
        interaction.options.getString("username", true),
      );
      const result = await stripXTag(username);

      await interaction.editReply(reply(
        result.changed ? "X tag removed" : "No change needed",
        `Roblox username: **${result.user.name}**\n\n${result.user.name} ${result.message}.`,
      ));
      return;
    }

    if (interaction.commandName === "tag-history") {
      const tags = await getRecentTags();

      if (tags.length === 0) {
        await interaction.editReply(reply("Tag history", "There is no tag history yet."));
        return;
      }

      const lines = tags.map((tag, index) => {
        const status = tag.accepted ? "accepted" : "waiting";
        return `${index + 1}. **${tag.username}** — ${status} — ${formatDate(tag.createdAt)}`;
      });

      await interaction.editReply(reply("Tag history", lines.join("\n")));
      return;
    }

    if (interaction.commandName === "accept") {
      const username = cleanUsername(
        interaction.options.getString("username", true),
      );
      const result = await acceptJoinRequest(username);
      await acceptTag(username, interaction.user.id);

      await interaction.editReply(reply(
        result.changed ? "Accepted into Roblox group" : "Already accepted",
        `Roblox username: **${result.user.name}**\n\n${result.user.name} ${result.message}.`,
      ));
      return;
    }

    if (interaction.commandName === "group") {
      await interaction.editReply(reply("Roblox group", config.groupUrl));
    }
  } catch (error) {
    console.error(`Command failed (${interaction.commandName}, ${
      interaction.user.id
    }, ${describeLocation(interaction)}):`, error);

    const response = reply(
      "Something went wrong",
      error instanceof Error
        ? error.message
        : "The command could not be completed. Check the bot logs for details.",
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(response);
    }
  }
});

await registerCommands();
await client.login(config.botToken);