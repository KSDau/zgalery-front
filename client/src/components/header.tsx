import { Link, useLocation } from "wouter";
import SimpleWalletButton from "./simple-wallet-button";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";

/**
 * Header component that displays the main navigation and wallet connection
 * for the zgallery application.
 */
export default function Header() {
  const [location] = useLocation();

  return (
    <header
      className="border-b sticky top-0 z-50"
      style={{
        borderColor: "hsl(var(--zg-border))",
        backgroundColor: "hsl(var(--zg-bg))",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span
                className="text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: "hsl(var(--zg-primary))" }}
              >
                zgallery
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/marketplace">
              <span
                className={`font-medium transition-colors duration-200 cursor-pointer ${
                  location === "/" || location === "/marketplace"
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
                style={{
                  color:
                    location === "/" || location === "/marketplace"
                      ? "hsl(var(--zg-primary))"
                      : "hsl(var(--zg-muted))",
                }}
              >
                Marketplace
              </span>
            </Link>
            <Link href="/sell">
              <span
                className={`font-medium transition-colors duration-200 cursor-pointer ${
                  location === "/sell" ? "text-primary" : "hover:text-primary"
                }`}
                style={{
                  color:
                    location === "/sell"
                      ? "hsl(var(--zg-primary))"
                      : "hsl(var(--zg-muted))",
                }}
              >
                Sell Item
              </span>
            </Link>
            <Link href="/creator">
              <span
                className={`font-medium transition-colors duration-200 cursor-pointer ${
                  location === "/creator"
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
                style={{
                  color:
                    location === "/creator"
                      ? "hsl(var(--zg-primary))"
                      : "hsl(var(--zg-muted))",
                }}
              >
                Creator
              </span>
            </Link>
          </nav>

          {/* Wallet Connection */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
