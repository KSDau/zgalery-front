import { Link, useLocation } from "wouter";
import WalletConnection from "./wallet-connection";

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
        borderColor: 'hsl(var(--zg-border))',
        backgroundColor: 'hsl(var(--zg-bg))'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 
                className="text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: 'hsl(var(--zg-primary))' }}
              >
                zgallery
              </h1>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/marketplace">
              <a 
                className={`font-medium transition-colors duration-200 ${
                  location === "/" || location === "/marketplace" 
                    ? "text-primary" 
                    : "hover:text-primary"
                }`}
                style={{ 
                  color: location === "/" || location === "/marketplace" 
                    ? 'hsl(var(--zg-primary))' 
                    : 'hsl(var(--zg-muted))'
                }}
              >
                Marketplace
              </a>
            </Link>
            <Link href="/sell">
              <a 
                className={`font-medium transition-colors duration-200 ${
                  location === "/sell" 
                    ? "text-primary" 
                    : "hover:text-primary"
                }`}
                style={{ 
                  color: location === "/sell" 
                    ? 'hsl(var(--zg-primary))' 
                    : 'hsl(var(--zg-muted))'
                }}
              >
                Sell Item
              </a>
            </Link>
            <button 
              className="transition-colors duration-200 hover:text-primary"
              style={{ color: 'hsl(var(--zg-muted))' }}
            >
              About
            </button>
          </nav>
          
          {/* Wallet Connection */}
          <WalletConnection />
        </div>
      </div>
    </header>
  );
}
