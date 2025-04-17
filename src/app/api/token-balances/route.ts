import { NextRequest } from 'next/server';
import Moralis from 'moralis';
import { initializeMoralis } from '@/lib/moralis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');

  if (!address || !chain) {
    return Response.json({ error: 'Wallet address and chain are required' }, { status: 400 });
  }

  try {
    initializeMoralis();

    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain, // usa a chain dinâmica aqui
      excludeSpam: false,
      address,
    });

    return Response.json(response.raw);
  } catch (error) {
    console.error('Erro ao buscar token balances:', error);
    return Response.json({ error: 'Failed to fetch token balances' }, { status: 500 });
  }
}
