const { SlashCommandBuilder } = require('discord.js');
const { getFormattedMondeyAndSunday } = require('../helper/utils');

function generatePreset(){
    const { mondayFormatted, sundayFormatted } = getFormattedMondeyAndSunday();  
    
    let preset = 
`\`\`\`
***___Täglicher Angriff (10-20 Uhr) ${mondayFormatted} - ${sundayFormatted}___***
Mo: 
Di: 
Mi: 
Do: 
Fr: 
Sa: 
So: 
    
***___Nächtlicher Angriff (22-8 Uhr)  ${mondayFormatted} - ${sundayFormatted}___***
Mo: 
Di: 
Mi: 
Do: 
Fr: 
Sa: 
So:  
    
Info:
- \\* hinter einen Namen bedeutet derjenige ist entschuldigt. Siehe #urlaubtstafel-w57
- Als täglicher Angriff wird der Angriff gewertet der um 20 Uhr endet. Als nächtlicher Angriff wird der Angriff gewertet, der morgens 8 Uhr endet.
- Zur Auswertung wird der vom Spiel generierte Kampfbericht genutzt. In diesem wird jeder vermerkt der sich gemeldet hat, auch wenn man nicht gekämpft hat.\`\`\``;
    return preset;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getpreset')
		.setDescription('Generiere ein Preset für die Kampfberichte dieser Woche.')
		.setDMPermission(true),
	async execute(interaction) {
		await interaction.reply(generatePreset());
	},
};
