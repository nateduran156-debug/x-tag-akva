import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

function availableEverywhere(command) {
  return command
    .setDMPermission(true)
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    )
    .setContexts(
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel,
    );
}

export const commandDefinitions = [
  availableEverywhere(
    new SlashCommandBuilder()
      .setName("whitelist")
      .setDescription("Add or remove a Discord user from the whitelist.")
      .addStringOption((option) =>
        option
          .setName("action")
          .setDescription("What to do with the user.")
          .setRequired(true)
          .addChoices(
            { name: "Add", value: "add" },
            { name: "Remove", value: "remove" },
          ),
      )
      .addStringOption((option) =>
        option
          .setName("user")
          .setDescription("A user ID or a mention such as @User.")
          .setRequired(true),
      ),
  ),
  availableEverywhere(
    new SlashCommandBuilder()
      .setName("x-tag")
      .setDescription("Give a Roblox group member the X tag role.")
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("The Roblox username.")
          .setRequired(true),
      ),
  ),
  availableEverywhere(
    new SlashCommandBuilder()
      .setName("strip-x")
      .setDescription("Remove the X tag role from a Roblox group member.")
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("The Roblox username.")
          .setRequired(true),
      ),
  ),
  availableEverywhere(
    new SlashCommandBuilder()
      .setName("tag-history")
      .setDescription("Show the latest X tag history."),
  ),
  availableEverywhere(
    new SlashCommandBuilder()
      .setName("accept")
      .setDescription("Accept a pending Roblox group join request.")
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("The Roblox username.")
          .setRequired(true),
      ),
  ),
  availableEverywhere(
    new SlashCommandBuilder()
      .setName("group")
      .setDescription("Send the Roblox group link."),
  ),
];