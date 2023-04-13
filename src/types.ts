import SignClient from '@walletconnect/sign-client'
import { SessionTypes } from '@walletconnect/types'
import { Context } from 'telegraf'
import { Update } from 'typegram'
import { ChainId } from './lib/constants'
import { Token } from './lib/types'

export type DepositDuration = 'flexible' | 0 | 28 | 56

export type ChatContext<U extends Update = Update> = Context<U> & {
  session: {
    walletSession: SessionTypes.Struct | null
    signClient: SignClient | null
    chainId: ChainId
    token: Token<1> | null
    amount: number | null
    depositDuration: DepositDuration | null
  }
}
