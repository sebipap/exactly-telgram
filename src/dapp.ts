import { AuthClient } from '@walletconnect/auth-client'
import SignClient from '@walletconnect/sign-client'

import { Core } from '@walletconnect/core'

import dotenv from 'dotenv'
dotenv.config()

export const proposalNamespace = {
  eip155: {
    chains: ['eip155:1'],
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'get_balance',
      'eth_sign',
      'eth_getBalance',
      'eth_coinbase',
      'eth_accounts',
    ],
    events: ['accountsChanged', 'chainChanged'],
  },
}

const metadata = {
  name: 'Exactly',
  description: 'Exactly',
  url: 'app.exact.ly',
  icons: [
    'https://1099550196-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fn6wwJ0pvrhjXGxxDpmNa%2Fuploads%2FXPQGSf3uXGcVjjsp1W7q%2FIsologo%20-%20White.svg?alt=media&token=bb1dc6c8-2c71-4d94-b7c6-146dc0df0b86',
  ],
}

const core = new Core({
  projectId: process.env.PROJECT_ID || '',
})

export async function getSignClient() {
  return await SignClient.init({ core, metadata })
}

export async function getAuthClient() {
  return await AuthClient.init({
    core,
    metadata,
    projectId: process.env.PROJECT_ID || '',
  })
}
