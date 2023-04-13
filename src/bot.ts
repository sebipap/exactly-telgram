import * as dotenv from 'dotenv'
import { Telegraf, session } from 'telegraf'
import {
  handleConnectAction,
  handleDepositConfirmAction,
  handleGetBalance,
  handleIncomingMessage,
  handleSeeDepositsAction,
  handleSend,
  handleSetDepositDuration,
  handleSetTokenAction,
  handleStart,
  handleStartDepositAction,
  handleSwitchToEthereumAction,
  handleSwitchToOptimismAction,
} from './handlers'
import { ChainId } from './lib/constants'
import { ChatContext } from './types'

// get telegram bot token from env
dotenv.config()
const { BOT_TOKEN = '' } = process.env

// create bot
const bot = new Telegraf<ChatContext>(BOT_TOKEN)

// register session middleware
bot.use(
  session({
    defaultSession: () => ({
      chainId: ChainId.ETHEREUM_MAINNET as ChainId,
    }),
  }),
)

// register start handler
bot.start(handleStart)

// register action handlers
bot.action('connect', handleConnectAction)
bot.action('deposit', handleStartDepositAction)
bot.action('switch_to_optimism', handleSwitchToOptimismAction)
bot.action('switch_to_ethereum', handleSwitchToEthereumAction)
bot.action('see_deposits', handleSeeDepositsAction)
bot.action('deposit_confirm', handleDepositConfirmAction)

// match actions that start with "deposit:"
bot.action(/^deposit-token:/, handleSetTokenAction)
bot.action(/^deposit-duration:/, handleSetDepositDuration)

// register message handler
bot.on('message', handleIncomingMessage)

//todo: remove
bot.action('get_balance', handleGetBalance)
bot.action('send', handleSend)

// start bot
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
