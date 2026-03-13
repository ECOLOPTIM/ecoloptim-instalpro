-- Create user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecoloptim_user') THEN
    CREATE USER ecoloptim_user WITH PASSWORD 'ecoloptim_pass';
  END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ecoloptim_db TO ecoloptim_user;

-- Create tables
CREATE TABLE IF NOT EXISTS utilizatori (
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

CREATE TABLE IF NOT EXISTS clienti (
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

CREATE TABLE IF NOT EXISTS lucrari (
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

CREATE TABLE IF NOT EXISTS documente (
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

CREATE TABLE IF NOT EXISTS facturi (
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

CREATE TABLE IF NOT EXISTS plati (
    id SERIAL PRIMARY KEY,
    factura_id INTEGER REFERENCES facturi(id) ON DELETE CASCADE,
    data_plata DATE NOT NULL,
    suma DECIMAL(15,2) NOT NULL,
    modalitate_plata VARCHAR(50),
    numar_document VARCHAR(100),
    observatii TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_lucrari (
    id SERIAL PRIMARY KEY,
    lucrare_id INTEGER REFERENCES lucrari(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES utilizatori(id) ON DELETE SET NULL,
    actiune VARCHAR(100),
    descriere TEXT,
    status_vechi VARCHAR(30),
    status_nou VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecoloptim_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecoloptim_user;

-- Insert admin user (password: admin123)
INSERT INTO utilizatori (username, password, email, nume_complet, rol, activ)
VALUES (
    'admin',
    '$2a$10$TCT7HzIIu/Hh2mL52q8QbuUP/6CQlVeF47Ktu0DCPogFWeliW65rG',
    'admin@ecoloptim.ro',
    'Administrator',
    'admin',
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert demo clients
INSERT INTO clienti (tip_client, nume, telefon_primar, email, localitate, judet, status, user_id)
VALUES 
    ('persoana_fizica', 'Popescu Ion', '0721234567', 'ion.popescu@email.ro', 'București', 'București', 'activ', 1),
    ('firma', 'SC Construct SRL', '0212345678', 'contact@construct.ro', 'Cluj-Napoca', 'Cluj', 'activ', 1),
    ('persoana_fizica', 'Ionescu Maria', '0731234567', 'maria.ionescu@email.ro', 'Timișoara', 'Timiș', 'activ', 1),
    ('firma', 'SC Termo Install SRL', '0312345678', 'office@termoinstall.ro', 'Brașov', 'Brașov', 'activ', 1)
ON CONFLICT DO NOTHING;

-- Insert demo lucrari
INSERT INTO lucrari (numar_lucrare, client_id, nume_lucrare, tip_lucrare, status, localitate, judet, valoare_contract, procent_finalizare, user_id)
VALUES 
    ('LUC-2024-001', 1, 'Instalație sanitară apartament', 'instalatii_sanitare', 'in_executie', 'București', 'București', 15000.00, 60, 1),
    ('LUC-2024-002', 2, 'Instalație încălzire clădire birouri', 'incalzire', 'contract_semnat', 'Cluj-Napoca', 'Cluj', 85000.00, 10, 1),
    ('LUC-2024-003', 3, 'Instalație gaz casă', 'gaz', 'finalizata', 'Timișoara', 'Timiș', 12000.00, 100, 1),
    ('LUC-2024-004', 4, 'Sistem climatizare depozit', 'climatizare', 'oferta', 'Brașov', 'Brașov', 45000.00, 0, 1)
ON CONFLICT (numar_lucrare) DO NOTHING;

-- Insert demo facturi
INSERT INTO facturi (numar_factura, tip_factura, client_id, lucrare_id, data_emitere, data_scadenta, valoare_totala, valoare_platita, status, user_id)
VALUES 
    ('FACT-2024-001', 'factura', 1, 1, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 9000.00, 9000.00, 'incasata', 1),
    ('FACT-2024-002', 'factura', 1, 1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 6000.00, 0, 'neincasata', 1),
    ('FACT-2024-003', 'factura', 2, 2, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 25500.00, 0, 'neincasata', 1),
    ('FACT-2024-004', 'factura', 3, 3, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '5 days', 12000.00, 12000.00, 'incasata', 1)
ON CONFLICT (numar_factura) DO NOTHING;