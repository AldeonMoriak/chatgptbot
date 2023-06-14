import { serve } from 'https://deno.land/std@0.191.0/http/server.ts';

console.log(`Function "telegram-bot" up and running!`);

import {
  Bot,
  webhookCallback,
} from 'https://deno.land/x/grammy@v1.16.2/mod.ts';

import { OpenAI } from 'https://deno.land/x/openai@1.4.0/mod.ts';

const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!);

const bot = new Bot(Deno.env.get('TELEGRAM_KEY') || '');

bot.command('start', (ctx) => ctx.reply('Hello. Ask me something'));

bot.on('message:text', async (ctx) => {
  const user = await ctx.getAuthor();
  if (
    ![Deno.env.get('USER1'), Deno.env.get('USER2')].includes(
      user.user.username!.toLowerCase()
    )
  ) {
    return ctx.reply("Scram! You're not allowed to use this bot.");
  }
  try {
    const chat_completion = await openai.createCompletion({
      model: 'gpt-3.5-turbo-0613',
      prompt: ctx.message.text!,
      temperature: 0.6,
    });
    return ctx.reply(chat_completion.choices[0].text);
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    return ctx.reply(error.message);
  }
});

const handleUpdate = webhookCallback(bot, 'std/http');

serve(async (req) => {
  if (req.method === 'POST') {
    return await handleUpdate(req);
    // const url = new URL(req.url);
    // console.log(url)
    // if (url.pathname.slice(1) === bot.token) {
    //   try {
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }
  }
  return new Response();
});
