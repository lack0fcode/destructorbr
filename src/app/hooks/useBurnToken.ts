import { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';

const BURNFI_ABI = [
  {
    type: 'function',
    name: 'burnTokens',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'tokens',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'amounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [],
  },
];

const BURNFI_PROXY = '0x9b9FEe4532170621b1016035617F320d7B2f9B8F';

export function useBurnToken() {
  const [loading, setLoading] = useState(false);
  const [txMessage, setTxMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    link?: string;
  } | null>(null);

  const { data: walletClient } = useWalletClient();

  const burnToken = async (tokenAddress: string, amount: string) => {
    if (!walletClient) return;
  
    setLoading(true);
    setTxMessage(null);
  
    try {
      const amountParsed = parseUnits(amount, 18); // <<< Aqui está o que faltava
  
      const hash = await walletClient.writeContract({
        address: BURNFI_PROXY,
        abi: BURNFI_ABI,
        functionName: 'burnTokens',
        args: [[tokenAddress], [BigInt(amount)]],
      });
  
      setTxMessage({
        type: 'success',
        text: '🔥 Token queimado com sucesso!',
        link: `https://base-sepolia.blockscout.com/tx/${hash}`,
      });
    } catch (err: any) {
      console.error('❌ Erro no processo de queima:', err);
      setTxMessage({
        type: 'error',
        text: err?.shortMessage || err?.message || 'Erro ao queimar o token.',
      });
    } finally {
      setLoading(false);
    }
  };
  

  return {
    burnToken,
    loading,
    txMessage,
  };
}
