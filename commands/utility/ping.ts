const { SlashCommandBuilder } = require("discord.js");

// Types
import type { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply("ahah ratio");
  },
};
