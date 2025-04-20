'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { fetchWalletTokens } from '@/lib/fetchWalletTokens';
import SearchBar from '@/components/SearchBar';
import AssetsTable from '@/components/AssetsTable';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [inputAddress, setInputAddress] = useState('');
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokenBalances = async (address: string) => {
    if (!chainId) {
      console.warn('Nenhuma chain conectada');
      return;
    }
  
    setLoading(true);
    setTokens([]);
  
    try {
      const tokens = await fetchWalletTokens(address, chainId);
      setTokens(tokens);
      setSearchAddress(address);
    } catch (err) {
      console.error('Erro ao buscar tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!inputAddress) return;
    await fetchTokenBalances(inputAddress);
  };

  const handleCheckConnected = async () => {
    if (isConnected && address) {
      setInputAddress(address);
      await fetchTokenBalances(address);
    }
  };

  useEffect(() => {
    // Se já conectado e quer exibir saldos ao abrir
    // handleCheckConnected();
  }, [address, chainId]);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6">
      <header className="flex justify-between items-center mb-10 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">BurnFi</h1>
        <ConnectButton />
      </header>

      <section className="flex justify-center mb-10">
        <div className="w-full max-w-5xl">
          <SearchBar
            value={inputAddress}
            onChange={setInputAddress}
            onSearch={handleSearch}
            onCheckConnected={handleCheckConnected}
          />
        </div>
      </section>

      {loading && (
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {searchAddress && !loading && (
        <AssetsTable
          tokens={tokens}
          onConfirmedChainChange={async () => {
            if (searchAddress) {
              await fetchTokenBalances(searchAddress);
            }
          }}
        />
      )}
    </main>
  );
}
