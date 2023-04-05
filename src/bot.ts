import { buildApprovedNamespaces } from '@walletconnect/utils'
import { Context, Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { Update } from 'telegraf/types'

import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

interface MyContext<U extends Update = Update> extends Context<U> {
  session: {
    operation: string
    token: string
    amount: string
    duration: string
  }
}

const telegramTokenApi = '5907263523:AAHfrWY3pMM4LfC1JEt7QtFdE3B_kPkzX4w'

const bot = new Telegraf<MyContext>(telegramTokenApi)

bot.use(
  session({
    defaultSession: () => ({
      operation: '',
      token: '',
      amount: '',
    }),
  }),
)

bot.start((ctx) => {
  ctx.reply(`Decentralizing the credit market, today`)

  // send a button that says "Start"
  ctx.reply(
    `Exactly is a decentralized, non-custodial and open-source protocol that provides an autonomous fixed and variable interest rate market enabling users to frictionlessly exchange the time value of their assets and completing the DeFi credit market.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Connect',
              callback_data: 'connect',
            },
          ],
        ],
      },
    },
  )
})

/*

Flow:

1. choose either to deposit or borrow 
2. choose token between USDC, ETH or OP
3. choose amount
4. choose Deposit duration between the following options:
  a. Flexible 
  b. 7 days
  c. 35 days
  d. 63 days
6. give a walletconnect link to connect wallet
*/

// const STEPS = [
//   'SELECT_OPERATION',
//   'SELECT_TOKEN',
//   'SELECT_AMOUNT',
//   'SELECT_DURATION',
// ]

const operations = [
  {
    text: 'Deposit',
    value: 'deposit',
  },
  {
    text: 'Borrow',
    value: 'borrow',
  },
]

const tokens = [
  {
    text: 'USDC',
    value: 'usdc',
  },
  {
    text: 'ETH',
    value: 'eth',
  },
  {
    text: 'OP',
    value: 'op',
  },
]

const durations = [
  {
    text: 'Flexible',
    value: 'flexible',
  },
  {
    text: '7 days',
    value: '7_days',
  },
  {
    text: '35 days',
    value: '35_days',
  },
  {
    text: '63 days',
    value: '63_days',
  },
]
const uri =
  'wc:30ceea97-d215-4f66-8f55-fa8f49c9fd82@1?relay-protocol=irn&key=7957d8a76b4133bf7805e5f67493d00dca5b1de1a1f1a484b4571aef3a2378b3'

const x = async () => {
  const core = new Core({
    projectId: process.env.PROJECT_ID,
  })

  const web3wallet = await Web3Wallet.init({
    core, // <- pass the shared `core` instance
    metadata: {
      name: 'Demo app',
      description: 'Demo Client as Wallet/Peer',
      url: 'www.walletconnect.com',
      icons: [],
    },
  })

  web3wallet.on('session_proposal', async (sessionProposal) => {
    const { id, params } = sessionProposal

    const approvedNamespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        eip155: {
          chains: ['eip155:1', 'eip155:137'],
          methods: ['eth_sendTransaction', 'personal_sign'],
          events: ['accountsChanged', 'chainChanged'],
          accounts: [
            'eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
            'eip155:137:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
          ],
        },
      },
    })

    const session = await web3wallet.approveSession({
      id,
      namespaces: approvedNamespaces,
    })

    console.log('session', session)
  })
  await web3wallet.core.pairing.pair({ uri })
}

x()

const getKeyboard = (options: typeof operations) => {
  return {
    reply_markup: {
      inline_keyboard: options.map((option) => [
        {
          text: option.text,
          callback_data: option.value,
        },
      ]),
    },
  }
}

bot.action('connect', async (ctx) => {
  if (!ctx.update.callback_query.message) {
    return
  }

  const { id } = ctx.update.callback_query.message.chat

  await ctx.telegram.sendMessage(id, uri)
})

bot.action('start', async (ctx) => {
  if (!ctx.update.callback_query.message) {
    return
  }

  const { id } = ctx.update.callback_query.message.chat

  const operationKeyboard = getKeyboard(operations)

  await ctx.telegram.sendMessage(id, 'Select operation', operationKeyboard)
})

for (const operation of ['deposit', 'borrow']) {
  bot.action(operation, async (ctx) => {
    if (!ctx.update.callback_query.message) {
      return
    }

    const { id } = ctx.update.callback_query.message.chat

    const tokenKeyboard = getKeyboard(tokens)

    ctx.session.operation = operation

    await ctx.telegram.sendMessage(
      id,
      `Select token     ${JSON.stringify({ state: ctx.session })}`,
      tokenKeyboard,
    )
  })
}

for (const token of ['usdc', 'eth', 'op']) {
  bot.action(token, async (ctx) => {
    if (!ctx.update.callback_query.message) {
      return
    }

    const { id } = ctx.update.callback_query.message.chat

    ctx.session.token = token

    await ctx.telegram.sendMessage(
      id,
      `Enter the amount of ${token.toUpperCase()} you want to ${
        ctx.session.operation
      } ${JSON.stringify({ state: ctx.session })}`,
    )
  })
}

// listen to amount
bot.on(message('text'), async (ctx) => {
  if (ctx.session.amount !== '') {
    return
  }

  ctx.session.amount = ctx.message.text

  const durationKeyboard = getKeyboard(durations)

  await ctx.telegram.sendMessage(
    ctx.message.chat.id,
    `Select duration ${JSON.stringify({ state: ctx.session })}`,
    durationKeyboard,
  )
})

for (const duration of ['flexible', '7_days', '35_days', '63_days']) {
  bot.action(duration, async (ctx) => {
    if (!ctx.update.callback_query.message) {
      return
    }

    const { id } = ctx.update.callback_query.message.chat

    ctx.session.duration = duration

    await ctx.telegram.sendMessage(id, `Connect`, {
      reply_markup: {
        keyboard: [
          [
            {
              text: 'Connect',
              web_app: {
                url: 'wc:30ceea97-d215-4f66-8f55-fa8f49c9fd82@1?bridge=https%3A%2F%2F0.bridge.walletconnect.org&key=7957d8a76b4133bf7805e5f67493d00dca5b1de1a1f1a484b4571aef3a2378b3',
              },
            },
          ],
        ],
      },
    })

    // send an anchor tag with the walletconnect link
  })
}

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch().then(() => console.log('Bot started'))

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
