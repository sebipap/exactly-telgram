import { ChainId, ETHEREUM_MAINNET_TOKENS, OPTIMISM_TOKENS } from './constants'

export type EthereumToken = (typeof ETHEREUM_MAINNET_TOKENS)[number]
export type OptimismToken = (typeof OPTIMISM_TOKENS)[number]
export type Token<ChainId> = ChainId extends 1 ? EthereumToken : OptimismToken

export type TokenAbis<ChainId> = Record<Token<ChainId>, Abi>

export type ChainTokenAbis = { [C in ChainId]: TokenAbis<C> }

export type Abi = string
