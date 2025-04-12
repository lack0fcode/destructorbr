"use client";

import { useEffect, useState } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { fetchWalletNFTs } from "../lib/fetchWalletNFTs";
import { fetchWalletTokens } from "../lib/fetchWalletTokens";
import ConnectWallet from "../components/ConnectWallet";
import AssetTable from "../components/AssetTable";
import SearchBar from "../components/SearchBar";
import { ALCHEMY_URLS } from "../lib/endpoints";

export default function Home() {
  const account = useActiveAccount();
  const wallet = useActiveWallet(); // ✅ novo

  const [chainId, setChainId] = useState<number | null>(null); // ✅ novo
  const [inputAddress, setInputAddress] = useState("");
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Obter o chainId da carteira conectada
  useEffect(() => {
    const fetchChainId = async () => {
      if (wallet) {
        const chain = await wallet.getChain();
        if (chain) {
          setChainId(chain.id); // ✅ pegar apenas o chainId
        }
      }
    };
    fetchChainId();
  }, [wallet]);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!searchAddress || !chainId) return;

      const chainRpc = ALCHEMY_URLS[chainId];
      if (!chainRpc) {
        console.warn("Rede não suportada:", chainId);
        return;
      }

      setLoading(true);
      try {
        const [nftResult, tokenResult] = await Promise.all([
          fetchWalletNFTs(searchAddress, chainId),
          fetchWalletTokens(searchAddress, chainId),
        ]);
        setNfts(nftResult);
        setTokens(tokenResult);
      } catch (err) {
        console.error("Erro ao buscar assets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [searchAddress, chainId]);

  const handleSearch = () => {
    if (inputAddress.trim()) {
      setSearchAddress(inputAddress.trim());
    }
  };

  const handleCheckConnected = () => {
    if (account?.address) {
      setInputAddress(account.address);
      setSearchAddress(account.address);
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
        <AssetTable address={searchAddress} nfts={nfts} tokens={tokens} />
      )}
    </main>
  );
}
