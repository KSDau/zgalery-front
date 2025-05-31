import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { useMemo } from "react";
import NotFound from "@/pages/not-found";
import Marketplace from "@/pages/marketplace";
import ItemDetail from "@/pages/item-detail";
import SellItem from "@/pages/sell-item";
import CreatorDashboard from "@/pages/creator-dashboard";
import AuctionDetail from "@/pages/auction-detail";
import UserProfile from "@/pages/user-profile";
import Header from "@/components/header";

// Import wallet adapter styles
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

function Router() {
  return (
    <div className="min-h-screen">
      <Header />
      <Switch>
        <Route path="/" component={Marketplace} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/sell" component={SellItem} />
        <Route path="/creator" component={CreatorDashboard} />
        <Route path="/profile" component={UserProfile} />
        <Route path="/item/:id" component={ItemDetail} />
        <Route path="/auction/:id" component={AuctionDetail} />
        <Route component={NotFound} />
      </Switch>

      {/* Footer */}
      <footer
        className="border-t mt-16"
        style={{ borderColor: "hsl(var(--zg-border))" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "hsl(var(--zg-primary))" }}
              >
                zgallery
              </h3>
              <p style={{ color: "hsl(var(--zg-muted))" }}>
                The premier destination for authenticated luxury items on the
                blockchain.
              </p>
            </div>
            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "hsl(var(--zg-primary))" }}
              >
                Marketplace
              </h4>
              <ul
                className="space-y-2"
                style={{ color: "hsl(var(--zg-muted))" }}
              >
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Browse Items
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Categories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    New Arrivals
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "hsl(var(--zg-primary))" }}
              >
                Support
              </h4>
              <ul
                className="space-y-2"
                style={{ color: "hsl(var(--zg-muted))" }}
              >
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Authentication
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "hsl(var(--zg-primary))" }}
              >
                Connect
              </h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  style={{ color: "hsl(var(--zg-muted))" }}
                  className="hover:text-primary transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  style={{ color: "hsl(var(--zg-muted))" }}
                  className="hover:text-primary transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div
            className="border-t mt-8 pt-8 text-center"
            style={{
              borderColor: "hsl(var(--zg-border))",
              color: "hsl(var(--zg-muted))",
            }}
          >
            <p>
              &copy; 2024 zgallery. All rights reserved. Powered by blockchain
              technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "zgallery",
      }),
    ],
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider
        wallets={wallets}
        decryptPermission={DecryptPermission.AutoDecrypt}
        network={WalletAdapterNetwork.Testnet}
        autoConnect={true}
        programs={[
          "credits.aleo",
          "zgallery.aleo",
          "zgallery_marketplace.aleo",
        ]}
      >
        <WalletModalProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </WalletModalProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
