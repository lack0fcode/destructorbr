/** @type {import('next').NextConfig} */
const nextConfig = {
output: "standalone",

  images: {
    domains: [
      "ipfs.io",
      "nftstorage.link",
      "gateway.pinata.cloud",
      "cloudflare-ipfs.com",
      "i.seadn.io",
      "cdn.discordapp.com",
      "logo.moralis.io",
      "bafybe...", // se quiser adicionar IPFS direto
    ],
  },

  webpack: (config, { dev }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Adiciona esta linha pra evitar eval
    if (dev) {
      config.devtool = "source-map";
    }

    return config;
  },
};

export default nextConfig;
