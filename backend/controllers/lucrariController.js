const pool = require('../config/database');

// GET /api/lucrari - Listă lucrări cu paginare și search
exports.getLucrari = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        l.*,
        c.nume AS client_nume,
        u.username AS responsabil_username
      FROM lucrari l
      LEFT JOIN clienti c ON l.client_id = c.id
      LEFT JOIN utilizatori u ON l.responsabil_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (l.numar_lucrare ILIKE $${params.length + 1} OR l.nume_lucrare ILIKE $${params.length + 1} OR c.nume ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (status) {
      query += ` AND l.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY l.creat_la DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(*)
      FROM lucrari l
      LEFT JOIN clienti c ON l.client_id = c.id
      WHERE 1=1
    `;
    const countParams = [];
    if (search) {
      countQuery += ` AND (l.numar_lucrare ILIKE $1 OR l.nume_lucrare ILIKE $1 OR c.nume ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    if (status) {
      countQuery += ` AND l.status = $${countParams.length + 1}`;
      countParams.push(status);
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
    console.error('Get lucrari error:', error);
    res.status(500).json({ success: false, message: 'Eroare la obținerea lucrărilor', error: error.message });
  }
};

// GET /api/lucrari/:id - Detalii lucrare
exports.getLucrareById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT l.*, c.nume AS client_nume, u.username AS responsabil_username
       FROM lucrari l
       LEFT JOIN clienti c ON l.client_id = c.id
       LEFT JOIN utilizatori u ON l.responsabil_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lucrarea nu a fost găsită' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get lucrare by id error:', error);
    res.status(500).json({ success: false, message: 'Eroare la obținerea lucrării', error: error.message });
  }
};

// POST /api/lucrari - Creare lucrare nouă
exports.createLucrare = async (req, res) => {
  try {
    const {
      numar_lucrare, nume_lucrare, client_id, tip_lucrare,
      adresa_santier, localitate, judet, status,
      data_start, data_finalizare_planificata,
      valoare_contract, responsabil_id, observatii
    } = req.body;

    if (!numar_lucrare || !nume_lucrare) {
      return res.status(400).json({ success: false, message: 'Numărul și numele lucrării sunt obligatorii' });
    }

    const checkResult = await pool.query('SELECT id FROM lucrari WHERE numar_lucrare = $1', [numar_lucrare]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'O lucrare cu acest număr există deja' });
    }

    const result = await pool.query(
      `INSERT INTO lucrari (
        numar_lucrare, nume_lucrare, client_id, tip_lucrare,
        adresa_santier, localitate, judet, status,
        data_start, data_finalizare_planificata,
        valoare_contract, responsabil_id, observatii, creat_de
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        numar_lucrare, nume_lucrare, client_id || null, tip_lucrare || null,
        adresa_santier || null, localitate || null, judet || null, status || 'oferta',
        data_start || null, data_finalizare_planificata || null,
        valoare_contract || null, responsabil_id || null, observatii || null,
        req.user.id
      ]
    );

    res.status(201).json({ success: true, message: 'Lucrare creată cu succes!', data: result.rows[0] });
  } catch (error) {
    console.error('Create lucrare error:', error);
    res.status(500).json({ success: false, message: 'Eroare la crearea lucrării', error: error.message });
  }
};

// PUT /api/lucrari/:id - Modificare lucrare
exports.updateLucrare = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numar_lucrare, nume_lucrare, client_id, tip_lucrare,
      adresa_santier, localitate, judet, status,
      data_start, data_finalizare_planificata, data_finalizare_efectiva,
      valoare_contract, valoare_incasata, responsabil_id, observatii
    } = req.body;

    if (!numar_lucrare || !nume_lucrare) {
      return res.status(400).json({ success: false, message: 'Numărul și numele lucrării sunt obligatorii' });
    }

    const checkResult = await pool.query('SELECT id FROM lucrari WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lucrarea nu a fost găsită' });
    }

    const dupCheck = await pool.query('SELECT id FROM lucrari WHERE numar_lucrare = $1 AND id != $2', [numar_lucrare, id]);
    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'O altă lucrare cu acest număr există deja' });
    }

    const result = await pool.query(
      `UPDATE lucrari SET
        numar_lucrare=$1, nume_lucrare=$2, client_id=$3, tip_lucrare=$4,
        adresa_santier=$5, localitate=$6, judet=$7, status=$8,
        data_start=$9, data_finalizare_planificata=$10, data_finalizare_efectiva=$11,
        valoare_contract=$12, valoare_incasata=$13, responsabil_id=$14,
        observatii=$15, actualizat_la=CURRENT_TIMESTAMP
       WHERE id=$16
       RETURNING *`,
      [
        numar_lucrare, nume_lucrare, client_id || null, tip_lucrare || null,
        adresa_santier || null, localitate || null, judet || null, status,
        data_start || null, data_finalizare_planificata || null, data_finalizare_efectiva || null,
        valoare_contract || null, valoare_incasata || 0, responsabil_id || null,
        observatii || null, id
      ]
    );

    res.json({ success: true, message: 'Lucrare actualizată cu succes!', data: result.rows[0] });
  } catch (error) {
    console.error('Update lucrare error:', error);
    res.status(500).json({ success: false, message: 'Eroare la actualizarea lucrării', error: error.message });
  }
};

// DELETE /api/lucrari/:id - Ștergere lucrare
exports.deleteLucrare = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query('SELECT id FROM lucrari WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lucrarea nu a fost găsită' });
    }

    await pool.query('DELETE FROM lucrari WHERE id = $1', [id]);
    res.json({ success: true, message: 'Lucrare ștearsă cu succes!' });
  } catch (error) {
    console.error('Delete lucrare error:', error);
    res.status(500).json({ success: false, message: 'Eroare la ștergerea lucrării', error: error.message });
  }
};
