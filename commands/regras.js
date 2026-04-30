const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regras')
    .setDescription('Envia as regras do servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('<:sgbrust:1499168270224457859> Server Rules - Stumble Brust')
      .setColor(0x2b2d31)
      .setDescription('<:warning:1499180481441300650> *- These rules exist... *- These rules exist to maintain a safe, organized, and friendly environment for everyone. Breaking the rules may result in penalties, including server or in-game bans.*')
      .addFields(
        {
          name: '<:95319moderator:1490407246713327767> Staff Handles Conflicts',
          value: '*If a disagreement arises, avoid public arguments. Contact a moderator and wait for an official resolution. Mini-modding (acting as staff) is not allowed.*',
        },
        {
          name: '<:WazeWOW:1490407335456407783> Communicate Respectfully',
          value: '*Offensive messages, spam, or low-effort content are not allowed. Everyone should express themselves clearly, respectfully, and positively.*',
        },
        {
          name: '🔒 Privacy Protection',
          value: '*Do not share or request personal information — including real names, contacts, locations, or social media profiles. Violations will be taken seriously.*',
        },
        {
          name: '<:Tournament_1:1490407233085898882> Follow Event Rules',
          value: '*By joining server events, you agree to follow their specific rules. Cheating or unsportsmanlike behavior will result in disqualification and possible penalties.*',
        },
        {
          name: '<:created:1499169609100824616> Promotion Only with Permission',
          value: '*Sharing links, servers, products, or social media is allowed only with staff approval. Unauthorized posts will be removed.*',
        },
        {
          name: '🔵 Discord Rules Also Apply',
          value: '*All members must follow Discord\'s **Terms of Service** and **Community Guidelines**. Violations may lead to actions inside or outside the server.*',
        },
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Discord Terms of Service')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/terms'),
      new ButtonBuilder()
        .setLabel('Community Guidelines')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/guidelines'),
    );

    await interaction.reply({ content: '✅ Regras enviadas!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};