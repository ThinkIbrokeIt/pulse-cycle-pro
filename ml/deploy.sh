#!/bin/bash
# PulseScore ML API — Oracle Cloud Deployment Script
# Run this on a fresh Ubuntu 24.04 ARM instance (Oracle Cloud Free Tier)

set -e

DOMAIN=${1:-""}  # Pass domain as arg: ./deploy.sh pulsecycle.pro

echo "============================================"
echo "PulseScore ML API — Oracle Cloud Deploy"
echo "============================================"

# ── System setup ──
echo "[1/6] Updating system..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git curl

# ── Firewall ──
echo "[2/6] Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
sudo ufw --force enable

# ── Clone project ──
echo "[3/6] Cloning project..."
cd /home/ubuntu
if [ -d "pulse-cycle-pro" ]; then
    cd pulse-cycle-pro && git pull
else
    git clone https://github.com/ThinkIbrokeIt/pulse-cycle-pro.git
    cd pulse-cycle-pro
fi
cd ml

# ── Python environment ──
echo "[4/6] Setting up Python environment..."
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# ── Train model if needed ──
echo "[5/6] Training model..."
if [ ! -f models/cycle_model.pkl ]; then
    python3 train.py
else
    echo "  Model exists. Retrain? (y/n)"
    read -r RETRAIN
    if [ "$RETRAIN" = "y" ]; then
        python3 train.py
    fi
fi

# ── Systemd service ──
echo "[6/6] Setting up systemd service..."
sudo tee /etc/systemd/system/pulsescore.service > /dev/null << EOF
[Unit]
Description=PulseScore ML API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/pulse-cycle-pro/ml
Environment=PATH=/home/ubuntu/pulse-cycle-pro/ml/.venv/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/home/ubuntu/pulse-cycle-pro/ml/.venv/bin/uvicorn api:app --host 0.0.0.0 --port 8000 --workers 1
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable pulsescore
sudo systemctl restart pulsescore

# ── Optional: Caddy for HTTPS ──
if [ -n "$DOMAIN" ]; then
    echo ""
    echo "Setting up Caddy for domain: $DOMAIN"
    
    # Install Caddy
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install -y caddy

    # Caddy config
    sudo tee /etc/caddy/Caddyfile > /dev/null << EOF
$DOMAIN {
    reverse_proxy localhost:8000
}
EOF

    sudo systemctl restart caddy
    echo "HTTPS enabled at https://$DOMAIN"
fi

echo ""
echo "============================================"
echo "DEPLOYMENT COMPLETE"
echo "============================================"
echo ""
echo "API URL:"
if [ -n "$DOMAIN" ]; then
    echo "  https://$DOMAIN"
else
    echo "  http://$(curl -s --max-time 5 ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')0:8000"
fi
echo ""
echo "Test commands:"
echo "  curl http://localhost:8000/health"
echo "  curl http://localhost:8000/model/info"
echo ""
echo "Logs:"
echo "  sudo journalctl -u pulsescore -f"
echo ""
echo "Update after code changes:"
echo "  cd /home/ubuntu/pulse-cycle-pro && git pull && sudo systemctl restart pulsescore"
echo ""
echo "Update frontend .env:"
echo "  VITE_PULSESCORE_API_URL=https://your-domain-or-ip:8000"
echo "  Then redeploy: vercel --prod"
echo "============================================"
