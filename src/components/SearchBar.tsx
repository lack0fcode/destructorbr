'use client';

import { useState, useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onCheckConnected: () => void;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onCheckConnected,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Pequeno delay pra permitir clicar no botão
    blurTimeout.current = setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-5xl flex items-center gap-4 relative">
      {/* Botão só aparece quando o input está focado */}
      {isFocused && (
        <button
          type="button"
          onClick={onCheckConnected}
          className="px-4 h-[48px] bg-white text-black rounded hover:bg-gray-300 transition text-sm whitespace-nowrap"
        >
          Check Connected
        </button>
      )}

      {/* Input + lupa */}
      <div className="relative flex-1">
        <input
          id="wallet-address"
          name="walletAddress"
          type="text"
          placeholder="Search EVM Address or ENS"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full text-white bg-black/80 px-4 py-3 pr-12 border border-white/20 rounded-md placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 h-[48px]"
        />

        {/* Lupa */}
        <button
          type="button"
          onClick={onSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black rounded-full p-2 hover:bg-gray-300 transition"
          aria-label="Search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}