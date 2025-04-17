"use client";

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "../lib/thirdweb";
import { sepolia, baseSepolia } from "thirdweb/chains";
import { useEffect, useState } from "react";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
];

export default function ConnectWallet() {
  const [isConnected, setIsConnected] = useState(false);

  // Função para solicitar assinatura
  const requestSignature = async () => {
    try {
      const provider = window.ethereum;
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const message = `Autorizando conexão com o site...`;
          const signature = await provider.request({
            method: 'personal_sign',
            params: [message, accounts[0]],
          });
          console.log('Assinatura obtida:', signature);
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar assinatura:', error);
    }
  };

  // Efeito para monitorar mudanças de conta ou conexão
  useEffect(() => {
    const provider = window.ethereum;
    if (provider) {
      provider.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          setIsConnected(true);
          await requestSignature();
        } else {
          setIsConnected(false);
        }
      });
    }
    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chains={[sepolia, baseSepolia]}
      connectModal={{
        size: "compact",
        showThirdwebBranding: false,
      }}
      onConnect={async () => {
        // Solicita assinatura após a conexão
        if (!isConnected) {
          await requestSignature();
          setIsConnected(true);
        }
      }}
    />
  );
}
