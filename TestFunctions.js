// test role handler for other bot
bot.on('raw', async (packet) => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t) || packet.d.message_id !== '791040740268179517') return;
    
    const channel = await bot.channels.fetch(packet.d.channel_id);
    const message = await channel.messages.fetch(packet.d.message_id);
    const roles = {
        '791016914704269317' : 'test1',
        '751666416335192114' : 'test2',
        '738255120554262575' : 'test3',
    }
    const keys = Object.keys(roles)

    if(!keys.includes(packet.d.emoji.id)){
        message.reactions.cache.each( react =>{
            if(!keys.includes(react._emoji.id)){
                react.remove()
            }
        })
        packet.t === 'MESSAGE_REACTION_ADD' ? message.reactions.cache.get(packet.d.emoji.id).remove().catch(error => console.error('Failed to remove reactions: ', error)): null;
        return;
    }

    const user = await message.guild.members.fetch(packet.d.user_id)
    const role = message.guild.roles.cache.find(role => role.name === roles[packet.d.emoji.id]);
    if(packet.t === 'MESSAGE_REACTION_ADD'){
        user.roles.add(role)
    } else if (packet.t === 'MESSAGE_REACTION_REMOVE'){
        user.roles.remove(role)
    }

});



switch(args[0].toLowerCase()){
    // test for role reaction for other bot
    case 'reaction':
        message.delete({timeout: 1000 * 20})
        console.log('Action: Showing Reaction info')
        const reactEmbed = new MessageEmbed()
            .setColor('#FFA500')
            .setAuthor('Role Reaction setup')
            .setDescription('React to this message to obtain the following roles \n')
            .addFields(
                {name: '<a:myDoge:791016914704269317> : to become as Dog', value:'--', inline: false},
                {name: '<a:mumbo:751666416335192114> : to become as Mumbo', value:'--', inline: false},
                {name: '<:peepo:738255120554262575> : to become as Peepo', value:'--', inline: false},
            )
        message.channel.send(reactEmbed).then( mes => {
            console.log(mes)
            mes.react(message.guild.emojis.cache.get('791016914704269317'))
            mes.react(message.guild.emojis.cache.get('738255120554262575'))
            mes.react(message.guild.emojis.cache.get('751666416335192114'))
        })
    break;



    // test for fishing timer on  other bot
    case 'whenfish':
        message.delete({timeout: 1000 * 20})
        const time = new Date()
        const hour = time.getHours()%2
        const minute = 60-time.getMinutes()
        console.log(hour, minute)
        let hourString = ''
        let minuteString = ''
        if(hour) hourString = `1 hour ${minute? '' : 'and'}`
        if(minute) minuteString = `${minute} ${minute === 1 ? 'minute': 'minutes'} `
        if(!hour && !minute){ message.reply(`Fishing boat leaving now`) }
        else(message.reply(`Next fishing boat leaving in ${hourString} ${minuteString}`).then(r => r.delete({timeout: 20000})).catch(err => console.log(err)))
        break;
}
