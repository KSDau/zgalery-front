import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wallet, User, LogOut } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { useLocation } from "wouter";

/**
 * WalletConnection component that handles Web3 wallet connection and display
 * of the connected wallet address.
 */
export default function WalletConnection() {
  const { address, isConnecting, connectWallet, disconnectWallet } = useWeb3();
  const [, setLocation] = useLocation();

  if (address) {
    return (
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge 
              variant="secondary" 
              className="px-4 py-2 font-mono text-sm cursor-pointer hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: 'hsl(var(--zg-secondary))',
                color: 'hsl(var(--zg-muted))'
              }}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {address.substring(0, 6)}...{address.substring(38)}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLocation("/profile")}>
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={disconnectWallet}>
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Button 
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-2 font-medium transition-colors duration-200"
        style={{ 
          backgroundColor: 'hsl(var(--zg-primary))',
          color: 'hsl(var(--zg-bg))'
        }}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    </div>
  );
}
