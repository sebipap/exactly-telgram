import SignClient from '@walletconnect/sign-client'
import { getSignClient, proposalNamespace } from './dapp'

import { ChainId, EXACTLY_USDC_CONTRACT_ADDRESS, TOKENS } from './lib/constants'
import { Token } from './lib/types'
import { ChatContext, DepositDuration } from './types'
import {
  formatDate,
  getActionName,
  getAddressFromWalletSession,
  getButtons,
  getDepositBalances,
  getTokenBalances,
  parseAmount,
} from './utils'

export async function sendMenu(ctx: ChatContext) {
  try {
    const address = getAddressFromWalletSession(ctx.session.walletSession)

    ctx.reply(
      `✅ ${address.slice(0, 4)}...${address.slice(-4)}`,
      getButtons([
        // { text: 'Send', callback_data: 'send' },
        {
          text: 'Get balance',
          callback_data: 'get_balance',
        },
        {
          text: 'Deposit',
          callback_data: 'deposit',
        },
        {
          text: 'Your Deposits',
          callback_data: 'see_deposits',
        },
        ctx.session.chainId === ChainId.ETHEREUM_MAINNET
          ? {
              text: 'Switch to 🔴 Optimism',
              callback_data: 'switch_to_optimism',
            }
          : {
              text: 'Switch to 🔷 Ethereum',
              callback_data: 'switch_to_ethereum',
            },
      ]),
    )
  } catch {
    ctx.reply('there was a problem')
  }
}

export async function handleStart(ctx: ChatContext) {
  await ctx.reply('Hi!')
  await ctx.reply("I'm Exactly's Telegram bot 🤖")
  await ctx.reply(
    'Exactly is a decentralized, non-custodial and open-source protocol that provides an autonomous fixed and variable interest rate market enabling users to frictionlessly exchange the time value of their assets and completing the DeFi credit market.',
  )

  const signClient = await getSignClient()

  ctx.session.signClient = signClient

  await proposeConnection({ signClient, ctx })
}

export async function handleConnectAction(ctx: ChatContext) {
  const signClient = ctx.session.signClient

  if (!signClient) {
    await ctx.reply('no sign client')
    return
  }

  await proposeConnection({ signClient, ctx })
}

async function proposeConnection({
  ctx,
  signClient,
}: {
  ctx: ChatContext
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

      ctx.reply('Connected!')

      sendMenu(ctx)
    }
  }
}

export async function handleSend(ctx: ChatContext) {
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

export async function handleGetBalance(ctx: ChatContext) {
  const session = ctx.session.walletSession
  const signClient = ctx.session.signClient

  if (!signClient || !session) {
    await ctx.reply('not approved')
    return
  }

  const {
    namespaces: {
      eip155: { accounts },
    },
  } = session

  const addresses = accounts.map((account) => {
    const [_chainId, _, address] = account.split(':')
    return address
  })

  const { chainId } = ctx.session

  try {
    const balances = await getTokenBalances(addresses[0], chainId)

    for (const { token, balance } of balances) {
      await ctx.reply(`${token}: ${balance}`)
    }
  } catch (mierror) {
    ctx.reply('Error getting balance')
    console.error(mierror)
  }

  sendMenu(ctx)
}

export async function handleStartDepositAction(ctx: ChatContext) {
  const { chainId } = ctx.session

  const tokens = TOKENS[chainId]

  ctx.reply(
    "Start by choosing the token you'd like to deposit",
    getButtons(
      tokens.map((token) => ({
        text: token,
        callback_data: `deposit-token:${token}`,
      })),
    ),
  )
}

export async function handleSwitchToOptimismAction(ctx: ChatContext) {
  await handleSwitchChain(ctx, ChainId.OPTIMISM)
}

export async function handleSwitchToEthereumAction(ctx: ChatContext) {
  await handleSwitchChain(ctx, ChainId.ETHEREUM_MAINNET)
}

export async function handleSwitchChain(ctx: ChatContext, chainId: ChainId) {
  ctx.session.chainId = chainId

  const chainName =
    chainId === ChainId.ETHEREUM_MAINNET ? 'Ethereum' : 'Optimism'

  const signClient = ctx.session.signClient
  const walletSession = ctx.session.walletSession

  if (!signClient || !walletSession) {
    await ctx.reply('not approved')
    return
  }

  ctx.reply(`Switched to ${chainName}`)
  sendMenu(ctx)
}

export async function handleSetTokenAction(ctx: ChatContext) {
  const [_deposit, token] = getActionName(ctx).split(':')

  ctx.session.token = token as Token<ChainId.ETHEREUM_MAINNET>

  ctx.reply(`How much ${token} would you like to deposit?`)
}

export async function handleIncomingMessage(ctx: ChatContext) {
  const { token } = ctx.session

  if (!token) {
    handleStart(ctx)
    return
  }

  const amount = parseAmount((ctx.message as any)?.text)

  ctx.session.amount = amount

  const buttonValues = [
    {
      text: 'Flexible (best) - 2.85% APR',
      callback_data: 'deposit-duration:flexible',
    },
    {
      text: '0 days - 2.59% APR',
      callback_data: 'deposit-duration:0',
    },
    {
      text: '28 days - 2.59% APR',
      callback_data: 'deposit-duration:28',
    },
    {
      text: '56 days - 2.59% APR',
      callback_data: 'deposit-duration:56',
    },
  ]

  ctx.reply(
    `Choose the deposit duration for ${amount} ${token}`,
    getButtons(buttonValues),
  )
}

export async function handleSeeDepositsAction(ctx: ChatContext) {
  const address = getAddressFromWalletSession(ctx.session.walletSession)

  try {
    const balances = await getDepositBalances(address, ctx.session.chainId)

    for (const { token, balance } of balances) {
      ctx.reply(`${token}: ${balance}`)
    }
  } catch (error) {
    console.error(error)
    ctx.reply('Error getting balance')
  }
}

export async function handleSetDepositDuration(ctx: ChatContext) {
  const [_deposit, duration] = getActionName(ctx).split(':')

  const { token, amount } = ctx.session

  if (!amount) {
    handleStartDepositAction(ctx)
    return
  }

  const rate = 0.0286 /// TODO: change

  const interest = amount * rate

  const maturityDate =
    duration !== 'flexible'
      ? formatDate(
          new Date(
            new Date().getTime() + Number(duration) * 24 * 60 * 60 * 1000,
          ),
        )
      : ''

  ctx.session.depositDuration = duration as DepositDuration

  ctx.reply(`Your total earnings: ${token} ${(amount + interest).toFixed(2)}`)
  ctx.reply(`Assets to be deposited: ${token} ${amount}`)
  ctx.reply(
    `Total interest fees to receive (${(rate * 100).toFixed(
      2,
    )}% APR): ${interest}`,
  )
  ctx.reply(
    `Deposit maturity date (In ${duration} days): ${maturityDate}`,
    getButtons([
      {
        text: `Deposit ${amount} ${token} for ${duration} days`,
        callback_data: 'deposit_confirm',
      },
    ]),
  )
}

export async function handleDepositConfirmAction(ctx: ChatContext) {
  ctx.reply('Please confirm the transaction in your wallet')
  const { token, amount, depositDuration, signClient, walletSession } =
    ctx.session

  if (!signClient || !walletSession) {
    return
  }
  try {
    await signClient?.request({
      chainId: 'eip155:1',
      topic: walletSession?.topic,
      request: {
        method: 'eth_sendTransaction',
        params: [
          {
            from: getAddressFromWalletSession(walletSession),
            to: EXACTLY_USDC_CONTRACT_ADDRESS,
            gas: '0x76c0', // 30400
            gasPrice: '0x9184e72a000', // 10000000000000
            value: '0x0',
            data: '0x121212',
          },
        ],
      },
    })
    ctx.reply(`Deposit confirmed`)
  } catch (err) {
    ctx.reply(`Error ${err}`)
  }

  console.log(token, amount, depositDuration)
}
