const Discord = require('discord.js');
const { token } = require('./token.json');
const client = new Discord.Client();
console.clear();

// 連上線時的事件
client.on('ready', () => {
    // @ts-ignore
    console.log(`Logged in as ${client.user.tag}!`);
});

// 當 Bot 接收到訊息時的事件
client.on('message', msg => {
    // @ts-ignore
    console.log(`${client.user.tag} recieved "${msg.content}" from ${msg.author}`);
    // 如果訊息的內容是 'ping'
    if (msg.content === 'ping') {
        // 則 Bot 回應 'Pong'
        msg.reply('pong');
        console.log('ping');
    }
    if (msg.content.includes('選哪個')) {
        msg.reply('都不選');
        console.log('choice');
    }
});

client.login(token);