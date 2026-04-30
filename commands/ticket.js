const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Envia o painel de suporte')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Stumble Brust Support')
      .setDescription(
        'Welcome to Stumble Brust support. Here you can speak directly with our team. ' +
        'Starting a ticket without a valid reason may result in penalties. ' +
        'When opening your ticket, please provide the reason and as many details as possible to speed up your support.'
      )
      .addFields({
        name: '\u200b',
        value: 'Do not open tickets without need.\nShare context up front to speed things up.',
      })
      .setColor(0x2b2d31);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket_category')
      .setPlaceholder('Selecione o tipo de atendimento')
      .addOptions([
        { label: 'Suporte', emoji: { id: '1490407254380380261' }, description: 'Problemas gerais de suporte', value: 'suporte' },
        { label: 'Tier Test', emoji: { id: '1490422293283737721' }, description: 'Solicitar teste de tier', value: 'tier' },
        { label: 'Compras', emoji: '🛒', description: 'Dúvidas sobre compras', value: 'compras' },
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ content: '✅ Painel enviado!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};