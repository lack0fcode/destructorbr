"use client";

interface NFT {
  contract: { address: string };
  media?: { gateway: string }[];
  metadata?: { image?: string; name?: string };
  title?: string;
}

interface Token {
  contractAddress: string;
  tokenBalance: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  logo?: string;
}

interface Props {
  address: string;
  nfts: NFT[];
  tokens: Token[];
}

function isValidUrl(url?: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 🧭 Explorers por chainId
function getExplorerUrl(contractAddress: string, chainId: number | null = 11155111): string {
  switch (chainId) {
    case 11155111: // Ethereum Sepolia
      return `https://sepolia.etherscan.io/address/${contractAddress}`;
    case 84532: // Base Sepolia
      return `https://sepolia.basescan.org/address/${contractAddress}`;
    default:
      return `https://etherscan.io/address/${contractAddress}`;
  }
}

// Função para determinar se o asset é considerado spam
function isSpam(name: string | undefined): string {
  if (!name) return "not-spam";  // Default como "NOT SPAM"
  // Adiciona outras palavras-chave associadas a spam, se necessário
  const spamKeywords = ["spam", "scam", "fraud", "rugpull"];
  return spamKeywords.some(keyword => name.toLowerCase().includes(keyword)) ? "spam" : "not-spam";
}

import { useActiveWalletChain } from "thirdweb/react";

export default function AssetTable({ address, nfts, tokens }: Props) {
  const chain = useActiveWalletChain();
  const chainId = chain?.id || 11155111; // fallback para Ethereum Sepolia

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Assets de {address}</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-white divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 text-left">
                <input type="checkbox" name="asset-checkbox-all" id="asset-checkbox-all" />
              </th>
              <th className="px-4 py-2 text-left">Asset</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Balance / Amount</th>
              <th className="px-4 py-2 text-left">SPAM</th> {/* Coluna SPAM */}
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gray-800 text-white">
            {/* NFTs */}
            {nfts.map((nft, index) => {
              const imageUrl =
                nft.media?.[0]?.gateway || nft.metadata?.image || "";
              const contractAddress = nft.contract.address;
              const spamStatus = isSpam(nft.title || nft.metadata?.name);

              return (
                <tr key={`nft-${index}`}>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      name={`nft-checkbox-${index}`}
                      id={`nft-checkbox-${index}`}
                    />
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <img
                      src={isValidUrl(imageUrl) ? imageUrl : "/favicon.ico"}
                      alt={nft.title || nft.metadata?.name || "NFT"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">
                        {nft.title || nft.metadata?.name || "NFT sem nome"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {contractAddress.slice(0, 6)}...
                        {contractAddress.slice(-4)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                      NFT
                    </span>
                  </td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2 text-xs" style={{ color: spamStatus === "spam" ? "red" : "green" }}>
                    {spamStatus === "spam" ? "SPAM" : "NOT SPAM"} {/* Exibe SPAM ou NOT SPAM com cores */}
                  </td>
                  <td className="px-4 py-2 text-sm text-blue-400">
                    <a
                      href={getExplorerUrl(contractAddress, chainId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Ver no Explorer
                    </a>
                  </td>
                </tr>
              );
            })}

            {/* Tokens */}
            {tokens.map((token, index) => {
              const tokenImage = isValidUrl(token.logo) ? token.logo : "/favicon.ico";
              const name = token.name || "Token sem nome";
              const symbol = token.symbol || "???";
              const decimals = token.decimals ?? 18;
              const contractAddress = token.contractAddress;
              const spamStatus = isSpam(token.name);

              let formattedBalance = Number(token.tokenBalance);
              if (!isNaN(formattedBalance)) {
                formattedBalance = formattedBalance / 10 ** decimals;
              } else {
                formattedBalance = 0;
              }

              return (
                <tr key={`token-${index}`}>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      name={`token-checkbox-${index}`}
                      id={`token-checkbox-${index}`}
                    />
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <img
                      src={tokenImage}
                      alt={symbol}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{name}</div>
                      <div className="text-xs text-gray-400">
                        {contractAddress.slice(0, 6)}...
                        {contractAddress.slice(-4)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                      Token
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {formattedBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6,
                    })}{" "}
                    {symbol}
                  </td>
                  <td className="px-4 py-2 text-xs" style={{ color: spamStatus === "spam" ? "red" : "green" }}>
                    {spamStatus === "spam" ? "SPAM" : "NOT SPAM"} {/* Exibe SPAM ou NOT SPAM com cores */}
                  </td>
                  <td className="px-4 py-2 text-sm text-blue-400">
                    <a
                      href={getExplorerUrl(contractAddress, chainId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Ver no Explorer
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
