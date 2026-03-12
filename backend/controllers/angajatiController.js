const pool = require('../config/database');

// GET /api/angajati - Listă angajați cu paginare și search
exports.getAngajati = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM angajati WHERE activ = true';
    const params = [];

    if (search) {
      query += ` AND (nume_complet ILIKE $${params.length + 1} OR functie ILIKE $${params.length + 1} OR telefon ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY creat_la DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM angajati WHERE activ = true';
    const countParams = [];
    if (search) {
      countQuery += ` AND (nume_complet ILIKE $1 OR functie ILIKE $1 OR telefon ILIKE $1)`;
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
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get angajati error:', error);
    res.status(500).json({ success: false, message: 'Eroare la obținerea angajaților', error: error.message });
  }
};

// GET /api/angajati/:id - Detalii angajat
exports.getAngajatById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM angajati WHERE id = $1 AND activ = true', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Angajatul nu a fost găsit' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get angajat by id error:', error);
    res.status(500).json({ success: false, message: 'Eroare la obținerea angajatului', error: error.message });
  }
};

// POST /api/angajati - Adăugare angajat
exports.createAngajat = async (req, res) => {
  try {
    const {
      nume_complet, cnp, functie, telefon, email,
      adresa, data_angajare, salariu_baza, cont_bancar, observatii
    } = req.body;

    if (!nume_complet) {
      return res.status(400).json({ success: false, message: 'Numele complet este obligatoriu' });
    }

    if (cnp) {
      const checkResult = await pool.query('SELECT id FROM angajati WHERE cnp = $1 AND activ = true', [cnp]);
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Un angajat cu acest CNP există deja' });
      }
    }

    const result = await pool.query(
      `INSERT INTO angajati (
        nume_complet, cnp, functie, telefon, email,
        adresa, data_angajare, salariu_baza, cont_bancar, observatii
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        nume_complet, cnp || null, functie || null, telefon || null, email || null,
        adresa || null, data_angajare || null, salariu_baza || null,
        cont_bancar || null, observatii || null
      ]
    );

    res.status(201).json({ success: true, message: 'Angajat adăugat cu succes!', data: result.rows[0] });
  } catch (error) {
    console.error('Create angajat error:', error);
    res.status(500).json({ success: false, message: 'Eroare la adăugarea angajatului', error: error.message });
  }
};

// PUT /api/angajati/:id - Modificare angajat
exports.updateAngajat = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nume_complet, cnp, functie, telefon, email,
      adresa, data_angajare, salariu_baza, cont_bancar, observatii
    } = req.body;

    if (!nume_complet) {
      return res.status(400).json({ success: false, message: 'Numele complet este obligatoriu' });
    }

    const checkResult = await pool.query('SELECT id FROM angajati WHERE id = $1 AND activ = true', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Angajatul nu a fost găsit' });
    }

    if (cnp) {
      const dupCheck = await pool.query('SELECT id FROM angajati WHERE cnp = $1 AND id != $2 AND activ = true', [cnp, id]);
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Un alt angajat cu acest CNP există deja' });
      }
    }

    const result = await pool.query(
      `UPDATE angajati SET
        nume_complet=$1, cnp=$2, functie=$3, telefon=$4, email=$5,
        adresa=$6, data_angajare=$7, salariu_baza=$8, cont_bancar=$9,
        observatii=$10, actualizat_la=CURRENT_TIMESTAMP
       WHERE id=$11
       RETURNING *`,
      [
        nume_complet, cnp || null, functie || null, telefon || null, email || null,
        adresa || null, data_angajare || null, salariu_baza || null,
        cont_bancar || null, observatii || null, id
      ]
    );

    res.json({ success: true, message: 'Angajat actualizat cu succes!', data: result.rows[0] });
  } catch (error) {
    console.error('Update angajat error:', error);
    res.status(500).json({ success: false, message: 'Eroare la actualizarea angajatului', error: error.message });
  }
};

// DELETE /api/angajati/:id - Ștergere angajat (soft delete)
exports.deleteAngajat = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query('SELECT id FROM angajati WHERE id = $1 AND activ = true', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Angajatul nu a fost găsit' });
    }

    await pool.query('UPDATE angajati SET activ = false, actualizat_la = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ success: true, message: 'Angajat șters cu succes!' });
  } catch (error) {
    console.error('Delete angajat error:', error);
    res.status(500).json({ success: false, message: 'Eroare la ștergerea angajatului', error: error.message });
  }
};
