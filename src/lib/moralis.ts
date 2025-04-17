// lib/moralis.ts
import Moralis from 'moralis';

export const initializeMoralis = () => {
  if (!Moralis.Core.isStarted) {
    Moralis.start({ apiKey: process.env.MORALIS_API_KEY! });
  }
};
