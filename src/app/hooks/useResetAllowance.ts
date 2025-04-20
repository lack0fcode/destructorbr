import { useState } from 'react'
import { ethers } from 'ethers'
import { useWalletClient } from 'wagmi'

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
]

const BURNFI_PROXY = '0x9b9FEe4532170621b1016035617F320d7B2f9B8F'

export function useResetAllowance() {
  const [loading, setLoading] = useState(false)
  const [txMessage, setTxMessage] = useState<{
    type: 'success' | 'error'
    text: string
    link?: string
  } | null>(null)

  const { data: walletClient } = useWalletClient()

  const resetAllowance = async (tokenAddress: string) => {
    setLoading(true)
    setTxMessage(null)

    try {
      if (!walletClient) {
        throw new Error('Wallet não conectada')
      }

      const signer = new ethers.providers.Web3Provider(
        walletClient.transport,
        'any'
      ).getSigner()

      const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      const resetTx = await erc20.approve(BURNFI_PROXY, 0) // Resetando allowance
      await resetTx.wait()

      setTxMessage({
        type: 'success',
        text: '✅ Allowance resetado com sucesso!',
        link: `https://sepolia.basescan.org/tx/${resetTx.hash}`,
      })
    } catch (err: any) {
      console.error('❌ Erro ao resetar allowance:', err)
      setTxMessage({
        type: 'error',
        text: err?.reason || err?.message || 'Erro ao resetar o allowance.',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    resetAllowance,
    loading,
    txMessage,
  }
}
