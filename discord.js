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
    }
});

client.on('messageDelete', delmsg => {
    if(delmsg.author != null){
        console.log(`${delmsg.author.tag} is trying to delete "${delmsg.content}"`);
        delmsg.channel.send(`<@${delmsg.author.id}> is trying to delete the message "${delmsg.content}", always think before you send.`);
    }
    else
        console.log(`Error at client.on('messageDelete')`)
})

client.login(token);