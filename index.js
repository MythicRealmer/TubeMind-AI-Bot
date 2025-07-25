require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

client.on('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const prompt = args.join(' ');

  if (!prompt && command !== 'script') return message.reply('Please include a topic or idea.');

  switch (command) {
    case 'title':
      return generateAndSend(message, `Write a viral YouTube title for: ${prompt}`);
    case 'tags':
      return generateAndSend(message, `Give me SEO YouTube tags for: ${prompt}`);
    case 'description':
      return generateAndSend(message, `Write a compelling YouTube video description for: ${prompt}`);
    case 'ideas':
      return generateAndSend(message, `List 5 creative YouTube video ideas about: ${prompt}`);
    case 'script': {
      const length = args[0] === 'long' ? 'long-form' : 'short';
      const topic = args.slice(1).join(' ');
      if (!topic) return message.reply('Please provide the topic for the script.');
      return generateAndSend(message, `Write a ${length} YouTube video script on: ${topic}`);
    }
    case 'thumbnail':
      return generateThumbnail(message, prompt);
    default:
      return message.reply('Unknown command. Try !title, !tags, !description, !ideas, !script, or !thumbnail');
  }
});

async function generateAndSend(message, prompt) {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });
    message.reply(completion.data.choices[0].message.content);
  } catch (err) {
    console.error(err);
    message.reply('❌ Error generating content.');
  }
}

async function generateThumbnail(message, prompt) {
  try {
    const response = await openai.createImage({
      prompt: `${prompt}, YouTube thumbnail style, vibrant colors, dramatic lighting`,
      n: 1,
      size: '1024x1024'
    });
    const imageUrl = response.data.data[0].url;
    message.reply({ content: `🖼️ Generated Thumbnail:`, files: [imageUrl] });
  } catch (err) {
    console.error(err);
    message.reply('❌ Error generating thumbnail.');
  }
}

client.login(process.env.DISCORD_TOKEN);
