module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot online como ${client.user.tag}`);
    client.user.setActivity('Stumble Brust | G...', { type: 0 });
  },
};