akses ssh : mesot01@37.60.224.136 port 22


Bersihkan Build: Jika masih muncul, matikan npm run dev, lalu jalankan:

Bash
rm -rf .next
NODE_OPTIONS="--max-old-space-size=4096" npm run dev -- -H 0.0.0.0
# sudo systemctl stop vscode-tunnel