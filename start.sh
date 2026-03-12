#!/usr/bin/env bash
# =============================================================
# Ecoloptim InstalPro — Script de pornire (Linux / macOS)
# Rulează: bash start.sh
# =============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "============================================"
echo "   Ecoloptim InstalPro — Pornire aplicație"
echo "============================================"
echo ""

# ── 1. Verifică Docker ──────────────────────────────────────
if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Docker nu este instalat!${NC}"
  echo ""
  echo "Instalează Docker Desktop de la: https://www.docker.com/products/docker-desktop"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${RED}❌ Docker nu rulează!${NC}"
  echo ""
  echo "Pornește Docker Desktop și încearcă din nou."
  exit 1
fi

echo -e "${GREEN}✅ Docker este disponibil${NC}"

# ── 2. Verifică docker compose ──────────────────────────────
if docker compose version &> /dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
  COMPOSE_CMD="docker-compose"
else
  echo -e "${RED}❌ Docker Compose nu este instalat!${NC}"
  echo ""
  echo "Instalează Docker Desktop (include Compose): https://www.docker.com/products/docker-desktop"
  exit 1
fi

echo -e "${GREEN}✅ Docker Compose disponibil${NC}"
echo ""

# ── 3. Pornește serviciile ───────────────────────────────────
echo -e "${YELLOW}⏳ Pornesc serviciile (bază de date, backend, frontend)...${NC}"
$COMPOSE_CMD up -d --build

echo ""
echo -e "${YELLOW}⏳ Aștept ca baza de date să fie pregătită...${NC}"

# Așteaptă până la 60 secunde pentru ca backend-ul să fie healthy
MAX_WAIT=60
WAITED=0
until curl -sf http://localhost:5000/api/health > /dev/null 2>&1 || [ $WAITED -ge $MAX_WAIT ]; do
  printf "."
  sleep 2
  WAITED=$((WAITED + 2))
done

echo ""

if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend pornit cu succes!${NC}"
else
  echo -e "${YELLOW}⚠️  Backend-ul poate mai pornește... verifică cu: docker compose logs backend${NC}"
fi

# ── 4. Deschide browser-ul ───────────────────────────────────
echo ""
echo "============================================"
echo -e "${GREEN}🎉 Aplicația este gata!${NC}"
echo "============================================"
echo ""
echo "🌐 Frontend:   http://localhost"
echo "🔌 Backend API: http://localhost:5000/api/health"
echo ""
echo "👤 Credențiale implicite:"
echo "   Username: admin"
echo "   Parolă:   admin123"
echo ""
echo "⚠️  IMPORTANT: Schimbă parola după primul login!"
echo "   Mergi la: Setări → Schimbare Parolă"
echo ""

# Încearcă să deschidă browser-ul automat
if command -v xdg-open &> /dev/null; then
  xdg-open http://localhost 2>/dev/null &
elif command -v open &> /dev/null; then
  open http://localhost 2>/dev/null
fi

echo "---------------------------------------------"
echo "Alte comenzi utile:"
echo "  Vezi log-uri:   $COMPOSE_CMD logs -f"
echo "  Oprește app:    $COMPOSE_CMD down"
echo "  Resetează DB:   $COMPOSE_CMD down -v && $COMPOSE_CMD up -d"
echo "---------------------------------------------"
echo ""
