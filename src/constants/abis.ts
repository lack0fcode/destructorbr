// src/constants/abis.ts

export const BURNFI_ABI = [
    {
      inputs: [
        { internalType: "address[]", name: "tokens", type: "address[]" },
        { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      ],
      name: "burnTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  