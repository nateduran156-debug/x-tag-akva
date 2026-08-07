import {
  ContainerBuilder,
  MessageFlags,
  TextDisplayBuilder,
} from "discord.js";

export function reply(title, message, options = {}) {
  const container = new ContainerBuilder()
    .setAccentColor(0xffffff)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${title}`),
    )
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(message));

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
    ...options,
  };
}

export function cleanUsername(value) {
  return value.trim().replace(/^@+/, "");
}

export function parseUserId(value) {
  const cleaned = value.trim();
  const mention = cleaned.match(/^<@!?(\d+)>$/);

  if (mention) {
    return mention[1];
  }

  if (/^\d{5,25}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export function formatDate(value) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}