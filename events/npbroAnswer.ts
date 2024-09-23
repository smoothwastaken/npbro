const { Client, Message, Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message: typeof Message) {
    if (message.author.bot) return;

    if (message.mentions.has(message.client.user)) {
      try {
        await message.react("👋");
      } catch (error) {
        console.error("[ERROR] Impossible d'ajouter une réaction:", error);
      }
    }
  },
};
