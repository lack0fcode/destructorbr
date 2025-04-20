// lib/fetchWalletTokens.ts
export async function fetchWalletTokens(address: string, chainId: number) {
    try {
      // Converte o chainId para o formato hexadecimal (com prefixo '0x')
      const chainHex = `0x${chainId.toString(16)}`; // converte chainId para hexadecimal com prefixo '0x'
  
      console.log(`Buscando tokens para o endereço: ${address}, chainId (hex): ${chainHex}`);
  
      // Monta a URL para a requisição à API que você configurou com Moralis
      const queryParams = new URLSearchParams({
        address,
        chain: chainHex, // Passa o chainId como hexadecimal
      });
  
      console.log(`URL da requisição: /api/token-balances?${queryParams.toString()}`);
  
      // Realiza a requisição à API interna
      const res = await fetch(`/api/token-balances?${queryParams.toString()}`);
  
      if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);
  
      const data = await res.json();
  
      return data ?? []; // Retorna os dados dos tokens recebidos
    } catch (error) {
      console.error("Erro ao buscar tokens:", error);
      return [];
    }
  }
  