const { Events } = require('discord.js');
require('dotenv').config();
require('./src/systems.js')
const client = require('./src/bot.js')
const REQUIRED_GUILD_ID = process.env.DISCORD_SERVER;
const OWNER_ROLE_ID = process.env.OWNER_ROLE;
const TOKEN = process.env.TOKEN;
const autoRoleId = process.env.USER_ROLE;


client.once(Events.ClientReady, async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    for (const [id, guild] of client.guilds.cache) {
        if (id !== REQUIRED_GUILD_ID) {
            console.log(`🚪 Leaving unauthorized guild: ${guild.name} (${id})`);
            await guild.leave();
        }
    }
});

client.on(Events.GuildCreate, async (guild) => {
    if (guild.id !== REQUIRED_GUILD_ID) {
        console.log(`⛔ Unauthorized guild joined: ${guild.name} (${guild.id})`);
        await guild.leave();
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    if (!message.member.roles.cache.has(OWNER_ROLE_ID)) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (command === '!ping') {
        await message.reply('🏓 Pong!');
    }

});

client.on(Events.GuildMemberAdd, async (member) => {
    try {
        await member.roles.add(autoRoleId);
        console.log(`✅ Assigned role to ${member.user.tag}`);
    } catch (error) {
        console.error(`❌ Failed to assign role to ${member.user.tag}:`, error);
    }
});

client.login(TOKEN);