// lib/thirdweb.ts
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID!, // Corrigido o nome da env var
});
