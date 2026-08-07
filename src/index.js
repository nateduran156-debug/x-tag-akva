import {
  Client,
  GatewayIntentBits,
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

  console.log("Global slash commands registered.");
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}.`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (!isAllowed(interaction.user.id)) {
    await interaction.reply(
      reply("Not allowed", "This bot is limited to the users in ALLOWED_USER_IDS.", {
        ephemeral: true,
      }),
    );
    return;
  }

  try {
    if (interaction.commandName === "whitelist") {
      const action = interaction.options.getString("action", true);
      const input = interaction.options.getString("user", true);
      const userId = parseUserId(input);

      if (!userId) {
        await interaction.reply(
          reply(
            "Invalid user",
            "Use a Discord user ID or a mention like `<@123456789012345678>`.",
          ),
        );
        return;
      }

      if (action === "add") {
        const added = await addToWhitelist(userId, interaction.user.id);
        await interaction.reply(
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
      await interaction.reply(
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

      await interaction.reply(
        reply(
          "X tag added",
          `Roblox username: **${result.user.name}**\n\n${result.user.name} ${result.message}.`,
        ),
      );
      return;
    }

    if (interaction.commandName === "strip-x") {
      const username = cleanUsername(
        interaction.options.getString("username", true),
      );
      const result = await stripXTag(username);

      await interaction.reply(
        reply(
          result.changed ? "X tag removed" : "No change needed",
          `Roblox username: **${result.user.name}**\n\n${result.user.name} ${result.message}.`,
        ),
      );
      return;
    }

    if (interaction.commandName === "tag-history") {
      const tags = await getRecentTags();

      if (tags.length === 0) {
        await interaction.reply(reply("Tag history", "There is no tag history yet."));
        return;
      }

      const lines = tags.map((tag, index) => {
        const status = tag.accepted ? "accepted" : "waiting";
        return `${index + 1}. **${tag.username}** — ${status} — ${formatDate(tag.createdAt)}`;
      });

      await interaction.reply(reply("Tag history", lines.join("\n")));
      return;
    }

    if (interaction.commandName === "accept") {
      const username = cleanUsername(
        interaction.options.getString("username", true),
      );
      const result = await acceptJoinRequest(username);
      await acceptTag(username, interaction.user.id);

      await interaction.reply(
        reply(
          result.changed ? "Accepted into Roblox group" : "Already accepted",
          `Roblox username: **${result.user.name}**\n\n${result.user.name} ${result.message}.`,
        ),
      );
      return;
    }

    if (interaction.commandName === "group") {
      await interaction.reply(reply("Roblox group", config.groupUrl));
    }
  } catch (error) {
    console.error("Command failed:", error);

    const response = reply(
      "Something went wrong",
      "The command could not be completed. Check the Railway logs for details.",
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(response);
    } else {
      await interaction.reply(response);
    }
  }
});

await registerCommands();
await client.login(config.botToken);