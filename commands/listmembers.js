const { SlashCommandBuilder } = require('discord.js');
const { readFileSync } = require('../helper/file-utils');
const { getGuildConfigForChoices } = require('../helper/utils');

async function handleGuildGetCommand(server){
    try{
        const data = readFileSync(`./storage/${server}.json`);
        const datajson = JSON.parse(data);
        return `Anzahl an gespeicherten Members: ${datajson.members.length}\nMembers: ${JSON.stringify(datajson.members)}`;
    }catch(error){
        return 'Error while reading guild: ' + error;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listmembers')
		.setDescription('Liste die gespeicherten Mitglieder einer Gilde auf.')
		.setDMPermission(true)
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Name des Servers.')
                .setRequired(true)
                .addChoices(...getGuildConfigForChoices())
            ),
	async execute(interaction) {
        const server = interaction.options.getString('server');
		await interaction.reply(await handleGuildGetCommand(server));
	},
};
