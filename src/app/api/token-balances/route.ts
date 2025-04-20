import { NextRequest } from 'next/server';
import Moralis from 'moralis';
import { initializeMoralis } from '@/lib/moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');



  try {
    initializeMoralis();

    const chain = EvmChain.BASE_SEPOLIA; // Replace with the desired chain, e.g., EvmChain.ETHEREUM

    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain,
      excludeSpam: false,
      address: address || '',
    });

    return Response.json(response.raw);
  } catch (error) {
    console.error('Erro ao buscar token balances:', error);
    return Response.json({ error: 'Failed to fetch token balances' }, { status: 500 });
  }
}
