'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { getBlockExplorerUrl } from '@/utils/blockExplorer';
import Image from 'next/image';
import { useBurnToken } from '@/app/hooks/useBurnToken';
import { useApproveAllowance } from '@/app/hooks/useApproveAllowance';
import { useResetAllowance } from '@/app/hooks/useResetAllowance';

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

interface Props {
  tokens: Token[];
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

export default function AssetsTable({ tokens, onConfirmedChainChange }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { burnToken, loading: burning, txMessage: burnMessage } = useBurnToken();
  const { approveAllowance, loading: approving, txMessage: approveMessage } = useApproveAllowance();
  const { resetAllowance, loading: resetting, txMessage: resetMessage } = useResetAllowance();

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());

  const previousChainId = useRef<number | undefined>(chainId);

  useEffect(() => {
    const detectChainChange = async () => {
      if (chainId && previousChainId.current && chainId !== previousChainId.current) {
        try {
          const message = `Confirme a troca de rede para ${baseSepolia.name}`;
          await signMessageAsync({ message });
          onConfirmedChainChange();
        } catch (err) {
          console.warn('Assinatura cancelada ou falhou', err);
        }
      }
      previousChainId.current = chainId;
    };

    if (isConnected && address) {
      detectChainChange();
    }
  }, [chainId, signMessageAsync, address, isConnected, onConfirmedChainChange]);

  const combinedAssets = tokens.map((token) => ({
    type: 'Token',
    logo: token.logo,
    name: token.name || 'Unknown',
    symbol: token.symbol,
    decimals: token.decimals,
    balance: parseFloat(token.balance || '0') / Math.pow(10, token.decimals || 18),
    rawBalance: token.balance,
    contractAddress: token.token_address,
    possibleSpam: token.possible_spam ?? false,
  }));

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

  const toggleTokenSelection = (contractAddress: string) => {
    setSelectedTokens((prev) => {
      const newSet = new Set(prev);
      newSet.has(contractAddress) ? newSet.delete(contractAddress) : newSet.add(contractAddress);
      return newSet;
    });
  };

  const handleBurn = async (contractAddress: string, rawBalance: string, decimals: number) => {
    try {
      await resetAllowance(contractAddress); // Resetando allowance
      await approveAllowance(contractAddress, rawBalance); // Aprovando allowance
      await burnToken(contractAddress, rawBalance); // Realizando a queima
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchBurn = async () => {
    console.log('Batch burn tokens:', [...selectedTokens]);
    // 🔥 Lógica futura de queima em lote
  };

  return (
    <div className="mt-10 space-y-6">
      {sortedAssets.length > 0 ? (
        <>
          {selectedTokens.size > 0 && (
            <div className="text-right">
              <button
                onClick={handleBatchBurn}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Burn selection ({selectedTokens.size})
              </button>
            </div>
          )}

          {burnMessage && (
            <div
              className={`p-4 rounded text-sm ${
                burnMessage.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
              }`}
            >
              {burnMessage.text}
              {burnMessage.link && (
                <a href={burnMessage.link} target="_blank" rel="noopener noreferrer" className="ml-2 underline">
                  Ver tx
                </a>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border border-white/20 rounded-md">
              <thead className="bg-white/10 text-sm uppercase text-white/80">
                <tr>
                  <th className="px-4 py-2">Select</th>
                  <th className="px-4 py-2">Logo</th>
                  <th className="px-4 py-2">Tag</th>
                  <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                    Token name {getArrow('name')}
                  </th>
                  <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('balance')}>
                    Balance {getArrow('balance')}
                  </th>
                  <th className="px-4 py-2">Contract</th>
                  <th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort('spam')}>
                    Spam {getArrow('spam')}
                  </th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sortedAssets.map((asset, idx) => (
                  <tr key={idx} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedTokens.has(asset.contractAddress)}
                        onChange={() => toggleTokenSelection(asset.contractAddress)}
                      />
                    </td>
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
                      {asset.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 6,
                      })}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs truncate max-w-[160px]">
                      {asset.contractAddress}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs ${asset.possibleSpam ? 'text-red-500' : 'text-green-400'}`}>
                        {asset.possibleSpam ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex flex-col gap-1 text-sm">
                      <a
                        href={getBlockExplorerUrl(chainId, asset.contractAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Block Explorer
                      </a>
                      <button
                        onClick={() => handleBurn(asset.contractAddress, asset.rawBalance, asset.decimals)}
                        className="text-red-500 hover:underline disabled:opacity-50"
                        disabled={burning || approving || resetting}
                      >
                        {burning || approving || resetting ? 'Processing...' : 'Burn'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-gray-400">No token found.</p>
      )}
    </div>
  );
}
