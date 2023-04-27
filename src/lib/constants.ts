import {
  Abi,
  ChainAddresses,
  ChainTokenAbis,
  EthereumToken,
  OptimismToken,
  Token,
} from './types'

import DEPOSIT_OP_OPTIMISM from './abis/deposit_op_op.json'
import DEPOSIT_ETH_OPTIMISM from './abis/deposit_op_weth.json'
import DEPOSIT_USDC_OPTIMISM from './abis/desposit_op_usdc.json'

import OP_OPTIMISM from './abis/op_op.json'
import USDC_OPTIMISM from './abis/op_usdc.json'
import ETH_OPTIMISM from './abis/op_weth.json'

import USDC_ETH from './abis/usdc_eth.json'
import USDT_ETH from './abis/usdt_eth.json'
import WBTC_ETH from './abis/wbtc_eth.json'
import WSTETH_ETH from './abis/wsteth_eth.json'

export const ETHEREUM_ABIS: Record<EthereumToken, Abi> = {
  WSTETH: WSTETH_ETH,
  WBTC: WBTC_ETH,
  USDC: USDC_ETH,
  USDT: USDT_ETH,
}

export const EXACTLY_DEPOSIT_ETHEREUM_ABIS: Record<EthereumToken, Abi> = {
  WSTETH: DEPOSIT_USDC_OPTIMISM, ///TODO: CHANGE
  WBTC: DEPOSIT_USDC_OPTIMISM, ///TODO: CHANGE
  USDC: DEPOSIT_ETH_OPTIMISM, ///TODO: CHANGE
  USDT: DEPOSIT_OP_OPTIMISM, ///TODO: CHANGE
}

export const ETHEREUM_TOKEN_ADDRESSES: Record<EthereumToken, string> = {
  WSTETH: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
}

export const EXACTLY_ETHEREUM_DEPOSIT_TOKEN_ADDRESSES: Record<
  EthereumToken,
  string
> = {
  WSTETH: '0x',
  WBTC: '0x',
  USDC: '0x',
  USDT: '0x',
}

export const EXACTLY_OPTIMISM_DEPOSIT_TOKEN_ADDRESSES: Record<
  OptimismToken,
  string
> = {
  USDC: '0xf6da0e129FDC6E8FDa49d8B2B33a6D4bA43c677b',
  ETH: '0xc4d4500326981eacD020e20A81b1c479c161c7EF',
  OP: '0xa430A427bd00210506589906a71B54d6C256CEdb',
}

export const OPTIMISM_TOKEN_ADDRESSES: Record<OptimismToken, string> = {
  ETH: '0x4200000000000000000000000000000000000042',
  OP: '0x4200000000000000000000000000000000000042',
  USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
}

export const OPTIMISM_ABIS: Record<OptimismToken, Abi> = {
  USDC: USDC_OPTIMISM,
  ETH: ETH_OPTIMISM,
  OP: OP_OPTIMISM,
}

export const EXACTLY_DEPOSIT_OPTIMISM_ABIS: Record<OptimismToken, Abi> = {
  USDC: DEPOSIT_USDC_OPTIMISM,
  ETH: DEPOSIT_ETH_OPTIMISM,
  OP: DEPOSIT_OP_OPTIMISM,
}

export const ETHEREUM_MAINNET_TOKENS = [
  'USDC',
  'WSTETH',
  'WBTC',
  'USDT',
] as const
export const OPTIMISM_TOKENS = ['USDC', 'ETH', 'OP'] as const

export enum ChainId {
  ETHEREUM_MAINNET = 1,
  OPTIMISM = 10,
}

export const TOKENS: Record<ChainId, Token<ChainId>[]> = {
  [ChainId.ETHEREUM_MAINNET]: [...ETHEREUM_MAINNET_TOKENS],
  [ChainId.OPTIMISM]: [...OPTIMISM_TOKENS],
}

export const EXACTLY_DEPOSIT_TOKENS: Record<ChainId, Token<ChainId>[]> = {
  [ChainId.ETHEREUM_MAINNET]: [...ETHEREUM_MAINNET_TOKENS],
  [ChainId.OPTIMISM]: [...OPTIMISM_TOKENS],
}

export const ABIS: ChainTokenAbis = {
  [ChainId.ETHEREUM_MAINNET]: ETHEREUM_ABIS,
  [ChainId.OPTIMISM]: OPTIMISM_ABIS,
}

export const EXACTLY_DEPOSIT_ABIS: ChainTokenAbis = {
  [ChainId.ETHEREUM_MAINNET]: EXACTLY_DEPOSIT_ETHEREUM_ABIS,
  [ChainId.OPTIMISM]: EXACTLY_DEPOSIT_OPTIMISM_ABIS,
}

export const EXACTLY_USDC_CONTRACT_ADDRESS =
  '0x660e2fC185a9fFE722aF253329CEaAD4C9F6F928'

export const RPCS = {
  [ChainId.ETHEREUM_MAINNET]: 'https://rpc.payload.de',
  [ChainId.OPTIMISM]: 'https://mainnet.optimism.io',
}

export const CHAIN_NAMES = {
  [ChainId.ETHEREUM_MAINNET]: 'Ethereum Mainnet',
  [ChainId.OPTIMISM]: 'Optimism',
}

export const TOKEN_ADDRESES: { [C in ChainId]: ChainAddresses<C> } = {
  [ChainId.ETHEREUM_MAINNET]: ETHEREUM_TOKEN_ADDRESSES,
  [ChainId.OPTIMISM]: OPTIMISM_TOKEN_ADDRESSES,
}

export const EXACTLY_DEPOSIT_TOKEN_ADDRESSES: {
  [C in ChainId]: ChainAddresses<C>
} = {
  [ChainId.ETHEREUM_MAINNET]: EXACTLY_ETHEREUM_DEPOSIT_TOKEN_ADDRESSES,
  [ChainId.OPTIMISM]: EXACTLY_OPTIMISM_DEPOSIT_TOKEN_ADDRESSES,
}
