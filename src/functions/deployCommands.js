const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const ClientToken = process.env.BuySellToken;
const ClientID = process.env.BuySellId;
const GuildID = process.env.ArabianPhunksId;

module.exports = async () => {
  const commandsArray = [];

  console.log(`this is the path in deploy commands: ${__dirname}`);
  const foldersPath = path.join(__dirname, '..', 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commandsArray.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  const rest = new REST().setToken(ClientToken);

  (async () => {
    try {
      console.log(
        `Started refreshing ${commandsArray.length} application (/) commands.`
      );

      const data = await rest.put(
        Routes.applicationGuildCommands(ClientID, GuildID),
        { body: commandsArray }
      );

      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      console.error(error);
    }
  })();
};
