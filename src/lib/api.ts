import axios, { AxiosInstance } from 'axios'
import Web3 from 'web3'
import { hexToDecimal } from '../utils'
import { ChainId } from './constants'
import { Token } from './types'

const ethApi: AxiosInstance = axios.create({
  baseURL: 'https://cloudflare-eth.com',
  timeout: 30000, // 30 secs
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
  },
})

const optimismApi: AxiosInstance = axios.create({
  baseURL: 'https://mainnet.optimism.io',
  timeout: 30000, // 30 secs
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export async function getEthBalance(address: string): Promise<number> {
  const {
    data: { result: balanceHex },
  } = await ethApi.post('', {
    method: 'eth_getBalance',
    params: [address, 'latest'],
    id: 44,
    jsonrpc: '2.0',
  })

  return hexToDecimal(balanceHex)
}

export async function getTokenBalance<C extends ChainId>(
  address: string,
  token: Token<C>,
  chainId: C,
  uri: string,
): Promise<number> {
  // const abi = ABIS[chainId][token]

  const api = chainId === ChainId.OPTIMISM ? optimismApi : ethApi

  const web3 = new Web3('ws://some.local-or-remote.node:8546')

  const balanceOfFunction = web3.eth.abi.encodeFunctionCall(
    {
      name: 'balanceOf',
      type: 'function',
      inputs: [{ type: 'address', name: 'account' }],
    },
    [address],
  )

  const functionSignature =
    web3.eth.abi.encodeFunctionSignature('balanceOf(address)')
  const encodedParams = web3.eth.abi.encodeParameters(['address'], [address])
  const messageToSign =
    web3.utils.sha3(functionSignature + encodedParams.slice(2)) || ''

  const signature = await web3.eth.sign(messageToSign, address)

  const data = `${balanceOfFunction.slice(0, 10)}${signature.slice(
    2,
  )}${balanceOfFunction.slice(10 + 65)}`

  const {
    data: { result: balanceHex },
  } = await api.post('', {
    method: 'eth_call',
    params: [
      {
        to: token,
        data,
      },
      'latest',
    ],
    id: chainId === ChainId.OPTIMISM ? 43 : 48,
    jsonrpc: '2.0',
  })

  return hexToDecimal(balanceHex)
}
