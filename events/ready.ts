import type { Client } from "discord.js";

const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client<true>) {
    client.user.setPresence({
      activities: [{ name: "M. CHAPPERT", type: 3 }],
      status: "online",
    });

    console.log(`[INFO] Ready! Logged in as ${client.user.tag}`);
  },
};
