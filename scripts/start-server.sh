#!/bin/bash
# Unbrowse server + tunnel keep-alive
while true; do
  echo "[$(date)] Starting Unbrowse server..."
  cd /root/.openclaw/workspace/unbrowse/packages/backend
  npx tsx src/server.ts 2>&1
  echo "[$(date)] Server exited. Restarting in 3s..."
  sleep 3
done
