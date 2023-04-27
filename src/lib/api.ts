import axios, { AxiosInstance } from 'axios'
import { ethers } from 'ethers'
import { hexToDecimal } from '../utils'
import {
  ABIS,
  CHAIN_NAMES,
  ChainId,
  EXACTLY_DEPOSIT_ABIS,
  EXACTLY_DEPOSIT_TOKEN_ADDRESSES,
  RPCS,
  TOKEN_ADDRESES,
} from './constants'
import { Token } from './types'

const ethApi: AxiosInstance = axios.create({
  baseURL: 'https://cloudflare-eth.com',
  timeout: 30000, // 30 secs
  headers: {
    Accept: '*/*',
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
): Promise<number> {
  try {
    const rpc = RPCS[chainId]

    const provider = new ethers.providers.JsonRpcProvider(rpc, {
      chainId,
      name: CHAIN_NAMES[chainId],
    })

    const contract = new ethers.Contract(
      TOKEN_ADDRESES[chainId][token],
      ABIS[chainId][token],
      provider,
    )
    const balance = await contract.balanceOf(address)

    const balanceNice = balance / 1e6

    return balanceNice
  } catch (err) {
    console.error(JSON.stringify({ [token]: err }))
    return 0
  }
}

export async function getDepositTokenBalance<C extends ChainId>(
  address: string,
  token: Token<C>,
  chainId: C,
): Promise<number> {
  try {
    const rpc = RPCS[chainId]

    const provider = new ethers.providers.JsonRpcProvider(rpc, {
      chainId,
      name: CHAIN_NAMES[chainId],
    })

    const tokenAddress = EXACTLY_DEPOSIT_TOKEN_ADDRESSES[chainId][token]
    const tokenAbi = EXACTLY_DEPOSIT_ABIS[chainId][token]

    const contract = new ethers.Contract(tokenAddress, tokenAbi, provider)
    const accounts = await contract.accounts(address)

    console.log({ [token]: JSON.stringify(accounts) })

    // const balanceNice = balance / 1e6

    return accounts
  } catch (err) {
    console.log(err)
    return 0
  }
}
