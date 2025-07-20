const {
    Events,
    EmbedBuilder,
} = require('discord.js');
const client = require('./bot');
const OWNER_ROLE_ID = process.env.OWNER_ROLE;

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.member.roles.cache.has(OWNER_ROLE_ID)) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    if (command === '!prices') {
        const embed = new EmbedBuilder()
            .setTitle('💰 DevWorks Pricing')
            .setDescription(
                'Every project is handled individually — the final price depends on the complexity and content.\n\n' +
                '🤖 **Basic Bot** – from `$50`\n' +
                '🧠 **Huge Bot** – from `$150`\n' +
                '🌐 **Web Panel** – from `$200`\n' +
                '🚀 **Large-scale Product** – from `$200`\n'
            )
            .setColor(0x0099ff)
            .setFooter({ text: 'DevWorks • price-list' });

        await message.channel.send({ embeds: [embed] });
    }

    if (command === '!rules') {
        const embed = new EmbedBuilder()
            .setTitle('📜 DevWorks Rules')
            .setDescription('By staying on this server, you automatically agree to follow the rules and order policies below.')
            .setColor(0x3366ff)
            .addFields(
                {
                    name: '1️⃣ Be respectful',
                    value: 'Treat everyone professionally. Toxicity, harassment, or rudeness can lead to removal from the project and/or server.',
                },
                {
                    name: '2️⃣ No spam or ads',
                    value: 'Avoid unnecessary messages, self-promotion or irrelevant content.',
                },
                {
                    name: '3️⃣ Respect the team',
                    value: 'Follow staff instructions and communicate clearly during the work process.',
                },
                {
                    name: '4️⃣ Edits & revisions',
                    value: 'Edits are allowed **only within 3 days** after the order is marked complete. Beyond that period, any changes may require additional payment.',
                },
                {
                    name: '5️⃣ Refund Policy',
                    value: 'Once the order is confirmed as complete, **no refunds are possible**.\nIf the client cancels mid-project, **only a partial refund** is issued (based on progress).',
                },
                {
                    name: '6️⃣ Abuse = order cancellation',
                    value: 'Aggressive or inappropriate behavior during the order process may result in **order cancellation without refund**.',
                },
                {
                    name: '7️⃣ Use correct channels',
                    value: 'Make sure to create orders in the appropriate ticket section and avoid cluttering general chats.'
                }
            )
            .setFooter({ text: 'DevWorks • Professionalism, Quality & Fairness' });

        await message.channel.send({ embeds: [embed] });
    }


});