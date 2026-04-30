const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('booster')
    .setDescription('Envia os benefícios de booster')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Benefícios Booster - Stumble Burst <:boost:1490498699288121404>')
      .setColor(0xff73fa)
      .setThumbnail('attachment://logo.png')
      .setDescription(
        '**Important Notice:**\n' +
        'benefits are only available while your boost is activicty\n\n' +
        '**Pink [B] in game** <:boost:1490498699288121404>\n' +
        '**10k Gems in game** <:gems:1490407261414232174>\n' +
        '**Sharing Photos In** 📸 · media Permission\n\n' +
        'use the comand /claim and you id for claim rewards'
      );

    await interaction.reply({ content: '✅ Enviado!', ephemeral: true });
    await interaction.channel.send({
      embeds: [embed],
      files: [{ attachment: './logo.png', name: 'logo.png' }],
    });
  },
};