const {Client, MessageAttachment, MessageEmbed, Guild} = require('discord.js')
const axios = require('axios')
const bot  = new Client();
const Queue = require('smart-request-balancer');
const CronJob = require('cron').CronJob
const powerDB = require("./models/power-model.js")
const visitorDB = require('./models/visitor-model.js')
const VoiceText = require('voicetext')

const fs = require('fs')
require('ffmpeg')
require('ffmpeg-static')
require('dotenv').config()


// Queue for handling api requests
const queue = new Queue({
    rules: {                     
      common: {                  
        rate: 10,                
        limit: 1,                
        priority: 1,                                           
      }
    },
    default: {                   
      rate: 10,
      limit: 1
    },
    overall: {                   
      rate: 10,
      limit: 1
    },
    retryTime: 10,              
    ignoreOverallOverheat: true  
})

// Compare function to sort
function compare(a, b) {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
  
    // names must be equal
    return 0
}

const PREFIX = '?'

bot.on('ready', async () =>{
    console.log('Exa-Bot Online')
})

const Monado = new CronJob('0 0 0 * * 1', async function(){
    const textChat = await bot.channels.fetch('716015727630483579')
    const monadoVid = new MessageAttachment('https://cdn.discordapp.com/attachments/407627504598253580/760254205868113940/monado.mp4')
    textChat.send(monadoVid)
    console.log('Job: MONADO MONDAYYYY')
})
const ClearVisits  = new CronJob('0 0 * * *', async function(){
    await visitorDB.clearVisitors()
})

Monado.start()
ClearVisits.start()


// Watches chat for keywords to trigger voice clips
bot.on('message',async req => {

    const attachment = new MessageAttachment('https://cdn.discordapp.com/attachments/313148981502935040/697154625815707798/image0.gif');
    const channel = await bot.channels.fetch('716015727630483580');
    const raidChannel = await bot.channels.fetch('747097374312103977')
    const privateChannel = await bot.channels.fetch('766209336615370782')
    let users = Array.from(channel.members.keys());
    let raidUsers = Array.from(raidChannel.members.keys());
    let privateUsers = Array.from(privateChannel.members.keys())
    message = req.content.toLowerCase()

    words = ["mean","bully" , "rude" , "bulli", "rood", 'm e a n']
    words.forEach( e => {
        if(message.includes(e) && req.author.id == 211556765492314112){
            i=0
            console.log('Bullying Sophia')
            while(i<10){
                req.channel.send("<:peepo:738255120554262575>".repeat(10))
                i++
            }
            
        }
    })
    // list of clip names
    powerDB.checkPower().then(res => {
        if(res["Power"] === true || req.author.id === '59423394055069696'){
            const clips = ['silence','blade','death','butter','frog','women', 'scissors','eekum bokum','really gay','law','gay','center', 'news', 'army', 'leader', 'yeet', 'lid', 'console', 'joker', 'rainbow', 'reyn', 'head', 'good thing', 'tough', 'jump', 'ooph', 'oof', 'vsauce', 'mario','hungry', 'ride wife', 'king','love']
            clips.forEach( async e =>{
                if(message.includes(e) && req.author.id != 738254569238167643){
                    if(e === 'eekum bokum'){
                        req.channel.send("<a:mumbo:751666416335192114> *eekum bokum* <a:mumbo:751666416335192114>".repeat(3))
                    }
                    if(privateUsers.length >= 1 && req.author.id === '59423394055069696'){
                        const conn = await privateChannel.join();
                        const dispatcher = conn.play(`./assets/${e}.mp3`);
            
                        dispatcher.on('start', () => {
                            console.log('Clip:', e);
                        });
            
                        dispatcher.on('finish', () => {
                            privateChannel.leave()
                        });
                        dispatcher.on('error', console.error);
                    }  
                    else if(raidUsers.length >= 1 && req.author.id === '59423394055069696'){
                        const conn = await raidChannel.join();
                        const dispatcher = conn.play(`./assets/${e}.mp3`);
            
                        dispatcher.on('start', () => {
                            console.log('Clip:', e);
                        });
            
                        dispatcher.on('finish', () => {
                            raidChannel.leave()
                        });
                        dispatcher.on('error', console.error);
                    }  
                    else if(users.length >= 1){
                        const conn = await channel.join();
                        const dispatcher = conn.play(`./assets/${e}.mp3`);
            
                        dispatcher.on('start', () => {
                            console.log('Clip:', e);
                        });
            
                        dispatcher.on('finish', () => {
                            channel.leave()
                        });
                        dispatcher.on('error', console.error);
                    }  
                }
            })
        }   
    }).catch(err => console.log(err))

    if(req.content.includes("NO MORE GAMES") && req.author.id === '59423394055069696' && users.length >= 1){
        req.guild.me.setNickname('Byakko')
        bot.user.setAvatar ('https://static.wikia.nocookie.net/finalfantasy/images/0/0a/FFXIV_Byakko.png/revision/latest/scale-to-width-down/960?cb=20171221100458')
        const conn = await channel.join();
        const dispatcher = conn.play(`./assets/NO MORE GAMES.mp3`);
            
        dispatcher.on('start', () => {
            console.log('Clip: NO MORE GAMES');
        });
        dispatcher.on('finish', () => {
            channel.leave()
        })
        setTimeout(()=>{
            for( const member of channel.members){
                member[1].voice.setChannel(null)
            }
        }, 3000)
        dispatcher.on('error', console.error);
        
        setTimeout(()=>{
            req.guild.me.setNickname("Reyn")
            bot.user.setAvatar ('https://static.wikia.nocookie.net/xenoblade/images/c/cd/Reyn_pic.png/revision/latest?cb=20170712150058')
        }, 60000)
    }
 
    if(req.content.includes("uptime")){
        console.log('Uptime')
        req.channel.send(attachment)
    }
})

// Monitors members in voice, and handles assignment of voicechatter role
bot.on('voiceStateUpdate', async (oldMember, newMember) => {
    const channel = await bot.channels.fetch('716015727630483580');
    const raidChannel = await bot.channels.fetch('747097374312103977');
    const privateChannel = await bot.channels.fetch('766209336615370782');
    const textChannel = await bot.channels.fetch('753831898559545384');
    const role = channel.guild.roles.cache.find(role => role.name === 'Voice');
    const serverMembers = []
    const channelMembers = []
    console.log('Action: Adding and Removing Roles')
    for(let e of channel.guild.members.cache.keys()){
        serverMembers.push(e)
    }
    for(let e of raidChannel.members.keys()){
        channelMembers.push(e)
    }
    for(let e of privateChannel.members.keys()){
        channelMembers.push(e)
    }
    for(let i of channel.members.keys()){
        channelMembers.push(i)
    }
    if(channelMembers.length === 0){
        console.log('Action: Channel empty clearing Voice Chatter.')
        textChannel.bulkDelete(100, true)                      
        }
    for(let i of serverMembers){
        if(i){
            let member = channel.guild.members.cache.get(i)
            if(channelMembers.includes(i)){
                member.roles.add(role)
            } else {
                member.roles.remove(role)
            }
        }
    }
})

// Time adjusted TTS greeter
bot.on('voiceStateUpdate', async (oldMember, newMember) => {
    console.log(newMember.id)
    const visitors = await visitorDB.getVisitors()
    const channelID = '716015727630483580'
    const channel = await bot.channels.fetch(channelID)
    let date = new Date().getHours()
    if(newMember.id === '211556765492314112') date += 6
    else if(newMember.id === '200420433118363648') date += 14
    if(date >= 24) date-=24
    const Morning = [5,6,7,8,9,10,11]
    const Afternoon = [12,13,14,15,16,17,18]
    const Evening = [19,20,21,22,23,0]
    const Night = [1,2,3,4]
    let phrase = ''
    if(Morning.includes(date)) phrase = 'Ohayou'
    if(Afternoon.includes(date)) phrase = 'Konnichiwa'
    if(Evening.includes(date)) phrase = 'Konbanwa'
    if(Night.includes(date)) phrase = 'Fucking go to bed'
    if(newMember.channelID === channelID && oldMember.channelID !== channelID && newMember.id != '738254569238167643'){
        for(const visitor of visitors){ if(visitor.UID === newMember.id) return }
        visitorDB.addVisitor(newMember.id).then(res => console.log(res)).catch(err => console.log(err))
        const user = await newMember.guild.members.fetch(newMember.id)
            voice = new VoiceText('sf3u5x3k31ybx269')
            voice
                .speaker(voice.SPEAKER.HIKARI)
                .emotion(voice.EMOTION.HAPPINESS)
                .emotion_level(voice.EMOTION_LEVEL.HIGH)
                .speak(`${phrase} ${user.user.username} san   `, async (e, buf) => {
                    if(e) console.error(e)
                    await fs.writeFile('./tes.wav', buf, 'binary', e => console.log(e))
                    const connection = await channel.join();
                    const dispatcher = connection.play('tes.wav');
                    dispatcher.on('start', () => {
                        console.log('Playing entrance clip');
                    });
                    dispatcher.on('finish', () => {
                        channel.leave()
                    });
                    dispatcher.on('error', console.error);
                } )        
    }  
})

// Initial D-tention bot
bot.on('voiceStateUpdate', async (oldMember, newMember) => {
    const channel = await bot.channels.fetch('722372816619569263');
    const choices = ['./assets/deja.mp3','./assets/burn.mp3','./assets/kill.mp3','./assets/rem.mp3','./assets/gas.mp3','./assets/night.mp3','./assets/run.mp3']
    const index = Math.floor(Math.random() * choices.length)
    let newUserChannel = newMember.channel
    if(newMember.channel != null){
        if(newUserChannel.name === 'Initial D-tention'){
            const connection = await channel.join();
            let users = Array.from(channel.members.keys());
            if(users.length > 1){
                const dispatcher = connection.play(choices[index]);
    
                dispatcher.on('start', () => {
                    console.log('audio.mp3 is now playing!', choices[index]);
                });
    
                dispatcher.on('finish', () => {
                    console.log('audio.mp3 has finished playing!');
                    channel.leave()
                    let users2 = Array.from(channel.members.keys());
                    users2.forEach(async (e) => {
                        let current = await bot.user.fetch(e)
                        newMember.guild.member(current.id).voice.setChannel(716015727630483580)
                    })
                });
                dispatcher.on('error', console.error);
            }  
        }
    }
    if(oldMember.channel != null){
        if(oldMember.channel.name === 'Initial D-tention'){
            channel.leave()
        }
    }
})

// Bot Command Switchboard
bot.on( 'message' , async message => {
    let item = message.content.toLowerCase()


    let args = message.content.substring(PREFIX.length).split(" ");


    let outputIDs = []
    const expectedIdsCallback = (ID,name, desc, item, bool, expec) => {
        check = false
        if(bool.toLowerCase() == 'true'){
            check = true
        }

        console.log('ID:', ID, 'remaining:', expec.length, 'name:', name, 'Desc:', desc)
        console.log('expec', expec)

        outputIDs.push({name, has: desc})

        expec.splice(expec.indexOf(ID), 1);
       
        if (expec.length == 0) {

            let exampleEmbed = new MessageEmbed()
            .setColor('#FF4500')

            let i = 0

            message.channel.send(`Here you go these people have "${item}":`)

            for(let member of outputIDs.sort(compare)){
                if(member.has === check){
                    exampleEmbed.addField(member.name, member.has,true)
                    i++
                    if( i>= 25){
                        message.channel.send(exampleEmbed)
                        i= 0
                        exampleEmbed = new MessageEmbed()
                        .setColor('#FF4500')
                    } 
                }
            }
            if( i>0){
                message.channel.send(exampleEmbed)
                i= 0
                exampleEmbed = new MessageEmbed()
                .setColor('#FF4500')
            }  
            outputIDs = []
            expectedIDs = [];          

        }
    };

    const filter = m => m.author.id === message.author.id;

    let collected = {}
    let bool = ''

    
    switch(args[0].toLowerCase()){


        // returns a list of members in ward fc that either do or dont have the queried minion
        case 'minion' :
            message.reply("Specify True or False... Expires in 10s...").then(r => r.delete ({timeout: 10000})).catch(err => console.log(err))
            collected = await message.channel.awaitMessages(filter, { max: 1, time: 10000})
            bool = collected.first().content
            collected.first().delete({timeout: 1000 * 10})
            if(item !== '?minion') {
                const MinSubmit = item.replace("?minion ", "")
                message.channel.send('Please Wait I\'m doing my best...').then( r => r.delete ({timeout: 40000})).catch(err => console.log(err))
                console.log('Action: Searching for', MinSubmit)
                let expectedIDs = [];
                await axios.get('https://xivapi.com/freecompany/9232519973597979666?data=FCM&private_key=73bc4666b8044a95acbe3b469b59c0079beaf9666d164a35a68846fbd4f99f2f')
                .then(members => {
                    members.data.FreeCompanyMembers.forEach(member => {
                            expectedIDs.push(member.ID)
                            queue.request((retry) => axios.get(`https://xivapi.com/character/${member.ID}?data=MIMO&private_key=73bc4666b8044a95acbe3b469b59c0079beaf9666d164a35a68846fbd4f99f2f`)
                            .then(minions => {
                                let hasMinion = false
                                if(minions.data.Minions.length == 0){
                                    if(member.Name == 'Chi Kiba'){
                                        console.log('skip')
                                    }
                                    else if(member.Name == 'Instant Billy'){
                                        console.log('skip')
                                    }
                                    else{
                                        throw 'empty'
                                    }
                                    
                                }
                                for(let min of minions.data.Minions){
                                    if(min.Name.toLowerCase() == MinSubmit){
                                        hasMinion = true
                                    }
                                }
                                if(!hasMinion){
                                    console.log('Name:',member.ID, 'Minions', minions.data.Minions.length)
                                }
                                
                                
                                expectedIdsCallback(member.ID, member.Name, hasMinion ? true : false, MinSubmit, bool, expectedIDs)
                            })
                            .catch(error => {
                                if(error == 'empty'){
                                    console.log('Name:',member.Name, 'empty minion')
                                    return retry()
                                }
                                else if (error.response == undefined){
                                    console.log(error)
                                }
                                else if (error.response.status === 429) {
                                    console.log('Rate Limit Hit, Retrying with ID:', member.ID)
                                    return retry()
                                }
                                
                                expectedIdsCallback(member.ID, member.Name, 'error', MinSubmit, bool)
                                throw error;
                            }), member.ID, 'common');
        
                        })

                })   
                
                
                
            }
            else{
            message.channel.send('Include a Minion to search for').then( r => r.delete ({timeout: 15000})).catch(err => console.log(err))
            }

            break;
        
        // returns a list of members in ward fc that either do or dont have the queried mount
        case 'mount' :
            message.reply("Specify True or False... Expires in 10s...").then(r => r.delete ({timeout: 10000})).catch(err => console.log(err))
            collected = await message.channel.awaitMessages(filter, { max: 1, time: 10000})
            bool = collected.first().content
            collected.first().delete({timeout: 1000 * 10})
            if(item !== '?mount') {
                const MonSubmit = item.replace("?mount ", "")
            
                message.channel.send('Please Wait I\'m doing my best...').then( r => r.delete ({timeout: 40000})).catch(err => console.log(err))

                let expectedIDs = [];
                await axios.get('https://xivapi.com/freecompany/9232519973597979666?data=FCM&private_key=2d365f381e0b4573ba73e18cab4b481f4e9df8895dec44de94a2bfbd10682a6b')
                .then(members => {
                    members.data.FreeCompanyMembers.forEach(member => {
                            expectedIDs.push(member.ID)
                            queue.request((retry) => axios.get(`https://xivapi.com/character/${member.ID}?data=MIMO&private_key=2d365f381e0b4573ba73e18cab4b481f4e9df8895dec44de94a2bfbd10682a6b`)
                            .then(mounts => {
                                let hasMount = false
                                if(mounts.data.Mounts.length == 0){
                                    if(member.Name == 'Chi Kiba'){
                                        // console.log('skip')
                                    }
                                    else if(member.Name == 'Instant Billy'){
                                        // console.log('skip')
                                    }
                                    else{
                                        throw 'empty'
                                    }
                                    
                                }
                                for(let mon of mounts.data.Mounts){
                                    if(mon.Name.toLowerCase() == MonSubmit){
                                        hasMount = true
                                    }
                                }
                                
                                
                                expectedIdsCallback(member.ID, member.Name, hasMount ? true : false, MonSubmit,bool, expectedIDs)
                            })
                            .catch(error => {
                                if(error == 'empty'){
                                    console.log('Name:',member.Name, 'empty mount')
                                    return retry()
                                }
                                else if (error.response == undefined){
                                    // console.log(error)
                                }
                                else if (error.response.status === 429) {
                                // console.log('Rate Limit Hit, Retrying with ID:', member.ID)
                                return retry()
                                }
                                
                                expectedIdsCallback(member.ID, member.Name, 'error', MonSubmit, bool, expectedIDs)
                                throw error;
                            }), member.ID, 'common');
        
                        })

                })
                .catch(err => console.log(err)) 
                
            }
            else{
                message.channel.send('Include a Mount to search for').then( r => r.delete ({timeout: 15000})).catch(err => console.log(err))
            }
            break;
        
        // clears last 100 messages in channel called
        case 'clear' :
            if (message.member.hasPermission("MANAGE_MESSAGES")) {
                console.log('Action: Clearing Messages')
                message.channel.messages.fetch({limit:100})
                .then(fetched => {
                    const notPinned = fetched.filter( fetchedMsg => !fetchedMsg.pinned)
                    message.channel.bulkDelete(notPinned, true)
                   .then(res => {message.channel.send(`Bulk deleted ${res.size} messages`).then( r => r.delete ({timeout: 15000})).catch(err => console.log(err))}) 
                    .catch(err => {
                    message.channel.send("Well you broke something... ").then( r => r.delete ({timeout: 15000})).catch(err => console.log(err)) 
                    console.log(err)})     
                })                  
            }
            else{
                i=0
                while(i<10){
                    message.channel.send("<:peepo:738255120554262575>".repeat(10))
                    i++
                }
            }
            break;
        
        // list of commands
        case 'help' :
            console.log('Action: Offering help')
            message.delete({timeout: 1000 * 20})
            const helpEmbed = new MessageEmbed()
            .setColor('#FFA500')
            .setAuthor('Bot Commands')
            .setTitle('Enter any of the following commands:')
            .setDescription('The prefix for all commands is ? followed by the command (I.E. ?help) Then any parameters required.')
            .addFields(
                {name: '?help', value:['- Returns this reply showing all possible commands','\n']},
                {name: '?minion <arg>', value:['- Returns a list of all members in the ward FC that either do or don\'t have the specified minion','- Takes one argument that is a minion name', '- Example: ?minion Goobbue Sproutling','\n']},
                {name: '?mount <arg>', value:['- Returns a list of all members in the ward FC that either do or don\'t have the specified mount','- Takes one argument that is a mount name', '- Example: ?mount Flying Chair','\n']},
                {name: '?Mincraft', value:['- Return a short embed containing all info regarding Exa\'s Minecraft Server','\n']},
                {name: '?setevent <arg>', value:['- Creates a movie event, cannot be used if one is currently pending', '- Takes a single arguement that is the name of the event.', '- Example: ?setevent The Terminator','\n']},
                {name: '?signup', value:['- Registers you for the current movie if one is pending, cannot use if no movie is pending, or already signed up', '- Will also give you the role required to enter the movie chat channel, and be reminded an hour prior.','\n']},
                {name: '?resolve', value: ['- Ends the current pending movie, and resets back to before it was made','- also removes signed up role from any members with it.', '\n']},
                {name: '?movie', value: ['- Returns the current movie if one is pending','\n']},
                {name: '?clear', value: ['- Clears the channel of messages, Can only be used by Exa.','\n']},
                {name: '?request <arg>', value: ['- Currently being worked on.','\n']}
            )
            message.reply(helpEmbed)
            break;
        
        case 'annoy':  
            if(item !== '?annoy') {   
                item = item.replace("?annoy ", "")

                powerDB.updatePower({"Power": item=="on" ? true : false})
                    .then(res => { message.channel.send(`Voice annoyance is now ${item}`)})
                    .catch(err => console.log(err))
            } else {
                message.channel.send('Please Specify a setting').then( r => r.delete ({timeout: 15000})).catch(err => console.log(err))
            }
            break; 

        // info for minecraft server
        case 'minecraft':
            console.log('Action: Showing Minecraft info')
            message.delete({timeout: 1000 * 20})
            const mineEmbed = new MessageEmbed()
                .setColor('#FFA500')
                .setAuthor('Minecraft Server Info')
                .setDescription('The following info is everything needed to join the server.')
                .addFields(
                    {name: 'MultiMC', value:'https://multimc.org/#Download', inline: true},
                    {name: 'Mod Pack', value: ['All The Mods 6', 'Choose version 1.3.3', 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-6/download/3124239'], inline: true},
                    {name: 'Server Address', value: 'exa-li.com'},
                    {name: 'Set Memory to atleast 7gb', value: 'https://i.imgur.com/VDopARs.png'},
                    {name: 'If you need help ping:', value: '@Exa'}
                )
            message.reply(mineEmbed)
            break;
    }
})

bot.login(process.env.discordAPI)