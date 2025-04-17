'use client';

import { useEffect, useRef, useState } from 'react';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { getBlockExplorerUrl } from '@/utils/blockExplorer';
import Image from 'next/image';

interface Token {
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  token_address: string;
  logo?: string | null;
  possible_spam?: boolean;
  [key: string]: any;
}

interface NFT {
  name?: string;
  token_id: string;
  token_address: string;
  media?: { gateway?: string }[];
  metadata?: { image?: string };
  possible_spam?: boolean;
  amount?: string;
}

interface Props {
  tokens: Token[];
  nfts: NFT[];
  onConfirmedChainChange: () => void;
}

type SortKey = 'name' | 'balance' | 'spam';
type SortDirection = 'asc' | 'desc';

function isValidUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function AssetsTable({ tokens, nfts, onConfirmedChainChange  }: Props) {
  const chain = useActiveWalletChain();
  const account = useActiveAccount();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const previousChainId = useRef<number | undefined>(chain?.id);

  useEffect(() => {
    const detectChainChange = async () => {
      if (
        chain?.id &&
        previousChainId.current &&
        chain.id !== previousChainId.current
      ) {
        try {
          const message = `Confirme a troca de rede para ${chain.name}`;
          await account?.signMessage?.({ message });
          // Chama a função informando que o usuário confirmou
          onConfirmedChainChange();
        } catch (err) {
          console.warn('Assinatura cancelada ou falhou', err);
          // Nada acontece se cancelar
        }
      }

      previousChainId.current = chain?.id;
    };

    detectChainChange();
  }, [chain?.id, chain?.name, account, onConfirmedChainChange]);

  const combinedAssets = [
    ...tokens.map((token) => ({
      type: 'Token',
      logo: token.logo,
      name: token.name || 'Unknown',
      balance: parseFloat(token.balance || '0') / Math.pow(10, token.decimals || 18),
      contractAddress: token.token_address,
      possibleSpam: token.possible_spam ?? false,
    })),
    ...nfts.map((nft) => ({
      type: 'NFT',
      logo: nft.media?.[0]?.gateway || nft.metadata?.image || '',
      name: nft.name || 'NFT sem nome',
      balance: Number(nft.amount || '1'),
      contractAddress: nft.token_address,
      possibleSpam: nft.possible_spam ?? false,
    })),
  ];

  const sortedAssets = [...combinedAssets].sort((a, b) => {
    let result = 0;
    if (sortKey === 'name') result = a.name.localeCompare(b.name);
    else if (sortKey === 'balance') result = a.balance - b.balance;
    else if (sortKey === 'spam') result = Number(a.possibleSpam) - Number(b.possibleSpam);
    return sortDirection === 'asc' ? result : -result;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getArrow = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="mt-10 space-y-10">
      {sortedAssets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-white/20 rounded-md">
            <thead className="bg-white/10 text-sm uppercase text-white/80">
              <tr>
                <th className="px-4 py-2">Logo</th>
                <th className="px-4 py-2">Tag</th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                  Nome {getArrow('name')}
                </th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('balance')}>
                  Balance {getArrow('balance')}
                </th>
                <th className="px-4 py-2">Contrato</th>
                <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('spam')}>
                  Spam {getArrow('spam')}
                </th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedAssets.map((asset, idx) => (
                <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-2">
                    {isValidUrl(asset.logo) ? (
                      <Image src={asset.logo!} alt={asset.name} width={32} height={32} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20" />
                    )}
                  </td>
                  <td className="px-4 py-2">{asset.type}</td>
                  <td className="px-4 py-2">{asset.name}</td>
                  <td className="px-4 py-2">
                    {asset.type === 'Token'
                      ? asset.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 6,
                        })
                      : asset.balance}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs truncate max-w-[160px]">
                    {asset.contractAddress}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs ${asset.possibleSpam ? 'text-red-500' : 'text-green-400'}`}>
                      {asset.possibleSpam ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <a
                      href={getBlockExplorerUrl(chain?.id, asset.contractAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm"
                    >
                      Ver no Explorer
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">Nenhum token ou NFT encontrado.</p>
      )}
    </div>
  );
}
