#!/bin/bash
# AgentWallet Setup Script for Unbrowse
# This script helps connect to AgentWallet for x402 payments

set -e

WALLET_CONFIG="/root/.openclaw/workspace/.secrets/wallet.json"

echo "=== Unbrowse Wallet Setup ==="
echo ""

if [ -f "$WALLET_CONFIG" ]; then
  PUBKEY=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$WALLET_CONFIG')).publicKey)")
  echo "✅ Local devnet wallet exists: $PUBKEY"
  echo ""
fi

echo "📋 To connect AgentWallet (for production x402 payments):"
echo ""
echo "1. Visit https://agentwallet.mcpay.tech"
echo "2. Sign up / log in with your email"
echo "3. Create a new agent wallet"
echo "4. Copy the API key and wallet address"
echo "5. Update $WALLET_CONFIG with:"
echo '   { "agentWalletApiKey": "<key>", "agentWalletAddress": "<addr>" }'
echo ""
echo "📋 To get devnet SOL for testing:"
echo "  - Visit https://faucet.solana.com"
echo "  - Paste your public key: $PUBKEY"
echo "  - Request devnet SOL"
echo ""
echo "Done!"
