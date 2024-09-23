const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

console.log(`[INFO] Found ${commandFolders.length} command folders.`);

for (const folder of commandFolders) {
  console.log(`[INFO] Loading commands from ${folder}...`);

  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file: string) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    console.log(`[INFO] Loading command ${file}...`);
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      console.log(`[INFO] Loaded command ${command.data.name}.`);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
  console.log(`[INFO] Loaded ${commandFiles.length} commands from ${folder}.`);
}
console.log(`[INFO] Loaded ${client.commands.size} commands in total.`);

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file: string) => file.endsWith(".ts"));

console.log(`[INFO] Found ${eventFiles.length} event files.`);

for (const file of eventFiles) {
  console.log(`[INFO] Loading event ${file}...`);
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args: string[]) => event.execute(...args));
    console.log(`[INFO] Loaded once event ${event.name}.`);
  } else {
    client.on(event.name, (...args: string[]) => event.execute(...args));
    console.log(`[INFO] Loaded event ${event.name}.`);
  }
}
console.log(`[INFO] Loaded ${eventFiles.length} events in total.`);

client.login(token);
