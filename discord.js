const Discord = require('discord.js');
const { token } = require('./token.json');
const fs = require('fs');
const client = new Discord.Client();
console.clear();

// 讀取 bad words JSON 檔案
let badWordsData = JSON.parse(fs.readFileSync('./badwords.json', 'utf8'));
let userBadWordCount = {}; // 記錄使用 bad words 的次數

// 連上線時的事件
client.on('ready', () => {
    if(client.user != null)
        console.log(`Logged in as ${client.user.tag}!`);
    else
        console.log(`Login error, client.user == NULL`);
});

// 當 Bot 接收到訊息時的事件
client.on('message', msg => {
    if(client.user != null && !msg.author.bot) {
        console.log(`${client.user.tag} recieved "${msg.content}" from ${msg.author.tag} at ${msg.channel.id}`);
        
        // 檢查是否包含 bad words
        let containsBadWord = false;
        badWordsData.words.forEach(word => {
            if (msg.content.includes(word)) {
                containsBadWord = true;
                // 記錄到 bot-log 頻道
                let botLogChannel = msg.guild.channels.cache.find(channel => channel.name === "bot-log" && channel.isText());
                if (botLogChannel) {
                    botLogChannel.send(`<@${msg.author.id}> used a bad word: "${word}" in <#${msg.channel.id}>`);
                }
                // 更新使用者 bad words 次數
                if (!userBadWordCount[msg.author.id]) {
                    userBadWordCount[msg.author.id] = 0;
                }
                userBadWordCount[msg.author.id]++;
            }
        });

        

        // ping pong time!
        if (msg.content === 'ping') {
            msg.reply('pong');
        }

        if (msg.content.startsWith('!addbadword ')) {
            let newWord = msg.content.split(' ')[1];
            if (!badWordsData.words.includes(newWord)) {
                badWordsData.words.push(newWord);
                fs.writeFileSync('./badwords.json', JSON.stringify(badWordsData, null, 2));
                msg.reply(`The word "${newWord}" is added`);
            } else {
                msg.reply(`"${newWord}" is already a bad word.`);
            }
        }

        if (msg.content.startsWith('!removebadword ')) {
            let removeWord = msg.content.split(' ')[1];
            if (badWordsData.words.includes(removeWord)) {
                badWordsData.words = badWordsData.words.filter(word => word !== removeWord);
                fs.writeFileSync('./badwords.json', JSON.stringify(badWordsData, null, 2));
                msg.reply(`The word "${removeWord} is removed"`);
            } else {
                msg.reply(`"${removeWord}" is not in the bad words list.`);
            }
        }

        if (msg.content === '!rank') {
            let sortedUsers = Object.entries(userBadWordCount).sort((a, b) => b[1] - a[1]);
            let leaderboard = '素質很好：\n';
            sortedUsers.forEach(([userId, count], index) => {
                leaderboard += `${index + 1}. <@${userId}>: ${count}\n`;
            });
            msg.channel.send(leaderboard);
        }

        // 選擇障礙moment
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
        if(msg.content.includes('評比') && (msg.channel.id === '1234094842695520296' || msg.channel.id === '1266411217610608700')) {
            // ❤️ ⛽ 😮 😭 😆
            // 語錄評比的 channel id: 1234094842695520296
            msg.react('❤️');
            msg.react('⛽');
            msg.react('😮');
            msg.react('😭');
            msg.react('😆');
        }
        if (msg.content.includes('抽')) {
            if (msg.guild) {
                // 獲取所有成員
                msg.guild.members.fetch().then(() => {
                    // @ts-ignore 過濾出非機器人成員
                    let members = msg.guild.members.cache.filter(member => !member.user.bot);
                    
                    if (members.size > 0) {
                        // 隨機選擇一個成員
                        let randomMember = members.random();
                        msg.channel.send(`抽到你了：<@${randomMember.id}>`);
                    } 
                    else {
                        msg.channel.send('沒有可以被抽的人😡');
                    }
                });
            } 
            else {
                msg.channel.send('這個命令只能在伺服器中使用。');
            }
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
                botlog_msg+=`Author: <@${delmsg.author.id}>\nChannel: <#${delmsg.channel.id}>\nCreated Time: ${delmsg.createdAt} \n`;
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