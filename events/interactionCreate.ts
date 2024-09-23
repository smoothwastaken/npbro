import type { Interaction } from "discord.js";

const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `[ERROR] No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "[ERROR] There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "[ERROR] There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};