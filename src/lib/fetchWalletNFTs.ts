import { ALCHEMY_URLS } from "./endpoints";

export async function fetchWalletNFTs(address: string, chainId: number) {
  const ALCHEMY_URL = ALCHEMY_URLS[chainId];

  if (!ALCHEMY_URL) {
    console.warn(`ChainId ${chainId} não suportada.`);
    return [];
  }

  try {
    const res = await fetch(
      `${ALCHEMY_URL}/getNFTs?owner=${address}&withMetadata=true`
    );

    if (!res.ok) {
      throw new Error(`Erro na resposta da API: ${res.status}`);
    }

    const data = await res.json();
    return data.ownedNfts ?? [];
  } catch (error) {
    console.error("Erro ao buscar NFTs com Alchemy:", error);
    return [];
  }
}
