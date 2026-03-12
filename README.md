# Ecoloptim InstalPro

Aplicație web pentru managementul lucrărilor de instalații — clienți, lucrări, materiale, angajați, financiar și rapoarte.

## Tehnologii

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React 18 + styled-components + react-toastify
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Deploy**: Docker + docker-compose + Nginx

## Pornire rapidă cu Docker

```bash
# 1. Clonează repository-ul
git clone https://github.com/ECOLOPTIM/ecoloptim-instalpro.git
cd ecoloptim-instalpro

# 2. Pornește serviciile (PostgreSQL, Backend, Frontend)
docker-compose up -d

# 3. Accesează aplicația
# Frontend: http://localhost
# Backend API: http://localhost:5000/api/health
```

> **Credențiale implicite**: username `admin`, parola `admin123`  
> ⚠️ Schimbă parola după primul login din **Setări → Schimbare Parolă**

## Configurare mediu (fără Docker)

### Backend

```bash
cd backend
cp .env.example .env
# Editează .env cu datele tale de conectare PostgreSQL și setează JWT_SECRET

npm install
node server.js
```

### Frontend

```bash
cd frontend
npm install
# Opțional: setează REACT_APP_API_URL=http://localhost:5000/api în .env.local
npm start
```

### Variabile de mediu backend (`.env`)

| Variabilă | Descriere | Exemplu |
|-----------|-----------|---------|
| `NODE_ENV` | Mediu de rulare | `development` / `production` |
| `PORT` | Port server | `5000` |
| `DB_HOST` | Host PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nume bază de date | `ecoloptim_instalpro` |
| `DB_USER` | Utilizator PostgreSQL | `postgres` |
| `DB_PASSWORD` | Parolă PostgreSQL | *(secretă)* |
| `JWT_SECRET` | Secret JWT (min 32 caractere) | *(secretă, obligatorie)* |
| `JWT_EXPIRE` | Durata token | `7d` |
| `CORS_ORIGIN` | Origin permis | `http://localhost:3000` |

## Structura API

| Endpoint | Descriere |
|----------|-----------|
| `POST /api/auth/login` | Autentificare |
| `POST /api/auth/register` | Înregistrare cont |
| `GET /api/auth/profile` | Profil utilizator curent |
| `PUT /api/auth/profile` | Actualizare profil |
| `PUT /api/auth/password` | Schimbare parolă |
| `GET /api/stats` | Statistici dashboard |
| `GET /api/dashboard/activitate` | Activitate recentă |
| `GET /api/dashboard/notificari` | Notificări active |
| `GET/POST /api/clienti` | Clienți |
| `GET/PUT/DELETE /api/clienti/:id` | Client individual |
| `GET/POST /api/lucrari` | Lucrări |
| `GET/PUT/DELETE /api/lucrari/:id` | Lucrare individuală |
| `GET/POST /api/materiale` | Materiale |
| `GET/PUT/DELETE /api/materiale/:id` | Material individual |
| `GET/POST /api/angajati` | Angajați |
| `GET/PUT/DELETE /api/angajati/:id` | Angajat individual |

## Funcționalități

- 🔐 **Autentificare JWT** cu rate limiting (protecție brute-force)
- 👥 **Clienți** — persoane fizice și juridice, CRUD complet
- 🏗️ **Lucrări** — urmărire status, valori, termene
- 📦 **Materiale** — stoc, prețuri, avertizări stoc minim
- 👷 **Angajați** — date personale, funcții, salarii
- 💰 **Financiar** — situație valori contracte și încasări
- 📈 **Rapoarte** — sumar general, situații pe categorii
- ⚙️ **Setări** — actualizare profil, schimbare parolă

## Baza de date

Schema SQL se inițializează automat la primul start Docker (`docker-entrypoint-initdb.d`).  
Pentru inițializare manuală:

```bash
psql -U postgres -d ecoloptim_instalpro -f backend/database-schema.sql
```
