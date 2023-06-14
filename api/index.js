require('dotenv').config();
const { Bot } = require('grammy');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const bot = new Bot(process.env.TELEGRAM_KEY);

bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'));
bot.on('message', async (ctx) => {
  if (
    ![process.env.USER1, process.env.USER2].includes(
      ctx.chat.username.toLowerCase()
    )
  ) {
    return ctx.reply("Scram! You're not allowed to use this bot.");
  }

  try {
    const chat_completion = await openai.createChatCompletion({
      model: 'text-davinci-003',
      prompt: ctx.message.text,
      temperature: 0.6,
    });
    return ctx.reply(chat_completion.data.choices[0].text);
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    return ctx.reply(error.message);
  }
});

bot.start();
