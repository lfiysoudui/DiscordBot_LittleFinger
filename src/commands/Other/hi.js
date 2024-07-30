const { SlashCommandBuilder, ChatInputCommandInteraction, Client} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
    .setName("hi")
    .setDescription("say hi!"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client){
        // console.log(client);
        const res = `Hi, <@${interaction.member.id}>! How are you doing today?`
        await interaction.reply({ content: res})
    }
}