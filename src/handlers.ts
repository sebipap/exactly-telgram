import SignClient from '@walletconnect/sign-client'
import { getSignClient, proposalNamespace } from './dapp'

import { ActionCallback, StartCallback } from './types'
import { getButtons } from './utils'

export const handleStart: StartCallback = async (ctx) => {
  await ctx.reply('Hi!')
  await ctx.reply("I'm Exactly's Telegram bot 🤖")
  await ctx.reply(
    'Exactly is a decentralized, non-custodial and open-source protocol that provides an autonomous fixed and variable interest rate market enabling users to frictionlessly exchange the time value of their assets and completing the DeFi credit market.',
  )

  const signClient = await getSignClient()

  ctx.session.signClient = signClient

  await proposeConnection({ signClient, ctx })
}

export const handleConnect: ActionCallback = async (ctx) => {
  const signClient = ctx.session.signClient

  if (!signClient) {
    await ctx.reply('not approved')
    return
  }

  await proposeConnection({ signClient, ctx })
}

async function proposeConnection({
  ctx,
  signClient,
}: {
  ctx: any
  signClient: SignClient
}) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject('wallet connect timeout'), 80000)
  })

  try {
    await Promise.race([makeConnection(), timeout])
  } catch (err) {
    console.log(`Error 1`, err)
    try {
      await ctx.reply('The connection was not approved 😥', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Retry',
                callback_data: 'connect',
              },
            ],
          ],
        },
      })
    } catch (err2) {
      console.log(`Error 2: ${err2}`)
    }
  }

  async function makeConnection() {
    const { uri, approval } = await signClient.connect({
      requiredNamespaces: proposalNamespace,
    })

    if (uri) {
      const encodedUri = encodeURIComponent(uri)

      const url = `https://54d6-200-125-106-87.ngrok.io?uri=${encodedUri}`

      await ctx.reply(
        'Connect your wallet to the Exactly protocol by clicking the button below or scanning the QR code with your phone.',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Connect wallet',
                  url,
                },
              ],
            ],
          },
        },
      )

      await ctx.replyWithPhoto(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUri}&margin=8`,
      )

      const approvedSession = await approval()
      ctx.session.walletSession = approvedSession

      const {
        namespaces: {
          eip155: { accounts },
        },
      } = approvedSession

      const [_chainId, _, address] = accounts[0].split(':')

      ctx.reply('Connected!')

      ctx.reply(
        `✅ ${address.slice(0, 4)}...${address.slice(-4)}`,
        getButtons([{ text: 'Send', callback_data: 'send' }]),
      )
    }
  }
}

export const handleSend: ActionCallback = async (ctx) => {
  await ctx.reply('send')
  const session = ctx.session.walletSession

  const signClient = ctx.session.signClient

  if (!signClient || !session) {
    await ctx.reply('not approved')
    return
  }

  await ctx.reply(
    'Open wallet to approve tx',
    getButtons([
      {
        text: 'Approve',
        url: `https://54d6-200-125-106-87.ngrok.io?uri=${encodeURIComponent(
          'wc://',
        )}`,
      },
    ]),
  )

  const result = await signClient.request({
    topic: session.topic,
    chainId: 'eip155:1',
    request: {
      method: 'eth_sendTransaction',
      params: [
        {
          from: '0x...',
          to: '0x...',
          value: '0x...',
          gas: '0x...',
          gasPrice: '0x...',
          nonce: '0x...',
          data: '0x...',
        },
      ],
    },
  })

  await ctx.reply(`Result: ${result}`)

  await ctx.reply(
    `https://54d6-200-125-106-87.ngrok.io?uri=${encodeURIComponent('wc://')}`,
  )
}

export const handleGetBalance: ActionCallback = async (ctx) => {
  await ctx.reply('get_balance')

  const session = ctx.session.walletSession
  const signClient = ctx.session.signClient

  if (!signClient || !session) {
    await ctx.reply('not approved')
    return
  }

  await ctx.reply('Open wallet to approve tx', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Approve',
            url: `https://54d6-200-125-106-87.ngrok.io?uri=${encodeURIComponent(
              'wc://',
            )}`,
          },
        ],
      ],
    },
  })

  const balance = await signClient.request({
    topic: session.topic,
    chainId: 'eip155:1',
    request: {
      method: 'get_balance',
      params: ['0x...'],
    },
  })
  ctx.reply(`Balance: ${balance}`)
}
