const { SlashCommandBuilder } = require('discord.js');
const { writeFileSync,readFileSync } = require('../helper/file-utils');
const { userWithSavePermission } = require('../config.json');
const { getGuildConfigForChoices } = require('../helper/utils');
const axios = require('axios')

async function handleGuildSaveCommand(server, attachment){
   
    try{
        if(!attachment.name.endsWith('.json')){
            throw 'Attachment has the wrong file format. Bot expects an .har file.'
        }
        const url = attachment.url

        let body = await axios.get(url).then(res => res.data)

        if(!body.hasOwnProperty('players')){
            throw 'Attachment is missing players array.'
        }

        if(!body.hasOwnProperty('groups')){
            throw 'Attachment is missing groups array.'
        }

        if(body.groups.length > 1){
            throw 'Attachment contains more than one guild.'
        }

        let jsonForFile = {
            members: body.groups[0].names
        }
        
        await writeFileSync(`./storage/${server}.json`,JSON.stringify(jsonForFile))
    }catch(error){
        return 'Error while writing guild: ' + error
    }

    try{
        const data = readFileSync(`./storage/${server}.json`);
        const datajson = JSON.parse(data);
        return `Anzahl an gespeicherten Members: ${datajson.members.length}\nMembers: ${JSON.stringify(datajson.members)}`;
    }catch(error){
        return 'Error while reading guild: ' + error
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('savemembers')
		.setDescription('Überschreibe die Mitglieder einer Gilde. Kann nur von ausgewählten Mitgliedern durchgeführt werden.')
		.setDMPermission(true)
        .addStringOption(option => option
            .setName('server')
            .setDescription('Name des Servers.')
            .setRequired(true)
            .addChoices(...getGuildConfigForChoices()))
        .addAttachmentOption((option) => option
            .setRequired(true)
            .setName("file")
            .setDescription('Der exportierte Scan einer kompletten Gilde.')),
	async execute(interaction) {
        if(userWithSavePermission.includes(interaction.user.id)){
            const server = interaction.options.getString('server');
            const attachment = interaction.options.getAttachment("file");
            await interaction.reply(await handleGuildSaveCommand(server, attachment));
        }else{
            interaction.reply("Ich weiß nicht wer du Lümmel bist, die Chance ist hoch das du hier nichts zu suchen hast. Mach dich vom Aacker oder nerv astro. Danke. ");
        }
	},
};
