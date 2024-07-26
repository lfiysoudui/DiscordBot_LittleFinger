const Discord = require('discord.js');
const { token } = require('./token.json');
const client = new Discord.Client();
console.clear();

// 連上線時的事件
client.on('ready', () => {
    if(client.user != null)
        console.log(`Logged in as ${client.user.tag}!`);
    else
        console.log(`Login error, client.user == NULL`);
});

// 當 Bot 接收到訊息時的事件
client.on('message', msg => {
    if(client.user != null && msg.author.tag != client.user.tag) {
        console.log(`${client.user.tag} recieved "${msg.content}" from ${msg.author.tag} at ${msg.channel.id}`);
        if (msg.content === 'ping') {
            msg.reply('pong');
        }
        if (msg.content.includes('選哪個')) {
            let choiceArr = msg.content.split(' ');
            let target_index = choiceArr.indexOf('選哪個');
            console.log(`target_index = ${target_index},choiceArr = ${choiceArr}`)
            if (target_index > 0) {
                let random_integer = Math.floor(Math.random()*target_index);
                console.log(`${random_integer} are chosen`)
                msg.reply(`選 ${choiceArr[random_integer]}`);
            }
            else
                msg.reply("沒東西要選啥");
        }
        if(msg.content.includes('評比') && msg.channel.id === '1234094842695520296') {
            // ❤️ ⛽ 😮 😭 😆
            // 語錄評比的 channel id: 1234094842695520296
            msg.react('❤️');
            msg.react('⛽');
            msg.react('😮');
            msg.react('😭');
            msg.react('😆');
        }
    }
    if (msg.content.includes('抽選')) {
        if (msg.guild) {
            try {
                // 獲取所有成員
                msg.guild.members.fetch();
                
                // 過濾出非機器人成員
                const members = msg.guild.members.cache.filter(member => !member.user.bot);
                
                if (members.size > 0) {
                    // 隨機選擇一個成員
                    const randomMember = members.random();
                    msg.channel.send(`抽到你了：<@${randomMember.id}>`);
                } else {
                    msg.channel.send('沒有可供抽選的非機器人成員。');
                }
            } catch (error) {
                console.error('抽選成員時發生錯誤:', error);
                msg.channel.send('抽選成員時發生錯誤，請稍後再試。');
            }
        } else {
            msg.channel.send('這個命令只能在伺服器中使用。');
        }
    }
});

client.on('messageDelete', delmsg => {
    if(delmsg.author != null){
        console.log(`${delmsg.author.tag} had delete "${delmsg.content}"`);
        delmsg.channel.send(`<@${delmsg.author.id}> deleted a message, always think before you send.`);
        if(delmsg.guild != null){
            let TargetChannel = delmsg.guild.channels.cache.find(channel => channel.name === "bot-log" && channel.type === 'text');
            if (TargetChannel && TargetChannel.isText()) {
                let botlog_msg=`**Deleted Message Log :**\n`;
                botlog_msg+=`Author: <@${delmsg.author.id}>\nChannel: <#${delmsg.channel.id}>, Created Time: ${delmsg.createdAt}\n`;
                botlog_msg+=`================================\n${delmsg.content}\n================================\n`;
                (TargetChannel).send(botlog_msg);
            }
            else console.log(`'bot-log' channel isn't found`);
        }
    }
    else
        console.log(`Error at client.on('messageDelete')`)
})

client.login(token);