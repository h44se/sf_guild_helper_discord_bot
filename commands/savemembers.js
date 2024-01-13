const { SlashCommandBuilder } = require('discord.js');
const { writeFileSync,readFileSync } = require('../helper/file-utils');
const { userWithSavePermission } = require('../config.json');
const { getGuildConfigForChoices, modifyValueOfArrayElementsWithWrongAmountOfPositions } = require('../helper/utils');
const axios = require('axios');

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

        //Even with the additionalfighters header inside the fight request there will be one player always missing, the one with the highest level. 
        //i don't have the data to see what will happen if multiple players have the same level.. So this whole thing is a bit wonky.. 
        //general idea is as long as this bug will be in the fight: every time we save members we check which one has the highest level 
        //and we store this player additionally to all other members inside the stored json and use this information in checkFight.js to exlclude 
        //this player if wanted. 
        //If we have multiple players with the same level, we will store the first occurance inside the array. I assume the game will do the same.. 
        //and i realy hope the start index is not moving..
        //and if you read this you may think "why is he not checking the body.players array, you can find the level there at body.players[index].save[2]"
        //it is because sftools is not storing the level there for the player who did the scan. The save array is for this player a bit wonky and 
        //i could not find the level.. I could ignore this player instead of doing what i do, but it feels like this is the proper solution, even with its 
        //own problems

        //if you want to ignore this whole thing exclude the option "ignore" in checkFight.js from the SlashCommandBuilder. We still store the player but don't use him

        const playerLevels = body.groups[0].save.slice(64, 114).map(level => level % 1000)
        const playerIndexWithHighestLevel = playerLevels.indexOf(Math.max(...playerLevels))

        let jsonForFile = {
            members: body.groups[0].names,
            memberWithHighestLevel: body.groups[0].names[playerIndexWithHighestLevel]
        }
        //console.log(`player with max level: ${jsonForFile.memberWithHighestLevel} with level ${playerLevels[playerIndexWithHighestLevel]}`)
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
