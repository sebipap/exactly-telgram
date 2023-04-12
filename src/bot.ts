import * as dotenv from 'dotenv'
import { Telegraf, session } from 'telegraf'
import {
  handleConnect,
  handleGetBalance,
  handleSend,
  handleStart,
} from './handlers'
import { MyContext } from './types'

// get telegram bot token from env
dotenv.config()
const { BOT_TOKEN = '' } = process.env

// create bot
const bot = new Telegraf<MyContext>(BOT_TOKEN)

// register session middleware
bot.use(
  session({
    defaultSession: () => ({}),
  }),
)

// register action handlers
bot.start(handleStart)
bot.action('connect', handleConnect)
bot.action('get_balance', handleGetBalance)
bot.action('send', handleSend)

// start bot
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
