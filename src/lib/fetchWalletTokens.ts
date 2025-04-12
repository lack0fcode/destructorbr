import { ALCHEMY_URLS } from "./endpoints";

interface TokenBalanceResponse {
  contractAddress: string;
  tokenBalance: string;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

export async function fetchWalletTokens(address: string, chainId: number) {
  const ALCHEMY_URL = ALCHEMY_URLS[chainId];

  if (!ALCHEMY_URL) {
    console.warn(`ChainId ${chainId} não suportada.`);
    return [];
  }

  try {
    const res = await fetch(ALCHEMY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenBalances",
        params: [address],
      }),
    });

    if (!res.ok) throw new Error(`Erro na resposta da API: ${res.status}`);

    const json = await res.json();
    const tokenBalances: TokenBalanceResponse[] = json.result.tokenBalances ?? [];

    const nonZeroTokens = tokenBalances.filter((t) => {
      try {
        return BigInt(t.tokenBalance) > 0n;
      } catch {
        return false;
      }
    });

    const enrichedTokens = await Promise.all(
      nonZeroTokens.map(async (token) => {
        const metadataRes = await fetch(ALCHEMY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getTokenMetadata",
            params: [token.contractAddress],
          }),
        });

        if (!metadataRes.ok) return null;

        const metadataJson = await metadataRes.json();
        const metadata: TokenMetadata = metadataJson.result;

        return {
          ...token,
          ...metadata,
        };
      })
    );

    return enrichedTokens.filter(Boolean);
  } catch (error) {
    console.error("Erro ao buscar tokens com Alchemy:", error);
    return [];
  }
}
