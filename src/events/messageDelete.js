const { Events, Message} = require("discord.js");

module.exports = {
    name: Events.MessageDelete,
    /**
     * @param {Message} msg
     * @param {Client} client
     */
    async execute(delmsg, client) {
        if(delmsg.author == null){
            console.log(`Error at client.on('messageDelete')`);
            return
        }

        console.log(`${delmsg.author.tag} had delete "${delmsg.content}"`);
        delmsg.channel.send(`<@${delmsg.author.id}>  刪...又刪訊息！`);
        
        if(delmsg.guild == null) return;

        let TargetChannel = delmsg.guild.channels.cache.find(channel => channel.name === "bot-log" && channel.type === 'text');
        if (TargetChannel && TargetChannel.isText()) {
            let botlog_msg=`**Deleted Message Log :**\n`;
            botlog_msg+=`Author: ${delmsg.author.tag}\nChannel: <#${delmsg.channel.id}>\nCreated Time: ${delmsg.createdAt} \n`;
            botlog_msg+=`================================\n${delmsg.content}\n================================\n`;
            (TargetChannel).send(botlog_msg);
        }
        else {
            console.log(`'bot-log' channel isn't found`);
            let botlog_msg=`**Deleted Message Log :**\n`;
            botlog_msg+=`Author: ${delmsg.author.tag}\nChannel: <#${delmsg.channel.id}>\nCreated Time: ${delmsg.createdAt} \n`;
            botlog_msg+=`================================\n${delmsg.content}\n================================\n`;
            console.log(botlog_msg);
        }
    },
};