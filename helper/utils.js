const { guilds } = require('../config.json');
const { startOfWeek, endOfWeek, format } = require('date-fns');

function getGuildConfigForChoices(){
    let arrayWithKeyValue = [];
    if(guilds.length <= 0){
        return arrayWithKeyValue
    } 

    guilds.forEach((guildIdentifier)=>{
        arrayWithKeyValue.push({name: guildIdentifier, value: guildIdentifier})
    })

    return arrayWithKeyValue
}

function getMondayAndSunday() {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 }); 
    const sunday = endOfWeek(today, { weekStartsOn: 1 });

    return { monday, sunday };
}

function getFormattedMondeyAndSunday(formatString = 'dd.MM.'){
    const { monday, sunday } = getMondayAndSunday();
    const mondayFormatted = format(monday, formatString);
    const sundayFormatted = format(sunday, formatString);

    return {mondayFormatted, sundayFormatted}
}

function modifyValueOfArrayElementsWithWrongAmountOfPositions(array) {
    return array.map(number => {
      const numberString = number.toString();
        if (numberString.length === 4) {
        return parseInt(numberString.substring(1));
      }
        return number;
    });
  }


module.exports = {
    getGuildConfigForChoices: getGuildConfigForChoices,
    getFormattedMondeyAndSunday: getFormattedMondeyAndSunday,
    modifyValueOfArrayElementsWithWrongAmountOfPositions: modifyValueOfArrayElementsWithWrongAmountOfPositions
}