const { SlashCommandBuilder, ChatInputCommandInteraction, Client} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
    // slash command 的名字
    .setName("抽")
    // slash command 的介紹
    .setDescription("隨機抽一個成員！"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client){
        // 取得所有server成員
        const members = interaction.guild.members.cache;
        if(members.size > 0){
            await interaction.reply({ content: `抽到你了：<@${ members.random().id}>`});
        }
        else{
            await interaction.reply({ content: '沒有可以被抽的人😡'});
        }
    }
}