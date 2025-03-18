import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  monadTestnet,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [monadTestnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
