const { startService } = require('./services/discord');
const {token, clientid} = require('./config.json');

if(token !== 'add the token from the discord bot' && token.length > 5 && 
clientid !== '"add the clientid from the discord bot' && clientid.length > 5){
    startService(token, clientid)
}else{
    console.error('Invalid token and or clientId given. Please check config.json.')
}
