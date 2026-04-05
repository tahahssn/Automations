const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Config
const BOT_TOKEN = '';
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/discord-truthdare';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ── Ready ──────────────────────────────────────────────────────
client.once('ready', () => {                                          
  console.log(`✅ Bot is online! Logged in as ${client.user.tag}`);
  console.log(`🔗 Connected to ${client.guilds.cache.size} servers`);
});

// ── Truth or Dare Handler ──────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();

  if (content === '!truth' || content === '!dare') {
    try {
      console.log(`📨 Received ${content} command from ${message.author.username}`);

      const webhookData = {
        type: content === '!truth' ? 'truth' : 'dare',
        user: {
          id: message.author.id,
          username: message.author.username,
          displayName: message.author.displayName || message.author.username
        },
        channel: {
          id: message.channel.id,
          name: message.channel.name
        },
        guild: {
          id: message.guild?.id,
          name: message.guild?.name
        },
        timestamp: new Date().toISOString()
      };

      console.log('🚀 Calling n8n webhook...');

      const response = await axios.post(N8N_WEBHOOK_URL, webhookData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      console.log('✅ n8n response received');

      if (response.data && response.data.message) {
        await message.channel.send(response.data.message);
        console.log('✅ Response sent to Discord');
      } else if (response.data && typeof response.data === 'string') {
        await message.channel.send(response.data);
        console.log('✅ Response sent to Discord');
      } else {
        console.log('⚠️ Unexpected response format:', response.data);
        await message.channel.send('🎮 Got a response but in an unexpected format!');
      }

    } catch (error) {
      console.error('❌ Error calling n8n webhook:', error.message);

      if (error.code === 'ECONNREFUSED') {
        await message.channel.send('❌ Could not connect to n8n. Make sure n8n is running on localhost:5678');
      } else if (error.code === 'ETIMEDOUT') {
        await message.channel.send('⏰ Request timed out. n8n might be processing...');
      } else {
        await message.channel.send('❌ Something went wrong! Check the console for details.');
      }
    }
  }
});

// ── Help Handler ───────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase().trim();

  if (content === '!help' || content === '!truthdare') {
    const helpEmbed = {
      color: 0xFF6B6B,
      title: '🎲 Truth or Dare Bot',
      description: 'Ready to spice things up? Here\'s what I can do:',
      fields: [
        {
          name: '🔥 Commands',
          value: '`!truth` - Get a spicy truth question\n`!dare` - Get an exciting dare challenge\n`!help` - Show this help message',
          inline: false
        },
        {
          name: '🎯 How to Play',
          value: 'Just type `!truth` or `!dare` and I\'ll give you something fun!',
          inline: false
        }
      ],
      footer: {
        text: 'Made by Affan | Powered by n8n'                      
      },
      timestamp: new Date()
    };

    await message.channel.send({ embeds: [helpEmbed] });
  }
});

// ── Error Handling ─────────────────────────────────────────────
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// ── Login ──────────────────────────────────────────────────────
console.log('🔄 Starting Discord bot...');
client.login(BOT_TOKEN).catch(error => {
  console.error('❌ Failed to login to Discord:', error.message);
  console.log('Make sure your bot token is correct!');
});