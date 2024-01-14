const { SlashCommandBuilder } = require('discord.js');
const { readFileSync } = require('../../../helper/file-utils');
const { getGuildConfigForChoices } = require('../../../helper/utils');
const axios = require('axios');

async function handleCheckFightCommand(server, attachment, ignore){
    try{
        if(!attachment.name.endsWith('.har')){
            throw 'Attachment has the wrong file format. Bot expects an .har file.';
        }
        const url = attachment.url;

        let response = await axios.get(url).then(res => res.data);
        let body = JSON.stringify(response);

        if(!body.includes('fightheader')){
            throw 'Attachment does not contain a fight.';
        }

        const data = readFileSync(`./storage/${server}.json`);
        const guild = JSON.parse(data);
       
        const missingMembers = guild.members.filter(member => {
            if(ignore && member == guild.memberWithHighestLevel){
                return false;
            }
            return !(body.includes(`,${member},`) || body.includes(`/${member}/`));
        });

        return `Von ${guild.members.length} Mitgliedern wurden nur ${guild.members.length - missingMembers.length} erkannt.\nEs fehlten: ${missingMembers.join(', ')}`;

    }catch(error){
        return 'Error while checking a fight: ' + error;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkfight')
		.setDescription('Prüft einen Kampfbericht und listet alle Gildenmitglieder auf, die in diesem Fehlen.')
		.setDMPermission(true)
        .addStringOption(option => option
            .setName('server')
            .setDescription('Name des Servers.')
            .setRequired(true)
            .addChoices(...getGuildConfigForChoices())
            )
        .addBooleanOption(option => option 
            .setName('ignore')
            .setDescription('Ignoriere den Spieler mit dem höchsten Level.')
            .setRequired(true)
            )
        .addAttachmentOption((option) => option
            .setRequired(true)
            .setName("file")
            .setDescription("Die zu überprüfende .har Datei. https://tinyurl.com/amht3fuk")),
	async execute(interaction) {
        const server = interaction.options.getString('server');
        const attachment = interaction.options.getAttachment("file");
        const ignore = interaction.options.getBoolean('ignore');
        await interaction.reply(await handleCheckFightCommand(server, attachment, ignore));
	},
};
