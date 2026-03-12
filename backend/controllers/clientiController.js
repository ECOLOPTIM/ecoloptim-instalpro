const db = require('../config/database');

// GET all clienți
const getAllClienti = async (req, res) => {
  try {
    const { tip_client, judet, status, search } = req.query;

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT l.id) as numar_lucrari,
        COALESCE(SUM(l.valoare_contract), 0) as total_contracte,
        COALESCE(SUM(l.valoare_incasata), 0) as total_incasat
      FROM clienti c
      LEFT JOIN lucrari l ON c.id = l.client_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtre
    if (tip_client) {
      query += ` AND c.tip_client = $${paramIndex}`;
      params.push(tip_client);
      paramIndex++;
    }

    if (judet) {
      query += ` AND c.judet = $${paramIndex}`;
      params.push(judet);
      paramIndex++;
    }

    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        c.nume ILIKE $${paramIndex} OR 
        c.telefon_primar ILIKE $${paramIndex} OR 
        c.email ILIKE $${paramIndex} OR
        c.localitate ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC`;

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting clienti:', error);
    res.status(500).json({ message: 'Eroare la obținerea clienților' });
  }
};

// GET client by ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Info client
    const clientResult = await db.query(
      'SELECT * FROM clienti WHERE id = $1',
      [id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Client negăsit' });
    }

    const client = clientResult.rows[0];

    // Lucrări asociate
    const lucrariResult = await db.query(
      `SELECT 
        id, numar_lucrare, nume_lucrare, tip_lucrare, status,
        data_start, valoare_contract, valoare_incasata, procent_finalizare
       FROM lucrari 
       WHERE client_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    // Statistici
    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as numar_lucrari,
        COALESCE(SUM(valoare_contract), 0) as total_contracte,
        COALESCE(SUM(valoare_incasata), 0) as total_incasat
       FROM lucrari 
       WHERE client_id = $1`,
      [id]
    );

    res.json({
      ...client,
      lucrari: lucrariResult.rows,
      statistici: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({ message: 'Eroare la obținerea clientului' });
  }
};

// CREATE client
const createClient = async (req, res) => {
  try {
    const {
      tip_client, nume, cui, cnp, reg_com,
      telefon_primar, telefon_secundar, email,
      adresa_strada, adresa_numar, adresa_bloc, adresa_scara, adresa_apartament,
      localitate, judet, cod_postal,
      persoana_contact, observatii, status
    } = req.body;

    // Validare
    if (!tip_client || !nume || !telefon_primar) {
      return res.status(400).json({ 
        message: 'Tip client, nume și telefon sunt obligatorii' 
      });
    }

    const result = await db.query(
      `INSERT INTO clienti (
        tip_client, nume, cui, cnp, reg_com,
        telefon_primar, telefon_secundar, email,
        adresa_strada, adresa_numar, adresa_bloc, adresa_scara, adresa_apartament,
        localitate, judet, cod_postal,
        persoana_contact, observatii, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        tip_client, nume, cui, cnp, reg_com,
        telefon_primar, telefon_secundar, email,
        adresa_strada, adresa_numar, adresa_bloc, adresa_scara, adresa_apartament,
        localitate, judet, cod_postal,
        persoana_contact, observatii, status || 'activ'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Eroare la crearea clientului' });
  }
};

// UPDATE client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tip_client, nume, cui, cnp, reg_com,
      telefon_primar, telefon_secundar, email,
      adresa_strada, adresa_numar, adresa_bloc, adresa_scara, adresa_apartament,
      localitate, judet, cod_postal,
      persoana_contact, observatii, status
    } = req.body;

    const result = await db.query(
      `UPDATE clienti SET
        tip_client = $1, nume = $2, cui = $3, cnp = $4, reg_com = $5,
        telefon_primar = $6, telefon_secundar = $7, email = $8,
        adresa_strada = $9, adresa_numar = $10, adresa_bloc = $11, 
        adresa_scara = $12, adresa_apartament = $13,
        localitate = $14, judet = $15, cod_postal = $16,
        persoana_contact = $17, observatii = $18, status = $19,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      RETURNING *`,
      [
        tip_client, nume, cui, cnp, reg_com,
        telefon_primar, telefon_secundar, email,
        adresa_strada, adresa_numar, adresa_bloc, adresa_scara, adresa_apartament,
        localitate, judet, cod_postal,
        persoana_contact, observatii, status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client negăsit' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Eroare la actualizarea clientului' });
  }
};

// DELETE client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifică dacă are lucrări
    const lucrariCheck = await db.query(
      'SELECT COUNT(*) FROM lucrari WHERE client_id = $1',
      [id]
    );

    if (parseInt(lucrariCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Nu se poate șterge clientul. Are lucrări asociate.' 
      });
    }

    const result = await db.query(
      'DELETE FROM clienti WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client negăsit' });
    }

    res.json({ message: 'Client șters cu succes' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Eroare la ștergerea clientului' });
  }
};

module.exports = {
  getAllClienti,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};