const { SlashCommandBuilder } = require('discord.js');
const { readFileSync } = require('../../../helper/file-utils');
const { getGuildConfigForChoices } = require('../../../helper/utils');
const axios = require('axios');

function getArrayForMembersWhoMissedFights(guildJson, historyData){
    let linesCounted = 0;
    const nameCount = {};
    // Zeilen aufteilen und durchgehen
    const lines = historyData.split('\n');
    lines.forEach(line => {
        linesCounted++;
        // Überprüfen, ob die Zeile "50/50" enthält
        if (line.includes('50/50')) {
        return; // Zeile ignorieren
        }

        // Namen aus der Zeile extrahieren
        const match = line.match(/: (.*?)(?:\r|$)/);
        if (match) {
        const names = match[1].split(', ');

        // Normalisiere und zähle Namen, Ausnahme für Namen mit "*"
        names.forEach(name => {
            const normalizedName = name.trim(); // Leerzeichen am Anfang und Ende entfernen
            if (!normalizedName.endsWith('*')) {
            nameCount[normalizedName] = (nameCount[normalizedName] || 0) + 1;
            }
        });
        }
    });

    // Überprüfen, ob die Namen in members vorhanden sind
    const resultWithMembers = {};
    Object.keys(nameCount).forEach(name => {
        if (guildJson.members.includes(name)) {
        resultWithMembers[name] = nameCount[name];
        }
    });

    // Sortieren nach Häufigkeit
    const sortedResult = Object.entries(resultWithMembers)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
        }, {});

    return {
        fightsCounted: linesCounted,
        sortedResult
    };
}

async function handleCheckHistoryCommand(server, attachment){
    try{
        const url = attachment.url;
        let body = await axios.get(url).then(res => res.data);

        const data = readFileSync(`./storage/${server}.json`);
        const guild = JSON.parse(data);
       
        let result = getArrayForMembersWhoMissedFights(guild, body);
        //build response weil schöner so
        let reply = `Ergebnis:\nKämpfe erfasst: ${result.fightsCounted}\n`;
        Object.keys(result.sortedResult).forEach(member => {
            reply += `${member}: ${result.sortedResult[member]} (${Math.round((result.sortedResult[member] / result.fightsCounted) * 100)}%)\n`;
        });

        return reply;
    }catch(error){
        return 'Error while writing guild: ' + error;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkhistory')
		.setDescription('Überprüfe die Kampfhistorie einer Gilde und listet auf wie häufig welches Gildenmitglied fehlte.')
		.setDMPermission(true)
        .addStringOption(option => option
            .setName('server')
            .setDescription('Name des Servers.')
            .setRequired(true)
            .addChoices(...getGuildConfigForChoices())
            )
        .addAttachmentOption((option) => option
            .setRequired(true)
            .setName("file")
            .setDescription(".txt mit den zu überprüfenden Kämpfen aus #kampfbeteiligung")),
	async execute(interaction) {
        const server = interaction.options.getString('server');
        const attachment = interaction.options.getAttachment("file");
        await interaction.reply(await handleCheckHistoryCommand(server, attachment));
	},
};
