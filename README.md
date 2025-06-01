# zgallery - Luxury Web3 Marketplace

A cutting-edge Web3 marketplace for authenticated luxury items built on the Aleo blockchain. zgallery provides a secure, transparent, and engaging digital platform for high-end collectible transactions.

## Features

### 🏪 Marketplace
- Browse authenticated luxury items from premium brands
- Real-time inventory with detailed item specifications
- Advanced search and filtering capabilities
- Item detail pages with conservation status and certification
- Direct purchase system with fixed pricing

### 👨‍💼 Creator Dashboard
- Comprehensive brand and item management
- Mint new items from collections with batch creation
- Advanced holder analytics with Aleo address tracking
- Portfolio value calculations and conversion metrics
- Contact preference management for collectors

### 💎 Luxury Categories
- **Watches**: Rolex, Patek Philippe, Audemars Piguet, Cartier
- **Jewelry**: Tiffany & Co., Cartier precious metals and diamonds
- **Handbags**: Hermès, Chanel designer collections
- **All items**: Authenticated with proper identification numbers

### 🔗 Blockchain Integration
- Leo wallet adapter for secure Aleo connections
- TestnetBeta network configuration
- Automatic wallet detection and connection
- Transaction support for marketplace operations

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Wouter** for client-side routing
- **TanStack Query** for data management
- **Tailwind CSS** with custom design system
- **Radix UI** components for accessibility

### Backend
- **Express.js** server with TypeScript
- **PostgreSQL** database with Drizzle ORM
- **RESTful API** with full CRUD operations
- **Session management** with connect-pg-simple

### Blockchain
- **Aleo blockchain** integration
- **Leo Wallet Adapter** for wallet connectivity
- **TestnetBeta** network support
- **Smart contract** preparation for NFT operations

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Leo Wallet browser extension (for Web3 features)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd zgallery
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Database configuration is handled automatically by Replit
# For local development, ensure DATABASE_URL is configured
```

4. Initialize the database
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
zgallery/
├── client/               # Frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and configurations
│   │   └── data/         # Type definitions and constants
│   └── index.html
├── server/               # Backend application
│   ├── index.ts         # Express server entry point
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database storage interface
│   ├── db.ts            # Database connection
│   └── vite.ts          # Vite integration
├── shared/               # Shared code between client/server
│   └── schema.ts        # Database schema and types
└── docs/                # Documentation
```

## API Endpoints

### Brands
- `GET /api/brands` - List all brands
- `GET /api/brands/:id` - Get brand details
- `POST /api/brands` - Create new brand
- `GET /api/brands/:id/items` - Get brand items

### Items
- `GET /api/items` - List all luxury items
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Remove item

### Users
- `GET /api/users/:aleoAddress` - Get user by Aleo address
- `POST /api/users` - Create new user
- `GET /api/users/:id/brands` - Get user's brands

## Database Schema

### Core Tables
- **brands**: Luxury brand information and verification status
- **luxury_items**: Item catalog with specifications and pricing
- **users**: User profiles with Aleo wallet addresses
- **item_ownership**: Ownership tracking and transfer history

### Key Features
- Automatic timestamp tracking
- Brand-item relationships
- User ownership management
- Conservation status tracking
- Certification validation

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open database management interface

### Code Style
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Modular component architecture
- RESTful API design patterns

## Deployment

The application is optimized for deployment on Replit with:
- Automatic database provisioning
- Environment variable management
- Integrated development workflow
- Production-ready configuration

## Contributing

1. Follow the established code structure
2. Use TypeScript for all new code
3. Implement proper error handling
4. Add documentation for new features
5. Test thoroughly before deployment

## Security Features

- Input validation with Zod schemas
- SQL injection prevention with Drizzle ORM
- Session-based authentication
- CORS configuration for production
- Secure wallet connection handling

## License

Private project - All rights reserved

## Support

For technical support or questions about the marketplace, please contact the development team.

---

**zgallery** - Where luxury meets blockchain technology