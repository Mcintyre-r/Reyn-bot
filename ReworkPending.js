//Cron job for movie notification
const movieJob = new CronJob('0 0 19 * * 3', async function(){
    const movieChat = await bot.channels.fetch('761671840845791242')
    movieChat.send('<@&761665699407200286> Movie starting in one hour!')
})

movieJob.start()


switch(args[0].toLowerCase()){
        // creates a movie event 
        case 'setevent':
            movieDB.checkEvent().then(currentEvent => {
                message.reply("Please submit a time... Will expire in 10 seconds..").then(r => r.delete ({timeout: 10000})).catch(err => console.log(err))
                message.channel.awaitMessages(filter, { max: 1, time: 10000}).then(collected => {
                    const time = collected.first().content
                    collected.first().delete({timeout: 1000 * 10})
                    if(currentEvent[0]['Title'] == 'None'){
                        if(item !== '?setevent') {
                            message.delete({timeout: 1000 * 20})
                            const rec = message.content.replace("?setevent ", "")
                            const event = {}
                            event['Title'] = rec
                            event['Time'] = time
                            movieDB.updateEvent(event).then(res => console.log(res)).catch(err => console.log(err))
                            message.reply("Record has been updated").then( r => r.delete ({timeout: 20000})).catch(err => console.log(err)) 
                        }
                        else{
                            message.reply("Please include a title for the event").then( r => r.delete ({timeout: 20000})).catch(err => console.log(err)) 
                        } 
                    } else {
                        message.reply("There is already a pending event").then( r => r.delete ({timeout: 20000})).catch(err => console.log(err))
                    }
                })
            }).catch(err => console.log(err))
            break;
        
        // registers user for movie event, and gives them the appropriate role
        case 'signup':
            // console.log(event)
            movieDB.checkEvent().then(event => {
                let signedup = false
                viewerDB.getViewers().then(res => {
                    for(let viewer of res){
                    if(message.author.id == viewer["UID"]){ 
                        signedup = true
                    }}
                    
                    if(event[0]['Title'] == 'None'){
                        message.reply('There is no event pending atm').then( r => r.delete ({timeout: 20000})).catch(err => console.log(err)) 
                    }
                    else if(signedup == true){
                        message.reply('You are already signed up for this event.').then( r => r.delete ({timeout: 20000})).catch(err => console.log(err))
                    }
                    else {
                            // event['viewer'].push(message.author.id)
                            viewerDB.addViewer(message.author.id).then(res => console.log(res)).catch(err => console.log(err))
                            const user = message.guild.members.cache.get(message.author.id)
                            const role = message.guild.roles.cache.find(role => role.name === 'Signed up for Movie');
                            user.roles.add(role)
                            message.reply("You are registered for the movie").then( r => r.delete ({timeout: 20000})).catch(err => console.log(err)) 

                    }
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
            break;
        
        // clears any pending event and resets roles
        case 'resolve':
            message.delete({timeout: 1000 * 20})
            movieDB.checkEvent().then(event => {
                if(event[0]["Title"] != 'None'){
                    // console.log(message.guild.members.cache.keys())
                    for(let i of message.guild.members.cache.keys()){
                        const user = message.guild.members.cache.get(i)
                        const role = message.guild.roles.cache.find(role => role.name === 'Signed up for Movie');
                        user.roles.remove(role)
                    }
                    
                    movieDB.updateEvent({"Title":"None","Time":"None"}).then(res => console.log(res)).catch(err => console.log(err))
                    viewerDB.clearViewers().then(res => console.log(res)).catch(err => console.log(err))
                    viewerDB.addViewer("59423394055069696").then(res => console.log(res)).catch(err => console.log(err))
                    message.reply("Event has been cleared").then( r => r.delete ({timeout: 20000})).catch(err => console.log(err))
                } else {
                    message.reply("There is no pending event").then( r => r.delete ({timeout: 20000})).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))
            
            break;

        // info about currently pending movie event
        case 'movie':
                message.delete({timeout: 1000 * 20})
                movieDB.checkEvent()
                    .then(res => {
                        if(res[0]['Title'] != 'None'){
                            message.reply(`Upcoming Movie is ${res[0]['Title']}, at ${res[0]['Time']}`).then( r => r.delete ({timeout: 20000})).catch(err => console.log(err))
                            } else {
                                message.reply("There is no pending event").then( r => r.delete ({timeout: 20000})).catch(err => console.log(err))
                            }
                    })  
            break;
                }
