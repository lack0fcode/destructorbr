// components/ConnectWallet.tsx
"use client";

import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "../lib/thirdweb";
import { baseSepolia, sepolia } from "thirdweb/chains";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

function ConnectWallet() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chains={[sepolia, baseSepolia]}
      connectModal={{
        size: "compact",
        showThirdwebBranding: false,
      }}
    />
  );
}

export default ConnectWallet;
