-- ============================================
-- ECOLOPTIM INSTALPRO - DATABASE SCHEMA
-- ============================================

-- Drop tables if exist (pentru re-run)
DROP TABLE IF EXISTS timeline_lucrari CASCADE;
DROP TABLE IF EXISTS plati CASCADE;
DROP TABLE IF EXISTS facturi CASCADE;
DROP TABLE IF EXISTS documente CASCADE;
DROP TABLE IF EXISTS lucrari CASCADE;
DROP TABLE IF EXISTS clienti CASCADE;
DROP TABLE IF EXISTS utilizatori CASCADE;

-- ============================================
-- TABELA: utilizatori (authentication)
-- ============================================
CREATE TABLE utilizatori (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    nume_complet VARCHAR(100),
    rol VARCHAR(20) DEFAULT 'user' CHECK (rol IN ('admin', 'user')),
    activ BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: clienti
-- ============================================
CREATE TABLE clienti (
    id SERIAL PRIMARY KEY,
    tip_client VARCHAR(20) NOT NULL CHECK (tip_client IN ('persoana_fizica', 'firma')),
    nume VARCHAR(200) NOT NULL,
    cui VARCHAR(50),
    cnp VARCHAR(13),
    reg_com VARCHAR(50),
    telefon_primar VARCHAR(20) NOT NULL,
    telefon_secundar VARCHAR(20),
    email VARCHAR(100),
    adresa_strada VARCHAR(200),
    adresa_numar VARCHAR(20),
    adresa_bloc VARCHAR(20),
    adresa_scara VARCHAR(20),
    adresa_apartament VARCHAR(20),
    localitate VARCHAR(100),
    judet VARCHAR(50),
    cod_postal VARCHAR(10),
    persoana_contact VARCHAR(100),
    observatii TEXT,
    status VARCHAR(20) DEFAULT 'activ' CHECK (status IN ('activ', 'inactiv')),
    user_id INTEGER REFERENCES utilizatori(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: lucrari (projects)
-- ============================================
CREATE TABLE lucrari (
    id SERIAL PRIMARY KEY,
    numar_lucrare VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER REFERENCES clienti(id) ON DELETE CASCADE,
    nume_lucrare VARCHAR(200) NOT NULL,
    tip_lucrare VARCHAR(50) CHECK (tip_lucrare IN ('instalatii_sanitare', 'incalzire', 'gaz', 'climatizare', 'electrice', 'constructii', 'alte')),
    status VARCHAR(30) DEFAULT 'oferta' CHECK (status IN ('oferta', 'contract_semnat', 'in_executie', 'finalizata', 'suspendata', 'anulata')),
    adresa_santier TEXT,
    localitate VARCHAR(100),
    judet VARCHAR(50),
    data_start DATE,
    data_finalizare_planificata DATE,
    data_finalizare_efectiva DATE,
    valoare_contract DECIMAL(15,2) DEFAULT 0,
    valoare_incasata DECIMAL(15,2) DEFAULT 0,
    procent_finalizare INTEGER DEFAULT 0 CHECK (procent_finalizare >= 0 AND procent_finalizare <= 100),
    observatii TEXT,
    user_id INTEGER REFERENCES utilizatori(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: documente
-- ============================================
CREATE TABLE documente (
    id SERIAL PRIMARY KEY,
    lucrare_id INTEGER REFERENCES lucrari(id) ON DELETE CASCADE,
    tip_document VARCHAR(50) CHECK (tip_document IN ('contract', 'deviz', 'factura', 'proces_verbal', 'alte')),
    nume_fisier VARCHAR(200) NOT NULL,
    cale_fisier VARCHAR(500),
    dimensiune_kb INTEGER,
    data_document DATE,
    observatii TEXT,
    uploaded_by INTEGER REFERENCES utilizatori(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: facturi
-- ============================================
CREATE TABLE facturi (
    id SERIAL PRIMARY KEY,
    numar_factura VARCHAR(50) UNIQUE NOT NULL,
    tip_factura VARCHAR(20) DEFAULT 'factura' CHECK (tip_factura IN ('factura', 'proforma', 'chitanta')),
    client_id INTEGER REFERENCES clienti(id) ON DELETE SET NULL,
    lucrare_id INTEGER REFERENCES lucrari(id) ON DELETE CASCADE,
    data_emitere DATE NOT NULL,
    data_scadenta DATE,
    valoare_totala DECIMAL(15,2) NOT NULL,
    valoare_platita DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'neincasata' CHECK (status IN ('neincasata', 'partial_incasata', 'incasata')),
    observatii TEXT,
    user_id INTEGER REFERENCES utilizatori(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: plati
-- ============================================
CREATE TABLE plati (
    id SERIAL PRIMARY KEY,
    factura_id INTEGER REFERENCES facturi(id) ON DELETE CASCADE,
    data_plata DATE NOT NULL,
    suma DECIMAL(15,2) NOT NULL,
    modalitate_plata VARCHAR(50),
    numar_document VARCHAR(100),
    observatii TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: timeline_lucrari
-- ============================================
CREATE TABLE timeline_lucrari (
    id SERIAL PRIMARY KEY,
    lucrare_id INTEGER REFERENCES lucrari(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES utilizatori(id) ON DELETE SET NULL,
    actiune VARCHAR(100),
    descriere TEXT,
    status_vechi VARCHAR(30),
    status_nou VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES pentru performanță
-- ============================================
CREATE INDEX idx_clienti_nume ON clienti(nume);
CREATE INDEX idx_lucrari_client ON lucrari(client_id);
CREATE INDEX idx_lucrari_status ON lucrari(status);
CREATE INDEX idx_facturi_lucrare ON facturi(lucrare_id);
CREATE INDEX idx_documente_lucrare ON documente(lucrare_id);

-- ============================================
-- USER ADMIN DEFAULT (password: admin123)
-- Hash-ul e pentru "admin123" cu bcrypt rounds=10
-- ============================================
INSERT INTO utilizatori (username, email, password, rol, nume_complet, activ)
VALUES ('admin', 'admin@ecoloptim.ro', '$2a$10$TCT7HzIIu/Hh2mL52q8QbuUP/6CQlVeF47Ktu0DCPogFWeliW65rG', 'admin', 'Administrator', true);

