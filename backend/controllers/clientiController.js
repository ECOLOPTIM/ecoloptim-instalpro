const pool = require('../config/database');

// GET /api/clienti - Listă clienți cu paginare și search
exports.getClienti = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Query cu search
    let query = `
      SELECT 
        c.*,
        u.username as creat_de_username
      FROM clienti c
      LEFT JOIN utilizatori u ON c.creat_de = u.id
      WHERE c.activ = true
    `;

    const params = [];

    // Dacă există search, adaugă condiție
    if (search) {
      query += ` AND (
        c.nume ILIKE $1 OR 
        c.cui_cnp ILIKE $1 OR 
        c.email ILIKE $1 OR
        c.telefon ILIKE $1
      )`;
      params.push(`%${search}%`);
    }

    // Ordonare și paginare
    query += ` ORDER BY c.creat_la DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    // Execută query
    const result = await pool.query(query, params);

    // Count total pentru paginare
    let countQuery = 'SELECT COUNT(*) FROM clienti WHERE activ = true';
    const countParams = [];
    if (search) {
      countQuery += ` AND (nume ILIKE $1 OR cui_cnp ILIKE $1 OR email ILIKE $1 OR telefon ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get clienti error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea clienților',
      error: error.message
    });
  }
};

// GET /api/clienti/:id - Detalii client
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.username as creat_de_username
       FROM clienti c
       LEFT JOIN utilizatori u ON c.creat_de = u.id
       WHERE c.id = $1 AND c.activ = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clientul nu a fost găsit'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get client by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea clientului',
      error: error.message
    });
  }
};

// POST /api/clienti - Creare client nou
exports.createClient = async (req, res) => {
  try {
    const {
      nume,
      tip_client,
      cui_cnp,
      adresa,
      localitate,
      judet,
      cod_postal,
      telefon,
      email,
      persoana_contact,
      observatii
    } = req.body;

    // Validare
    if (!nume) {
      return res.status(400).json({
        success: false,
        message: 'Numele clientului este obligatoriu'
      });
    }

    // Verifică dacă CUI/CNP există deja (dacă e completat)
    if (cui_cnp) {
      const checkResult = await pool.query(
        'SELECT id FROM clienti WHERE cui_cnp = $1 AND activ = true',
        [cui_cnp]
      );
      if (checkResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Un client cu acest CUI/CNP există deja'
        });
      }
    }

    // Inserare
    const result = await pool.query(
      `INSERT INTO clienti (
        nume, tip_client, cui_cnp, adresa, localitate, judet, 
        cod_postal, telefon, email, persoana_contact, observatii, creat_de
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        nume,
        tip_client,
        cui_cnp,
        adresa,
        localitate,
        judet,
        cod_postal,
        telefon,
        email,
        persoana_contact,
        observatii,
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Client creat cu succes!',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea clientului',
      error: error.message
    });
  }
};

// PUT /api/clienti/:id - Modificare client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nume,
      tip_client,
      cui_cnp,
      adresa,
      localitate,
      judet,
      cod_postal,
      telefon,
      email,
      persoana_contact,
      observatii
    } = req.body;

    // Validare
    if (!nume) {
      return res.status(400).json({
        success: false,
        message: 'Numele clientului este obligatoriu'
      });
    }

    // Verifică dacă clientul există
    const checkResult = await pool.query(
      'SELECT id FROM clienti WHERE id = $1 AND activ = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clientul nu a fost găsit'
      });
    }

    // Verifică CUI/CNP duplicat (dacă e modificat)
    if (cui_cnp) {
      const cuiCheck = await pool.query(
        'SELECT id FROM clienti WHERE cui_cnp = $1 AND id != $2 AND activ = true',
        [cui_cnp, id]
      );
      if (cuiCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Un alt client cu acest CUI/CNP există deja'
        });
      }
    }

    // Update
    const result = await pool.query(
      `UPDATE clienti SET
        nume = $1,
        tip_client = $2,
        cui_cnp = $3,
        adresa = $4,
        localitate = $5,
        judet = $6,
        cod_postal = $7,
        telefon = $8,
        email = $9,
        persoana_contact = $10,
        observatii = $11,
        actualizat_la = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [
        nume,
        tip_client,
        cui_cnp,
        adresa,
        localitate,
        judet,
        cod_postal,
        telefon,
        email,
        persoana_contact,
        observatii,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Client actualizat cu succes!',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea clientului',
      error: error.message
    });
  }
};

// DELETE /api/clienti/:id - Ștergere client (soft delete)
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifică dacă clientul există
    const checkResult = await pool.query(
      'SELECT id FROM clienti WHERE id = $1 AND activ = true',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clientul nu a fost găsit'
      });
    }

    // Soft delete (setează activ = false)
    await pool.query(
      'UPDATE clienti SET activ = false, actualizat_la = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Client șters cu succes!'
    });

  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea clientului',
      error: error.message
    });
  }
};