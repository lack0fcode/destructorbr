// utils/blockExplorer.ts

export const blockExplorers: Record<number, string> = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
  84532: 'https://base-sepolia.blockscout.com',
  8453: 'https://basescan.org',
  // adicione mais conforme necessário
};

export function getBlockExplorerUrl(chainId: number | undefined, address: string) {
  const base = chainId ? blockExplorers[chainId] : undefined;
  return base ? `${base}/address/${address}` : `https://etherscan.io/address/${address}`;
}
