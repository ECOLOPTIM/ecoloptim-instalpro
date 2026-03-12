# Ecoloptim InstalPro

Aplicație web pentru managementul lucrărilor de instalații — clienți, lucrări, materiale, angajați, financiar și rapoarte.

---

## 📥 Cum clonez proiectul?

### Cerință prealabilă — Instalează Git

Git este programul care descarcă (clonează) codul sursă de pe GitHub pe calculatorul tău.

| Sistem de operare | Link descărcare |
|-------------------|----------------|
| 🪟 Windows | https://git-scm.com/download/win — rulează installerul, lasă opțiunile implicite |
| 🍎 macOS | `xcode-select --install` în Terminal (Git vine cu Xcode tools) sau https://git-scm.com/download/mac |
| 🐧 Linux (Ubuntu/Debian) | `sudo apt install git` |
| 🐧 Linux (Fedora/RHEL) | `sudo dnf install git` |

Verifică instalarea:
```bash
git --version
# ar trebui să afișeze ceva de genul: git version 2.x.x
```

---

### Metoda 1 — HTTPS (recomandat, cel mai simplu)

```bash
# 1. Deschide Terminal (macOS/Linux) sau Command Prompt / PowerShell (Windows)

# 2. Mergi în folderul unde vrei să descarci proiectul
cd C:\Proiecte          # Windows
# sau
cd ~/Proiecte           # macOS / Linux

# 3. Clonează repository-ul
git clone https://github.com/ECOLOPTIM/ecoloptim-instalpro.git

# 4. Intră în folderul proiectului
cd ecoloptim-instalpro
```

> 💡 Nu îți va cere username/parolă deoarece repository-ul este public.

---

### Metoda 2 — SSH (pentru colaboratori cu cheie SSH configurată)

```bash
git clone git@github.com:ECOLOPTIM/ecoloptim-instalpro.git
cd ecoloptim-instalpro
```

> Această metodă necesită o cheie SSH adăugată în contul tău GitHub.  
> Documentație: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

### Metoda 3 — GitHub Desktop (interfață grafică, fără terminal)

1. Descarcă și instalează **GitHub Desktop**: https://desktop.github.com/
2. Deschide GitHub Desktop → **File → Clone repository...**
3. Selectează tab-ul **URL** și introdu:
   ```
   https://github.com/ECOLOPTIM/ecoloptim-instalpro
   ```
4. Alege folderul local → apasă **Clone**

---

### Metoda 4 — Descarcă ZIP (fără Git instalat)

1. Accesează https://github.com/ECOLOPTIM/ecoloptim-instalpro
2. Apasă butonul verde **`< > Code`**
3. Apasă **Download ZIP**
4. Dezarhivează fișierul `.zip` descărcat

> ⚠️ Cu această metodă nu poți face `git pull` pentru actualizări viitoare.  
> Dacă vrei actualizări automate, folosește Metoda 1 (HTTPS).

---

### Pasul următor după clonare

➡️ Continuă cu **[Cum deschid aplicația?](#-cum-deschid-aplicatia)** de mai jos.

---

## 🚀 Cum deschid aplicația?

### Pasul 1 — Instalează Docker Desktop

> **Docker Desktop** este singurul program pe care trebuie să-l ai instalat.

| Sistem de operare | Link descărcare |
|-------------------|----------------|
| 🪟 Windows | https://www.docker.com/products/docker-desktop |
| 🍎 macOS | https://www.docker.com/products/docker-desktop |
| 🐧 Linux | https://docs.docker.com/engine/install/ |

Instalează, pornește Docker Desktop și așteaptă iconița 🐳 din bara de activități să fie verde (Running).

---

### Pasul 2 — Descarcă aplicația

> Dacă nu ai clonat încă proiectul, urmează pașii din **[Cum clonez proiectul?](#-cum-clonez-proiectul)** de mai sus.

```bash
git clone https://github.com/ECOLOPTIM/ecoloptim-instalpro.git
cd ecoloptim-instalpro
```

---

### Pasul 3 — Pornește aplicația

#### 🪟 Windows — dublu-click pe `start.bat`
```
start.bat
```

#### 🍎 macOS / 🐧 Linux — rulează `start.sh`
```bash
bash start.sh
```

#### Sau manual cu Docker Compose:
```bash
docker compose up -d --build
```

---

### Pasul 4 — Deschide în browser

Odată ce aplicația a pornit, deschide:

> **http://localhost**

---

### Pasul 5 — Autentifică-te

| Câmp | Valoare |
|------|---------|
| **Username** | `admin` |
| **Parolă** | `admin123` |

> ⚠️ **Important:** Schimbă parola imediat după primul login!
> Mergi la **Setări → Schimbare Parolă**.

---

## 🛑 Cum opresc aplicația?

```bash
docker compose down
```

---

## 🔄 Am probleme la pornire — ce fac?

**1. Verifică că Docker Desktop rulează** (iconița 🐳 din taskbar trebuie să fie verde)

**2. Vezi log-urile pentru a identifica eroarea:**
```bash
docker compose logs
```

**3. Repornire completă (resetează și baza de date):**
```bash
docker compose down -v
docker compose up -d --build
```

**4. Portul 80 este ocupat?** Editează `docker-compose.yml` și schimbă `"80:80"` cu `"8080:80"`, apoi accesează http://localhost:8080

---

## 📋 Funcționalități

| Modul | Descriere |
|-------|-----------|
| 🔐 **Autentificare** | Login securizat cu JWT, protecție brute-force |
| 👥 **Clienți** | Adaugă și gestionează clienți (PF și firme) |
| 🏗️ **Lucrări** | Urmărire lucrări: status, valori, termene |
| 📦 **Materiale** | Gestiune stoc cu avertizări stoc minim |
| 👷 **Angajați** | Gestionare personal și salarii |
| 💰 **Financiar** | Situație încasări per lucrare |
| 📈 **Rapoarte** | Sumar general și situații pe categorii |
| ⚙️ **Setări** | Actualizare profil și schimbare parolă |

---

## 🛠️ Tehnologii

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React 18 + styled-components
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Deploy**: Docker + docker-compose + Nginx

---

## ⚙️ Configurare avansată

### Variabile de mediu backend

Copiază `.env.example` în `backend/.env` și editează:

| Variabilă | Descriere | Implicit |
|-----------|-----------|---------|
| `DB_HOST` | Host PostgreSQL | `postgres` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nume bază de date | `ecoloptim_instalpro` |
| `DB_USER` | Utilizator PostgreSQL | `postgres` |
| `DB_PASSWORD` | Parolă PostgreSQL | `postgres123` |
| `JWT_SECRET` | Secret JWT (**schimbă obligatoriu în producție!**) | *(vedere .env.example)* |
| `JWT_EXPIRE` | Durata token | `7d` |
| `CORS_ORIGIN` | Origin permis frontend | `http://localhost` |

---

## 🔌 API Reference

| Endpoint | Metodă | Descriere |
|----------|--------|-----------|
| `/api/health` | GET | Status server |
| `/api/auth/login` | POST | Autentificare |
| `/api/auth/register` | POST | Înregistrare cont |
| `/api/auth/profile` | GET / PUT | Profil utilizator |
| `/api/auth/password` | PUT | Schimbare parolă |
| `/api/stats` | GET | Statistici dashboard |
| `/api/dashboard/activitate` | GET | Activitate recentă |
| `/api/dashboard/notificari` | GET | Notificări active |
| `/api/clienti` | GET / POST | Clienți |
| `/api/clienti/:id` | GET / PUT / DELETE | Client individual |
| `/api/lucrari` | GET / POST | Lucrări |
| `/api/lucrari/:id` | GET / PUT / DELETE | Lucrare individuală |
| `/api/materiale` | GET / POST | Materiale |
| `/api/materiale/:id` | GET / PUT / DELETE | Material individual |
| `/api/angajati` | GET / POST | Angajați |
| `/api/angajati/:id` | GET / PUT / DELETE | Angajat individual |

---

## 🗄️ Baza de date

Schema SQL (tabele + date inițiale) se inițializează **automat** la primul start Docker.

Pentru inițializare manuală:
```bash
psql -U postgres -d ecoloptim_instalpro -f backend/database-schema.sql
```

---

## 📁 Structura proiectului

```
ecoloptim-instalpro/
├── start.sh              # Script pornire Linux/macOS
├── start.bat             # Script pornire Windows
├── docker-compose.yml    # Configurare Docker
├── backend/
│   ├── server.js         # Entry point API
│   ├── controllers/      # Logica business
│   ├── routes/           # Rute API
│   ├── middleware/        # Auth, validare
│   ├── config/           # Configurare DB
│   └── database-schema.sql
└── frontend/
    ├── src/
    │   ├── pages/        # Pagini aplicație
    │   ├── components/   # Componente reutilizabile
    │   ├── context/      # State management
    │   └── services/     # API calls
    └── nginx.conf
```
