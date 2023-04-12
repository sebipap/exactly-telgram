import SignClient from '@walletconnect/sign-client'
import { SessionTypes } from '@walletconnect/types'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'typegram'

export type SessionData = {
  walletSession: SessionTypes.Struct | null
  signClient: SignClient | null
}

export type MyContext<U extends Update = Update> = Context<U> & {
  session: SessionData
}

export type Action = Telegraf<MyContext>['action']
export type ActionCallback = Parameters<Action>[1]

export type StartAction = Telegraf<MyContext>['start']
export type StartCallback = Parameters<StartAction>[0]
