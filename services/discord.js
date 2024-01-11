const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js'); 

const commandFolder = '../commands'

function getCommands(){
    let commandNames = [];
    let commandCollection = new Collection();
    const foldersPath = path.join(__dirname, commandFolder);
    const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(foldersPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            console.log('Got command: ' + command.data.name)
            commandCollection.set(command.data.name, command);
            commandNames.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    return {commandNames, commandCollection}
}

function startService(token, clientId){
    //create client
    const discord_client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessages ] });
    //get slash commands from folder
    const {commandNames, commandCollection} = getCommands();
    discord_client.commands = commandCollection;
    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(token);
    // deploy commands!
    (async () => {
        try {
            console.log(`Started refreshing ${commandNames.length} application (/) commands.`);
    
            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commandNames },
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
    //log that we have succesfully logged in into discord
    discord_client.once(Events.ClientReady, () => {
        console.log(`discord | Ready! Logged in as ${discord_client.user.tag}`)
    });
    //handle incomming slash commands
    discord_client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
    
        const command = discord_client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });

    discord_client.login(token);
}

module.exports = {
    startService: startService
};