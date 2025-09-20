#!/bin/bash

# BaseApp Token Setup Script
echo "🚀 BaseApp Token Setup"
echo "====================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ .env.local created. Please update it with your values."
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Compile contracts
echo "🔨 Compiling smart contracts..."
pnpm compile

if [ $? -eq 0 ]; then
    echo "✅ Contracts compiled successfully"
else
    echo "❌ Contract compilation failed"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with:"
echo "   - PRIVATE_KEY (your wallet private key)"
echo "   - BASESCAN_API_KEY (optional, for verification)"
echo ""
echo "2. Deploy to Base network:"
echo "   pnpm deploy:base-sepolia  # For testnet"
echo "   pnpm deploy:base          # For mainnet"
echo ""
echo "3. Update NEXT_PUBLIC_BASE_APP_TOKEN_ADDRESS in .env.local"
echo ""
echo "4. Start development server:"
echo "   pnpm dev"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"