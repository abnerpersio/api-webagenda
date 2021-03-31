require('node-telegram-bot-api');
const TelegramBot = require(`node-telegram-bot-api`);
const TOKEN = process.env.TOKEN_TELEGRAM;

const bot = new TelegramBot(TOKEN, { polling: true });

bot.sendMessage(936990561, `eai cara`);
