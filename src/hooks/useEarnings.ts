import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getMasterChefContract } from '../panda/utils'
import usePanda from './usePanda'
import useBlock from './useBlock'

const useEarnings = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const {
    account,
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()
  const pnda = usePanda()
  const masterChefContract = getMasterChefContract(pnda)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(masterChefContract, pid, account)
    setBalance(new BigNumber(balance))
  }, [account, masterChefContract, pnda])

  useEffect(() => {
    if (account && masterChefContract && pnda) {
      fetchBalance()
    }
  }, [account, block, masterChefContract, setBalance, pnda])

  return balance
}

export default useEarnings
