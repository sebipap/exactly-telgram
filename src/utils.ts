import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { getTokenBalance } from './lib/api'
import { ChainId, TOKENS } from './lib/constants'
import { ChatContext } from './types'

export function getButtons(buttons: InlineKeyboardButton[]) {
  return {
    reply_markup: {
      inline_keyboard: [buttons],
    },
  }
}

export function gweiToWei(gwei: number) {
  return gwei / 1e18
}

export function hexToDecimal(hex: string) {
  const gwei = parseInt(hex.split('0x')[1] || '0', 16)
  return gweiToWei(gwei)
}

export async function getTokenBalances(
  address: string,
  chainId: ChainId,
  uri: string,
) {
  return Promise.all(
    TOKENS[chainId].map(async (token) => ({
      token,
      balance: await getTokenBalance(address, token, chainId, uri),
    })),
  )
}

export function getAddressFromWalletSession(
  session: ChatContext['session']['walletSession'],
) {
  if (!session) {
    throw new Error('No wallet session')
  }

  const {
    namespaces: {
      eip155: { accounts },
    },
  } = session

  const [_chainId, _, address] = accounts[0].split(':')
  return address
}

export function parseAmount(amount: string): number {
  // examples:
  // 10,2 => 10.2
  // 10.2 => 10.2
  // 10 => 10
  // 10 usdt => 10
  // 10USDT => 10

  const parsed = parseFloat(amount.replace(/,/g, '.').replace(/\s.*$/, ''))
  if (isNaN(parsed)) {
    throw new Error('Invalid amount')
  }

  return parsed
}

export function getActionName(ctx: ChatContext) {
  return (ctx.update as { callback_query: { data: string } }).callback_query
    .data
}

export function formatDate(date: Date) {
  // May 10, 2023
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
