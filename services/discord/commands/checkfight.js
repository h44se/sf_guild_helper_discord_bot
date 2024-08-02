const { SlashCommandBuilder } = require('discord.js');
const { readFileSync } = require('../../../helper/file-utils');
const { getGuildConfigForChoices } = require('../../../helper/utils');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

function findFightHeaders(obj, result = []) {
    for (const key in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          findFightHeaders(value, result);
        } else if (key === 'text' && typeof value === 'string' && value.startsWith('fightheader')) {
          result.push(value);
        }
      }
    }
    return result;
  }

function getFightOpponent(fight){
    //split up complete fight into one before fightgroups and one after fightgroup
    let splitted = fight.split("&fightgroups.r:");
    //split up the part where we begin with the fightgroup into more parts,
    //with the target to get only the fight participants
    let group = splitted[1].split("&");
    //split up participants 
    // -> 13,34,guild1,guild2 into [13, 34, guild1, guild2]
    let splitted_group = group[0].split(",");
    //return last guild as this should always the opponent
    return splitted_group.at(-1);
}

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

        let entries = response["log"]["entries"];
        let fights = findFightHeaders(entries);

        let result = "";
        let count = 1;
   
        for(const fight of fights){
            const missingMembers = guild.members.filter(member => {
                if(ignore && member == guild.memberWithHighestLevel){
                    return false;
                }
                return !(fight.includes(`,${member},`) || fight.includes(`/${member}/`));
            });
            result += `\n\n#${count++} gegen ${getFightOpponent(fight)}:`;
            result += `\nVon ${guild.members.length} Mitgliedern wurden nur ${guild.members.length - missingMembers.length} erkannt.\nEs fehlten: ${missingMembers.join(', ')}`;
        }
       
        return result;
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
        let result = await handleCheckFightCommand(server, attachment, ignore);
        if(result.length >= 2000){
            const timestamp = Date.now();
            const fileName = `result-${timestamp}.txt`;
            const filePath = path.join(__dirname, fileName);
            fs.writeFileSync(filePath, result);
            try{
                await interaction.reply({
                    content: 'Das Ergebnis ist zu lang, um es direkt anzuzeigen. Hier ist eine Datei mit dem vollständigen Ergebnis:',
                    files: [filePath]
                });
            } finally {
                fs.unlinkSync(filePath);
            }

            
        }else{
            await interaction.reply(result);
        }
        
	},
};
