import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

console.log(`Function "telegram-bot" up and running!`);

import {
  Bot,
  webhookCallback,
  Context,
} from "https://deno.land/x/grammy@v1.14.1/mod.ts";
import {
  hydrateReply,
  parseMode,
  ParseModeFlavor
} from "https://deno.land/x/grammy_parse_mode@1.5.0/mod.ts";

import { OpenAI } from "https://deno.land/x/openai/mod.ts";

const openai = new OpenAI(Deno.env.get("OPENAI_API_KEY")!);

const bot = new Bot<ParseModeFlavor<Context>>(Deno.env.get("TELEGRAM_KEY") || "");
bot.use(hydrateReply);
bot.api.config.use(parseMode("MarkdownV2"));

bot.command("start", (ctx) =>
  ctx.reply(
    "Hello. Ask me something"
  )
);

bot.on("message:text", async (ctx) => {
    const user = await ctx.getAuthor();
  if (
    ![Deno.env.get("USER1"), Deno.env.get("USER2")].includes(
      user.user.username!.toLowerCase()
    )
  ) {
    return ctx.reply("Scram! You're not allowed to use this bot.");
  }
  try {
    const chat_completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: ctx.message.text!,
      temperature: 0.6,
    });
    return ctx.reply(chat_completion.choices[0].text);
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    return ctx.reply(error.message);
  }
});

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  try {
    //     const url = new URL(req.url);
    //     if (url.searchParams.get('secret') !== Deno.env.get('FUNCTION_SECRET'))
    //       return new Response('not allowed', { status: 405 })

    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});
