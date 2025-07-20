const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const client = require('./bot');
const OWNER_ROLE_ID = process.env.OWNER_ROLE;
const CATEGORY_ID = process.env.TICKET_CATEGORY;

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.member.roles.cache.has(OWNER_ROLE_ID)) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    if (command === '!sendticket') {
        const embed = new EmbedBuilder()
            .setTitle('📦 Order creation')
            .setDescription(
                'Click the button below to create an order.\nOur team will reach out shortly to discuss your order in detail.'
            )
            .setColor(0x0077cc)
            .setFooter({ text: 'DevWorks • Order system' });

        const button = new ButtonBuilder()
            .setCustomId('create_order')
            .setLabel('Create Order')
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder().addComponents(button);

        await message.channel.send({ embeds: [embed], components: [row] });
    }

    if (command === '!closeticket') {
        const channel = message.channel;

        if (!channel.topic || !channel.topic.startsWith('Order from user ID:')) {
            return message.reply('❌ This command can only be used in order channels.');
        }
        const userId = channel.topic.replace('Order from user ID: ', '').trim();

        try {
            await channel.permissionOverwrites.edit(userId, {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false,
            });

            await message.reply('✅ Ticket has been closed and user access removed.');
        } catch (error) {
            console.error('Error closing ticket:', error);
            await message.reply('❌ Failed to close the ticket. Check my permissions.');
        }
    }

});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'create_order') {
        const modal = new ModalBuilder()
            .setCustomId('order_modal')
            .setTitle('🛠️ Create a New Order');

        const nameInput = new TextInputBuilder()
            .setCustomId('name_input')
            .setLabel('Your Name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g John, Alex')
            .setRequired(true);

        const budgetInput = new TextInputBuilder()
            .setCustomId('budget_input')
            .setLabel('Your Budget')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g. 50€, 100-200$, etc.')
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description_input')
            .setLabel('Project Description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Briefly describe what you need...')
            .setRequired(true);

        const row1 = new ActionRowBuilder().addComponents(nameInput);
        const row2 = new ActionRowBuilder().addComponents(budgetInput);
        const row3 = new ActionRowBuilder().addComponents(descriptionInput);

        modal.addComponents(row1, row2, row3);
        await interaction.showModal(modal);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'order_modal') {
        const name = interaction.fields.getTextInputValue('name_input');
        const budget = interaction.fields.getTextInputValue('budget_input');
        const description = interaction.fields.getTextInputValue('description_input');

        const guild = interaction.guild;

        const username = interaction.user.username.toLowerCase().replace(/\s+/g, '-');

        let channelName = `order-${username}`;
        if (channelName.length > 90) {
            channelName = channelName.slice(0, 90);
        }

        const existingChannel = guild.channels.cache.find(ch => ch.name === channelName);
        if (existingChannel) {
            channelName = `order-${username}-${interaction.user.discriminator}`; // например order-johndoe-1234
        }

        const newChannel = await guild.channels.create({
            name: channelName,
            type: 0,
            parent: CATEGORY_ID,
            topic: `Order from user ID: ${interaction.user.id}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: ['ViewChannel'],
                },
                {
                    id: interaction.user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                },
                {
                    id: client.user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ManageChannels'],
                },
            ],
        });

        const orderEmbed = new EmbedBuilder()
            .setTitle('🛠️ New Order Request')
            .setDescription(
                `👤 Name:\n${name}\n\n💰 Budget:\n${budget}\n\n📝 Description:\n${description}`
            )
            .setFooter({ text: `User ID: ${interaction.user.id}` })
            .setTimestamp()
            .setColor(0x1e90ff);

        await newChannel.send({ content: '@everyone', embeds: [orderEmbed] });

        await interaction.reply({
            content: `✅ Your order has been created: <#${newChannel.id}>`,
            ephemeral: true,
        });
    }
});



