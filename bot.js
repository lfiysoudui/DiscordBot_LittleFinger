const Discord = require('discord.js');
const { token } = require('./token.json');
const fs = require('fs');
const client = new Discord.Client();

// 讀取 bad words JSON 檔案
let badWordsData = JSON.parse(fs.readFileSync('./badwords.json', 'utf8'));
// 讀所有圖片 csvQ
const csv = require('csv-parser');
const path = require('path');
const directoryPath = path.join(__dirname, './image_data');
let image_names = []
let image_links = []
fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory', err);
      return;
    }
    // Filter for CSV files and process each
    files.filter(file => file.endsWith('.csv')).forEach(file => {
      const rows = [];
      fs.createReadStream(path.join(directoryPath, file))
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', () => {
            rows.forEach(row => {
                image_names.push(row.name);
                image_links.push(row.link)
            })
        });
    });
});

//找適合的回應圖片
function LCS_len(X, Y){
  const m = X.length;
  const n = Y.length;
  const L = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (X[i - 1] === Y[j - 1]) {
        L[i][j] = L[i - 1][j - 1] + 1;
      } else {
        L[i][j] = Math.max(L[i - 1][j], L[i][j - 1]);
      }
    }
  }
  return L[m][n];
}
function find_image_reply(message_content) {
    const n=image_names.length;
    let mx_lcs_len=0;
    let mxi = 0;
    for (let i = 0; i < n; i++) {
        let lcs_len=LCS_len(message_content, image_names[i]);
        if(lcs_len>=mx_lcs_len){
            mx_lcs_len=lcs_len;
            mxi=i;
        }
    }
    if((mx_lcs_len>=5 && mx_lcs_len*2 > message_content.length) || mx_lcs_len==message_content.length){
        return image_links[mxi];
    }
    return null;
}

// 連上線時的事件
client.on('ready', () => {
    if(client.user != null){
        console.log(`Logged in as ${client.user.tag}!`);
    }
    else
        console.log(`Login error, client.user == NULL`);
});

// 當 Bot 接收到訊息時的事件
client.on('message', msg => {
    if(client.user != null && !msg.author.bot) {
        // console.log(`${client.user.tag} recieved "${msg.content}" from ${msg.author.tag} at ${msg.channel.id}`);

        // ping pong time!
        if (msg.content === 'ping') {
            msg.reply('pong');
        }
        
        //* 素質排行
        // 檢查是否包含 bad words
        let containsBadWord = false;
        if (!msg.content.includes('$rank') && msg.channel.id != '1234094842695520296' && msg.channel.id != '1226539076224811008' && msg.channel.id != '1266411217610608700')
            badWordsData.words.forEach(word => {
                if (msg.content.includes(word) && msg.guild) {
                    containsBadWord = true;
                    msg.channel.send(`<@${msg.author.id}>素質真差`);
                    // 記錄到 bot-log 頻道
                    let botLogChannel = msg.guild.channels.cache.find(channel => channel.name === "bot-log" && channel.isText());
                    if (botLogChannel && botLogChannel.isText()) {
                        botLogChannel.send(`<@${msg.author.id}> used a bad word: "${word}" in <#${msg.channel.id}>`);
                    }
                    // 更新使用者 bad words 次數
                    if (!badWordsData.count[msg.author.id]) {
                        badWordsData.count[msg.author.id] = 0;
                    }
                    badWordsData.count[msg.author.id]++;
                    fs.writeFileSync('./badwords.json', JSON.stringify(badWordsData, null, 2));
                }
            });
        if (msg.content.startsWith('$rank')) {
            let command
            if (msg.content == '$rank') command = 'help'
            else command = msg.content.split('rank ')[1]
            console.log(`get command rank ${command}`)
            // 增加素質詞彙
            if (command.startsWith('add ')) {
                let newWord = command.split(' ')[1];
                if (!badWordsData.words.includes(newWord)) {
                    badWordsData.words.push(newWord);
                    fs.writeFileSync('./badwords.json', JSON.stringify(badWordsData, null, 2));
                    msg.reply(`The word "${newWord}" is added`);
                } else {
                    msg.reply(`"${newWord}" is already a bad word.`);
                }
            }
            // 去除素質詞彙
            else if (command.startsWith('remove ')) {
                let removeWord = command.split(' ')[1];
                if (badWordsData.words.includes(removeWord)) {
                    badWordsData.words = badWordsData.words.filter(word => word !== removeWord);
                    fs.writeFileSync('./badwords.json', JSON.stringify(badWordsData, null, 2));
                    msg.reply(`The word "${removeWord} is removed"`);
                } else {
                    msg.reply(`"${removeWord}" is not in the bad words list.`);
                }
            }
            else if (command == 'words') {
                let words = badWordsData.words;
                let buf = "```\n";
                words.forEach(word => {buf += `${word},`});
                buf = buf.substring(0, buf.length - 1);
                buf += "\n```";
                msg.channel.send(buf);
            }
            else if (command == 'list') {
                let words = badWordsData.words;
                let buf = "```\n";
                words.forEach(word => {buf += `${word}, `});
                buf = buf.substring(0, buf.length - 2);
                buf += "\n```";
                msg.channel.send(buf);
            }
            else if (command == 'show') {
                let sortedUsers = Object.entries(badWordsData.count).sort((a, b) => b[1] - a[1]);
                let leaderboard = '素質很好：\n';
                sortedUsers.forEach(([userId, count], index) => {
                    leaderboard += `${index + 1}. <@${userId}>: ${count}\n`;
                });
                msg.channel.send(leaderboard);
            }
            else {
                const helpmessage = "```\n$rank:\n    add <word>:新增詞語\n    remove <word>:刪除詞語\n    list:列出詞語\n    show:列出完整素質排行榜\n素質排行:展示素質排行前10名\n```"
                msg.channel.send(helpmessage)
            }
        }
        // 查看素質排行
        if (msg.content === '素質排行') {
            let sortedUsers = Object.entries(badWordsData.count).sort((a, b) => b[1] - a[1]);
            let leaderboard = '素質很好：\n';
            for (let i = 0; i < 10 && i < sortedUsers.length; i++) {
                const [userId, count] = sortedUsers[i];
                leaderboard += `${i + 1}. <@${userId}>: ${count}\n`;
            }
            msg.channel.send(leaderboard);
        }

        //* 選擇障礙moment
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
        //* 語錄評比
        if(msg.content.includes('評比') && (msg.channel.id === '1234094842695520296' || msg.channel.id === '1266411217610608700')) {
            // ❤️ ⛽ 😮 😭 😆
            // 語錄評比的 channel id: 1234094842695520296
            msg.react('❤️');
            msg.react('⛽');
            msg.react('😮');
            msg.react('😭');
            msg.react('😆');
        }
        //* 抽人
        if (msg.content.includes('抽一個人') || msg.content == '抽') {
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
        //* 搜尋圖片
        if (msg.content.length > 0) {
            let link = find_image_reply(msg.content);
            if (link != null) {
                msg.channel.send(link);
            }
        }
    }
});

client.on('messageDelete', delmsg => {
    if(delmsg.author != null && !delmsg.author.bot){
        console.log(`${delmsg.author.tag} had delete "${delmsg.content}"`);
        delmsg.channel.send(`<@${delmsg.author.id}>  刪...又刪訊息！`);
        // if(delmsg.guild != null){
        //     let TargetChannel = delmsg.guild.channels.cache.find(channel => channel.name === "bot-log" && channel.type === 'text');
        //     if (TargetChannel && TargetChannel.isText()) {
        //         let botlog_msg=`**Deleted Message Log :**\n`;
        //         botlog_msg+=`Author: ${delmsg.author.tag}\nChannel: <#${delmsg.channel.id}>\nCreated Time: ${delmsg.createdAt} \n`;
        //         botlog_msg+=`================================\n${delmsg.content}\n================================\n`;
        //         (TargetChannel).send(botlog_msg);
        //     }
        //     else {
        //         console.log(`'bot-log' channel isn't found`);
        //         let botlog_msg=`**Deleted Message Log :**\n`;
        //         botlog_msg+=`Author: ${delmsg.author.tag}\nChannel: <#${delmsg.channel.id}>\nCreated Time: ${delmsg.createdAt} \n`;
        //         botlog_msg+=`================================\n${delmsg.content}\n================================\n`;
        //         console.log(botlog_msg);
        //     }
        // }
    }
    else
        console.log(`Error at client.on('messageDelete')`)
})

client.login(token);