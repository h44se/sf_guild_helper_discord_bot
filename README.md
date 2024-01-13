# Setup 

0. Install node.js https://nodejs.org/en/download/ or use nvm https://github.com/nvm-sh/nvm
0. get sure it is working with node -v
1. Login into https://discord.com/developer
2. Click "new Application"
3. Click OAuth2
4. Copy ClientID
5. Click Bot
6. Click "Reset Token"
7. Copy Token
8. Change Name and Avatar from Bot if you want to
9. Scroll down and activate "Message Content Intent"
10. Scroll further down and Activate "Use Slash Commands" and "Send Messages" in "Test Permissions" and copy the Permission Integer 
11. Copy config.json.example to config.json
12. Paste ClientID and Token to the desired fields
13. Add in Guild Array one ore more guilds you want to handle
14. Go to your own discord profile, right click -> Copy UserID and paste the id into userWithSavePermission
15. save config.json
16. `npm install` 
17. `npm run start` 
18. wait till you see something like 
```
Got command: checkfight
Got command: checkhistory
Got command: getpreset
Got command: listmembers
Got command: savemembers
Started refreshing 5 application (/) commands.
Successfully reloaded 5 application (/) commands.
discord | Ready! Logged in as <yourbotname>#0038
```
19. Invite the bot to your own server, use the following Link for this:
https://discord.com/api/oauth2/authorize?client_id=<clientid>&permissions=<permissions from step 10>&scope=bot%20applications.commands

ATTN: It may take a few minutes till the commands are visible or get changed after changes in the code. Sometimes it also helps to restart the discord client.

# Save Guild Members
1. Go to https://sftools.mar21.eu/ -> Statistics -> Files
2. Press Import from Game
3. Add your own credentials and select as Capture mode "Capture own + guild characters"
4. Wait till the scan is done
5. Select the newly done Scan and press "Export selected", select "JSON File" and press Export (It does not matter for the bot if you export only public data)
6. Go to your Discord Server and write into the chat /savemembers
7. Select the guild you want to override 
8. Select the json file you exported earlier from sftools
9. press enter
10. After a short moment you should get an answer with the amount of found members and an array with all of them
11. If you don't trust the output you can verify that the members got saved with the /listmembers command or by checking ./storage/<guild>.json

ATTN: You need to repeat this every time the members change in your guild.

# checkfight
1. Open the game
2. open the dev tools and open the "Network" Tab
3. Navigate to the fight mails
4. select the fight you want to check
5. Clear in dev tools -> network the complete log
6. press "show combat" in game
7. save the requests as .har file
8. Open Discord and go to the channels your bot lives
9. write /checkfight , select an guild and select the created .har file and press enter
10. After a short moment you should see something like 
```
Von 50 Mitgliedern wurden nur 47 erkannt.
Es fehlten: Karondor, TankHulk, Lasresvese
```

Important: Since the addition of the fightadditionalplayers header inside the fight request, the player with the highest level will not be in this list if your guild is strong enough and he does not need to fight. For this reason we store the player with the highest level additionally to all players when using /savemembers and using this info in /checkfight if ignore is set to true. 
This is kinda experimental at this point because i'm not entierly sure how the game handles this when multiple players will have the same level.. but i am optimistic that the current solution is also suitable for this

# checkhistory
Just a small helper command for myself to check how often people were not able to press two fucking buttons.. Input is a .txt file which looks like this:
```
Mo: JustChris, Chris, WeißerAdler, oNxKz, Vinux42
Di: Fitsch13, Meechy, InTrALeX, VivatKaczy
Mi: oNxKz, Meechy, InTrALeX, det0xka
Do: Nightdracon, oNxKz, Meechy, InTrALeX, Vinux42
Mo: Shanks, Lasresvese, Vinux42
Di: nein, Crankiee, oNxKz
Mi: Vinux42
```
Each line represents one fight, and as output you get something like
```
Ergebnis:
Kämpfe erfasst: 35
Vinux42: 8 (23%)
Lasresvese: 7 (20%)
TankHulk: 7 (20%)
InTrALeX: 6 (17%)
```
Which represents how often members did not helped in guild fights. Only guild members who are currently in ./storage.<guild>.json get listed

# getpreset
Another small helper, create my preset message which i can copy&paste into our designated discord channel to monitor the fight activity. Dates get adjusted automatically.