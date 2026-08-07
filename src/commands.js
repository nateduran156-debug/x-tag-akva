import { SlashCommandBuilder } from "discord.js";

const dmEnabled = (command) => command.setDMPermission(true);

export const commandDefinitions = [
  dmEnabled(
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
  dmEnabled(
    new SlashCommandBuilder()
      .setName("x-tag")
      .setDescription("Log a Roblox username and apply the X tag role in a server.")
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("The Roblox username.")
          .setRequired(true),
      ),
  ),
  dmEnabled(
    new SlashCommandBuilder()
      .setName("tag-history")
      .setDescription("Show the latest X tag history."),
  ),
  dmEnabled(
    new SlashCommandBuilder()
      .setName("accept")
      .setDescription("Accept a Roblox username into the group.")
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("The Roblox username.")
          .setRequired(true),
      ),
  ),
  dmEnabled(
    new SlashCommandBuilder()
      .setName("group")
      .setDescription("Send the Roblox group link."),
  ),
];