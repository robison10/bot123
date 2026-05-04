const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const categoryNames = {
  suporte: '<:id:1490407254380380261> Suporte',
  tier: '<:TierA:1490422293283737721> Tier Test',
  compras: '🛒 Compras',
};

const supportRoleIds = process.env.SUPPORT_ROLE_IDS ? process.env.SUPPORT_ROLE_IDS.split(',') : [];
const LOG_CHANNEL_ID = '1501000493412126832';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        const msg = { content: '❌ Erro ao executar o comando.', ephemeral: true };
        interaction.replied ? interaction.followUp(msg) : interaction.reply(msg);
      }
      return;
    }

    // Select menu
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
      const category = interaction.values[0];
      const guild = interaction.guild;

      const existing = guild.channels.cache.find(
        c => c.topic?.includes(interaction.user.id) && c.name.startsWith('ticket-')
      );

      if (existing) {
        return interaction.reply({
          content: `❌ Você já tem um ticket aberto: ${existing}`,
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: true });

      const rolePermissions = supportRoleIds.map(id => ({
        id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      }));

      const ticketChannel = await guild.channels.create({
        name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)}`,
        type: ChannelType.GuildText,
        parent: process.env.TICKET_CATEGORY_ID || null,
        topic: `Ticket de ${interaction.user.tag} (${interaction.user.id}) | ${categoryNames[category]}`,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
            ],
          },
          ...rolePermissions,
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket — ${categoryNames[category]}`)
        .setDescription(
          `Olá, ${interaction.user}! 👋\n\n` +
          `Seu ticket de **${categoryNames[category]}** foi aberto.\n\n` +
          `Descreva seu problema com detalhes para que nossa equipe possa te ajudar rapidamente!\n\n` +
          `> Nossa equipe irá atendê-lo em breve. Obrigado pela paciência!`
        )
        .setColor(0x2b2d31)
        .setFooter({ text: `Stumble Brust Support • ${interaction.user.tag}` })
        .setTimestamp();

      const closeBtn = new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('🔒 Fechar Ticket')
        .setStyle(ButtonStyle.Danger);

      const claimBtn = new ButtonBuilder()
        .setCustomId('ticket_claim')
        .setLabel('✋ Assumir Ticket')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(claimBtn, closeBtn);

      const mentions = supportRoleIds.map(id => `<@&${id}>`).join(' ');

      await ticketChannel.send({
        content: `${interaction.user} ${mentions}`,
        embeds: [embed],
        components: [row],
      });

      await interaction.editReply({ content: `✅ Ticket criado: ${ticketChannel}` });
      return;
    }

    // Botão fechar
    if (interaction.isButton() && interaction.customId === 'ticket_close') {
      const member = interaction.member;
      const hasRole = supportRoleIds.some(id => member.roles.cache.has(id));

      if (!hasRole) {
        return interaction.reply({
          content: '❌ Você não tem permissão para fechar este ticket.',
          ephemeral: true,
        });
      }

      await interaction.reply({
        embeds: [new EmbedBuilder().setDescription('🔒 Fechando ticket e gerando logs...').setColor(0xe74c3c)],
      });

      // Busca o usuário que abriu o ticket pelo topic
      const topic = interaction.channel.topic || '';
      const match = topic.match(/\((\d+)\)/);
      const userId = match ? match[1] : null;

      // Coleta todas as mensagens do canal
      let allMessages = [];
      let lastId = null;

      while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const msgs = await interaction.channel.messages.fetch(options);
        if (msgs.size === 0) break;

        allMessages = allMessages.concat([...msgs.values()]);
        lastId = msgs.last().id;

        if (msgs.size < 100) break;
      }

      allMessages.reverse();

      // Formata o log
      const logLines = allMessages.map(m =>
        `[${new Date(m.createdTimestamp).toLocaleString('pt-BR')}] ${m.author.tag}: ${m.content || '[anexo/embed]'}`
      ).join('\n');

      const logEmbed = new EmbedBuilder()
        .setTitle(`📋 Log do Ticket — ${interaction.channel.name}`)
        .setDescription(
          `**Canal:** ${interaction.channel.name}\n` +
          `**Fechado por:** ${interaction.user.tag}\n` +
          `**Data:** ${new Date().toLocaleString('pt-BR')}`
        )
        .setColor(0xe74c3c)
        .setTimestamp();

      const logContent = logLines.length > 0
        ? `\`\`\`\n${logLines.slice(0, 3900)}\n\`\`\``
        : '*Nenhuma mensagem encontrada.*';

      // Envia log no canal de logs
      try {
        const logChannel = await interaction.guild.channels.fetch(LOG_CHANNEL_ID);
        if (logChannel) {
          await logChannel.send({ embeds: [logEmbed], content: logContent });
        }
      } catch (e) {
        console.error('Erro ao enviar log no canal:', e);
      }

      // Envia log no privado do usuário
      if (userId) {
        try {
          const user = await interaction.client.users.fetch(userId);
          if (user) {
            await user.send({ embeds: [logEmbed], content: logContent });
          }
        } catch (e) {
          console.error('Erro ao enviar DM:', e);
        }
      }

      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      return;
    }

    // Botão assumir
    if (interaction.isButton() && interaction.customId === 'ticket_claim') {
      const member = interaction.member;
      const hasRole = supportRoleIds.some(id => member.roles.cache.has(id));

      if (!hasRole) {
        return interaction.reply({
          content: '❌ Você não tem permissão para assumir este ticket.',
          ephemeral: true,
        });
      }

      await interaction.reply({
        embeds: [new EmbedBuilder().setDescription(`✋ Ticket assumido por ${interaction.user}.`).setColor(0xf39c12)],
      });
      return;
    }
  },
};
