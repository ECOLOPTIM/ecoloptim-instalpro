const db = require('../config/database');

// GET all lucrări
const getAllLucrari = async (req, res) => {
  try {
    const { status, tip_lucrare, client_id, search } = req.query;

    let query = `
      SELECT 
        l.*,
        c.nume as client_nume,
        c.tip_client,
        c.telefon_primar as client_telefon,
        c.localitate as client_localitate
      FROM lucrari l
      LEFT JOIN clienti c ON l.client_id = c.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtre
    if (status) {
      query += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (tip_lucrare) {
      query += ` AND l.tip_lucrare = $${paramIndex}`;
      params.push(tip_lucrare);
      paramIndex++;
    }

    if (client_id) {
      query += ` AND l.client_id = $${paramIndex}`;
      params.push(client_id);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        l.numar_lucrare ILIKE $${paramIndex} OR 
        l.nume_lucrare ILIKE $${paramIndex} OR 
        c.nume ILIKE $${paramIndex} OR
        l.localitate ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting lucrari:', error);
    res.status(500).json({ message: 'Eroare la obținerea lucrărilor' });
  }
};

// GET lucrare by ID
const getLucrareById = async (req, res) => {
  try {
    const { id } = req.params;

    // Info lucrare
    const lucrareResult = await db.query(
      `SELECT 
        l.*,
        c.nume as client_nume,
        c.tip_client,
        c.telefon_primar as client_telefon,
        c.email as client_email,
        c.localitate as client_localitate,
        c.judet as client_judet
      FROM lucrari l
      LEFT JOIN clienti c ON l.client_id = c.id
      WHERE l.id = $1`,
      [id]
    );

    if (lucrareResult.rows.length === 0) {
      return res.status(404).json({ message: 'Lucrare negăsită' });
    }

    const lucrare = lucrareResult.rows[0];

    // Timeline
    const timelineResult = await db.query(
      `SELECT 
        t.*,
        u.username,
        u.nume_complet
      FROM timeline_lucrari t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.lucrare_id = $1
      ORDER BY t.created_at DESC`,
      [id]
    );

    // Documente
    const documenteResult = await db.query(
      `SELECT * FROM documente 
       WHERE lucrare_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    // Facturi
    const facturiResult = await db.query(
      `SELECT * FROM facturi 
       WHERE lucrare_id = $1 
       ORDER BY data_emitere DESC`,
      [id]
    );

    res.json({
      ...lucrare,
      timeline: timelineResult.rows,
      documente: documenteResult.rows,
      facturi: facturiResult.rows
    });
  } catch (error) {
    console.error('Error getting lucrare:', error);
    res.status(500).json({ message: 'Eroare la obținerea lucrării' });
  }
};

// CREATE lucrare
const createLucrare = async (req, res) => {
  try {
    const {
      client_id, nume_lucrare, tip_lucrare, status,
      adresa_santier, localitate, judet,
      data_start, data_finalizare_planificata,
      valoare_contract, observatii
    } = req.body;

    // Validare
    if (!client_id || !nume_lucrare || !tip_lucrare) {
      return res.status(400).json({ 
        message: 'Client, nume lucrare și tip sunt obligatorii' 
      });
    }

    // Generare număr lucrare
    const year = new Date().getFullYear();
    const countResult = await db.query(
      'SELECT COUNT(*) FROM lucrari WHERE EXTRACT(YEAR FROM created_at) = $1',
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const numar_lucrare = `LUC-${year}-${String(count).padStart(3, '0')}`;

    const result = await db.query(
      `INSERT INTO lucrari (
        numar_lucrare, client_id, nume_lucrare, tip_lucrare, status,
        adresa_santier, localitate, judet,
        data_start, data_finalizare_planificata,
        valoare_contract, observatii
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        numar_lucrare, client_id, nume_lucrare, tip_lucrare, status || 'oferta',
        adresa_santier, localitate, judet,
        data_start, data_finalizare_planificata,
        valoare_contract || 0, observatii
      ]
    );

    // Adaugă în timeline
    await db.query(
      `INSERT INTO timeline_lucrari (lucrare_id, user_id, actiune, descriere, status_nou)
       VALUES ($1, $2, $3, $4, $5)`,
      [result.rows[0].id, req.user.id, 'creare', 'Lucrare creată', status || 'oferta']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating lucrare:', error);
    res.status(500).json({ message: 'Eroare la crearea lucrării' });
  }
};

// UPDATE lucrare
const updateLucrare = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id, nume_lucrare, tip_lucrare, status,
      adresa_santier, localitate, judet,
      data_start, data_finalizare_planificata, data_finalizare_efectiva,
      valoare_contract, valoare_incasata, procent_finalizare,
      observatii
    } = req.body;

    // Verifică status vechi
    const oldResult = await db.query('SELECT status FROM lucrari WHERE id = $1', [id]);
    const status_vechi = oldResult.rows[0]?.status;

    const result = await db.query(
      `UPDATE lucrari SET
        client_id = $1, nume_lucrare = $2, tip_lucrare = $3, status = $4,
        adresa_santier = $5, localitate = $6, judet = $7,
        data_start = $8, data_finalizare_planificata = $9, data_finalizare_efectiva = $10,
        valoare_contract = $11, valoare_incasata = $12, procent_finalizare = $13,
        observatii = $14, updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [
        client_id, nume_lucrare, tip_lucrare, status,
        adresa_santier, localitate, judet,
        data_start, data_finalizare_planificata, data_finalizare_efectiva,
        valoare_contract, valoare_incasata, procent_finalizare,
        observatii, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lucrare negăsită' });
    }

    // Adaugă în timeline dacă s-a schimbat status
    if (status_vechi !== status) {
      await db.query(
        `INSERT INTO timeline_lucrari (lucrare_id, user_id, actiune, descriere, status_vechi, status_nou)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, req.user.id, 'modificare_status', `Status schimbat: ${status_vechi} → ${status}`, status_vechi, status]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lucrare:', error);
    res.status(500).json({ message: 'Eroare la actualizarea lucrării' });
  }
};

// DELETE lucrare
const deleteLucrare = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM lucrari WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lucrare negăsită' });
    }

    res.json({ message: 'Lucrare ștearsă cu succes' });
  } catch (error) {
    console.error('Error deleting lucrare:', error);
    res.status(500).json({ message: 'Eroare la ștergerea lucrării' });
  }
};

module.exports = {
  getAllLucrari,
  getLucrareById,
  createLucrare,
  updateLucrare,
  deleteLucrare
};