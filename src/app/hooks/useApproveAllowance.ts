import { useState } from 'react';
import { erc20Abi } from 'viem';
import { useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';

const BURNFI_PROXY = '0x9b9FEe4532170621b1016035617F320d7B2f9B8F';

export function useApproveAllowance() {
  const [loading, setLoading] = useState(false);
  const [txMessage, setTxMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    link?: string;
  } | null>(null);

  const { data: walletClient } = useWalletClient();

  const approveAllowance = async (tokenAddress: string, amount: string) => {
    if (!walletClient) return;

    setLoading(true);
    setTxMessage(null);

    try {
      const amountParsed = BigInt(amount); // ajuste de decimais se necessário

      const hash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [BURNFI_PROXY, amountParsed],
      });

      setTxMessage({
        type: 'success',
        text: '✅ Aprovação realizada com sucesso!',
        link: `https://base-sepolia.blockscout.com/tx/${hash}`,
      });
    } catch (err: any) {
      console.error('❌ Erro ao aprovar allowance:', err);
      setTxMessage({
        type: 'error',
        text: err?.shortMessage || err?.message || 'Erro ao aprovar o allowance.',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    approveAllowance,
    loading,
    txMessage,
  };
}
