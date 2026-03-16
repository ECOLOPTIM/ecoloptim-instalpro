const bcrypt = require('bcryptjs');
const pool = require('./database');

async function initDatabase() {
  try {
    console.log('🔧 Initializing database schema...');

    await pool.query(`
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
      )
    `);

    await pool.query(`
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
      )
    `);

    await pool.query(`
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
      )
    `);

    await pool.query(`
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
      )
    `);

    await pool.query(`
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
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS plati (
        id SERIAL PRIMARY KEY,
        factura_id INTEGER REFERENCES facturi(id) ON DELETE CASCADE,
        data_plata DATE NOT NULL,
        suma DECIMAL(15,2) NOT NULL,
        modalitate_plata VARCHAR(50),
        numar_document VARCHAR(100),
        observatii TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline_lucrari (
        id SERIAL PRIMARY KEY,
        lucrare_id INTEGER REFERENCES lucrari(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES utilizatori(id) ON DELETE SET NULL,
        actiune VARCHAR(100),
        descriere TEXT,
        status_vechi VARCHAR(30),
        status_nou VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database schema ready');

    // Seed admin user if not present, or rehash password if not bcrypt
    const adminCheck = await pool.query(
      'SELECT id, password FROM utilizatori WHERE username = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        `INSERT INTO utilizatori (username, password, email, nume_complet, rol, activ)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin', hashedPassword, 'admin@ecoloptim.ro', 'Administrator', 'admin', true]
      );
      console.log('✅ Admin user created (username: admin)');
    } else {
      const existingPassword = adminCheck.rows[0].password;
      if (!existingPassword || !existingPassword.startsWith('$2')) {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await pool.query(
          'UPDATE utilizatori SET password = $1 WHERE username = $2',
          [hashedPassword, 'admin']
        );
        console.log('✅ Admin user password migrated to bcrypt hash');
      }
    }

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

module.exports = initDatabase;
