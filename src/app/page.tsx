'use client';

import { useState } from 'react';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import ConnectWallet from '../components/ConnectWallet';
import SearchBar from '../components/SearchBar';
import AssetsTable from '../components/AssetsTable';

export default function Home() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const [inputAddress, setInputAddress] = useState('');
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletAssets = async (address: string, requiresSignature = false) => {
    if (!chain?.id) {
      console.warn("Nenhuma chain conectada.");
      return;
    }

    setLoading(true);

    try {
      let message = '';
      let signature = '';

      if (requiresSignature && account?.signMessage) {
        message = `Requisitando a busca de NFTs e Tokens ${address} para buscar NFTs e tokens.`;
        signature = await account.signMessage({ message });
      }

      const queryParams = new URLSearchParams({
        address,
        chain: chain.id.toString(), // <- importante!
        ...(requiresSignature ? { message, signature } : {}),
      });

      const [nftsRes, tokensRes] = await Promise.all([
        fetch(`/api/nfts?${queryParams.toString()}`),
        fetch(`/api/token-balances?${queryParams.toString()}`),
      ]);

      if (!nftsRes.ok) throw new Error(`Erro ao buscar NFTs: ${nftsRes.statusText}`);
      if (!tokensRes.ok) throw new Error(`Erro ao buscar tokens: ${tokensRes.statusText}`);

      const nftsData = await nftsRes.json();
      const tokensData = await tokensRes.json();

      setNfts(nftsData.result || []);
      setTokens(Array.isArray(tokensData) ? tokensData : tokensData.result || []);
      setSearchAddress(address);
    } catch (err) {
      console.error('Erro ao buscar dados da carteira:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!inputAddress) return;

    const isConnectedAddress = account?.address?.toLowerCase() === inputAddress.toLowerCase();
    await fetchWalletAssets(inputAddress, isConnectedAddress);
  };

  const handleCheckConnected = async () => {
    if (account?.address) {
      setInputAddress(account.address);
      await fetchWalletAssets(account.address, true);
    }
  };

  return (
    <main className="min-h-screen text-white bg-black px-4 py-6">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">Destructor BR</h1>
        <ConnectWallet />
      </header>

      <div className="flex justify-center mb-10">
        <div className="w-full max-w-5xl">
          <SearchBar
            value={inputAddress}
            onChange={setInputAddress}
            onSearch={handleSearch}
            onCheckConnected={handleCheckConnected}
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

  {searchAddress && !loading && (
    <AssetsTable
      tokens={tokens}
      nfts={nfts}
      onConfirmedChainChange={async () => {
        if (searchAddress) {
          setTokens([]);
          setNfts([]);
          setLoading(true);
          await fetchWalletAssets(searchAddress, account?.address === searchAddress);
          setLoading(false);
        }
      }}
    />
  )}
    </main>
  );
}
