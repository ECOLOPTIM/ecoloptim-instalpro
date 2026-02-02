-- ============================================
-- ECOLOPTIM INSTALPRO - DATABASE SCHEMA
-- ============================================

-- Drop tables if exist (pentru re-run)
DROP TABLE IF EXISTS costuri CASCADE;
DROP TABLE IF EXISTS documente CASCADE;
DROP TABLE IF EXISTS fotografii_santier CASCADE;
DROP TABLE IF EXISTS lucrari CASCADE;
DROP TABLE IF EXISTS clienti CASCADE;
DROP TABLE IF EXISTS materiale CASCADE;
DROP TABLE IF EXISTS angajati CASCADE;
DROP TABLE IF EXISTS utilizatori CASCADE;

-- ============================================
-- TABELA: utilizatori (authentication)
-- ============================================
CREATE TABLE utilizatori (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    parola_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'user' CHECK (rol IN ('admin', 'manager', 'user')),
    nume_complet VARCHAR(100),
    telefon VARCHAR(20),
    activ BOOLEAN DEFAULT true,
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: clienti
-- ============================================
CREATE TABLE clienti (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    tip_client VARCHAR(20) CHECK (tip_client IN ('persoana_fizica', 'firma')),
    cui_cnp VARCHAR(20),
    adresa TEXT,
    localitate VARCHAR(100),
    judet VARCHAR(50),
    cod_postal VARCHAR(10),
    telefon VARCHAR(20),
    email VARCHAR(100),
    persoana_contact VARCHAR(100),
    observatii TEXT,
    activ BOOLEAN DEFAULT true,
    creat_de INTEGER REFERENCES utilizatori(id),
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: lucrari (projects)
-- ============================================
CREATE TABLE lucrari (
    id SERIAL PRIMARY KEY,
    numar_lucrare VARCHAR(50) UNIQUE NOT NULL,
    nume_lucrare VARCHAR(200) NOT NULL,
    client_id INTEGER REFERENCES clienti(id) ON DELETE CASCADE,
    tip_lucrare VARCHAR(50),
    adresa_santier TEXT,
    localitate VARCHAR(100),
    judet VARCHAR(50),
    status VARCHAR(30) DEFAULT 'oferta' CHECK (status IN ('oferta', 'contract_semnat', 'in_lucru', 'finalizata', 'anulata')),
    data_start DATE,
    data_finalizare_planificata DATE,
    data_finalizare_efectiva DATE,
    valoare_contract DECIMAL(12,2),
    valoare_incasata DECIMAL(12,2) DEFAULT 0,
    responsabil_id INTEGER REFERENCES utilizatori(id),
    observatii TEXT,
    creat_de INTEGER REFERENCES utilizatori(id),
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: materiale
-- ============================================
CREATE TABLE materiale (
    id SERIAL PRIMARY KEY,
    cod_material VARCHAR(50) UNIQUE,
    nume VARCHAR(200) NOT NULL,
    categorie VARCHAR(50),
    unitate_masura VARCHAR(20) NOT NULL,
    pret_achizitie DECIMAL(10,2),
    pret_vanzare DECIMAL(10,2),
    stoc_curent DECIMAL(10,2) DEFAULT 0,
    stoc_minim DECIMAL(10,2) DEFAULT 0,
    furnizor VARCHAR(100),
    observatii TEXT,
    activ BOOLEAN DEFAULT true,
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: angajati
-- ============================================
CREATE TABLE angajati (
    id SERIAL PRIMARY KEY,
    nume_complet VARCHAR(100) NOT NULL,
    cnp VARCHAR(13) UNIQUE,
    functie VARCHAR(50),
    telefon VARCHAR(20),
    email VARCHAR(100),
    adresa TEXT,
    data_angajare DATE,
    salariu_baza DECIMAL(10,2),
    cont_bancar VARCHAR(50),
    activ BOOLEAN DEFAULT true,
    observatii TEXT,
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: costuri (cheltuieli per lucrare)
-- ============================================
CREATE TABLE costuri (
    id SERIAL PRIMARY KEY,
    lucrare_id INTEGER REFERENCES lucrari(id) ON DELETE CASCADE,
    tip_cost VARCHAR(50) CHECK (tip_cost IN ('materiale', 'manopera', 'transport', 'utilaje', 'subcontractori', 'altele')),
    descriere TEXT NOT NULL,
    suma DECIMAL(10,2) NOT NULL,
    data_cost DATE NOT NULL,
    furnizor VARCHAR(100),
    numar_document VARCHAR(50),
    observatii TEXT,
    creat_de INTEGER REFERENCES utilizatori(id),
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: documente (PV-uri, facturi, contracte)
-- ============================================
CREATE TABLE documente (
    id SERIAL PRIMARY KEY,
    lucrare_id INTEGER REFERENCES lucrari(id) ON DELETE CASCADE,
    tip_document VARCHAR(50) CHECK (tip_document IN ('contract', 'proces_verbal', 'factura', 'deviz', 'autorizatie', 'altele')),
    numar_document VARCHAR(50),
    denumire VARCHAR(200) NOT NULL,
    cale_fisier VARCHAR(500),
    data_document DATE,
    observatii TEXT,
    incarcat_de INTEGER REFERENCES utilizatori(id),
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: fotografii_santier
-- ============================================
CREATE TABLE fotografii_santier (
    id SERIAL PRIMARY KEY,
    lucrare_id INTEGER REFERENCES lucrari(id) ON DELETE CASCADE,
    cale_fisier VARCHAR(500) NOT NULL,
    descriere TEXT,
    data_fotografie DATE,
    incarcat_de INTEGER REFERENCES utilizatori(id),
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES pentru performanță
-- ============================================
CREATE INDEX idx_clienti_nume ON clienti(nume);
CREATE INDEX idx_lucrari_client ON lucrari(client_id);
CREATE INDEX idx_lucrari_status ON lucrari(status);
CREATE INDEX idx_costuri_lucrare ON costuri(lucrare_id);
CREATE INDEX idx_documente_lucrare ON documente(lucrare_id);
CREATE INDEX idx_fotografii_lucrare ON fotografii_santier(lucrare_id);

-- ============================================
-- USER ADMIN DEFAULT (password: admin123)
-- Hash-ul e pentru "admin123" cu bcrypt
-- ============================================
INSERT INTO utilizatori (username, email, parola_hash, rol, nume_complet) 
VALUES ('admin', 'admin@ecoloptim.ro', '$2b$10$xZqKXzGZp7bUY5M2pX0qZO6KXJKmRxZ.aJqKkP8X0qZO6KXJKmRxZ', 'admin', 'Administrator');

-- ============================================
-- DATE DE TEST (opțional)
-- ============================================

-- Client test
INSERT INTO clienti (nume, tip_client, telefon, email, adresa, localitate, judet, creat_de)
VALUES ('SC Test Construct SRL', 'firma', '0721234567', 'test@construct.ro', 'Str. Exemplu nr. 1', 'București', 'București', 1);

-- Material test
INSERT INTO materiale (cod_material, nume, categorie, unitate_masura, pret_achizitie, pret_vanzare, stoc_curent)
VALUES ('MAT001', 'Țeavă PVC D110', 'Instalații', 'ml', 15.50, 25.00, 100);

-- Angajat test
INSERT INTO angajati (nume_complet, functie, telefon, data_angajare, salariu_baza)
VALUES ('Ion Popescu', 'Instalator', '0723456789', '2024-01-15', 3500.00);
