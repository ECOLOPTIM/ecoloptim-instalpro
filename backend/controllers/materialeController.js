const pool = require('../config/database');

// GET /api/materiale - Listă materiale cu paginare și search
exports.getMateriale = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50, categorie = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM materiale WHERE activ = true';
    const params = [];

    if (search) {
      query += ` AND (nume ILIKE $${params.length + 1} OR cod_material ILIKE $${params.length + 1} OR furnizor ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (categorie) {
      query += ` AND categorie = $${params.length + 1}`;
      params.push(categorie);
    }

    query += ` ORDER BY creat_la DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM materiale WHERE activ = true';
    const countParams = [];
    if (search) {
      countQuery += ` AND (nume ILIKE $1 OR cod_material ILIKE $1 OR furnizor ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    if (categorie) {
      countQuery += ` AND categorie = $${countParams.length + 1}`;
      countParams.push(categorie);
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
    console.error('Get materiale error:', error);
    res.status(500).json({ success: false, message: 'Eroare la obținerea materialelor', error: error.message });
  }
};

// GET /api/materiale/:id - Detalii material
exports.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM materiale WHERE id = $1 AND activ = true', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Materialul nu a fost găsit' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get material by id error:', error);
    res.status(500).json({ success: false, message: 'Eroare la obținerea materialului', error: error.message });
  }
};

// POST /api/materiale - Adăugare material
exports.createMaterial = async (req, res) => {
  try {
    const {
      cod_material, nume, categorie, unitate_masura,
      pret_achizitie, pret_vanzare, stoc_curent, stoc_minim,
      furnizor, observatii
    } = req.body;

    if (!nume || !unitate_masura) {
      return res.status(400).json({ success: false, message: 'Numele și unitatea de măsură sunt obligatorii' });
    }

    if (cod_material) {
      const checkResult = await pool.query('SELECT id FROM materiale WHERE cod_material = $1 AND activ = true', [cod_material]);
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Un material cu acest cod există deja' });
      }
    }

    const result = await pool.query(
      `INSERT INTO materiale (
        cod_material, nume, categorie, unitate_masura,
        pret_achizitie, pret_vanzare, stoc_curent, stoc_minim,
        furnizor, observatii
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        cod_material || null, nume, categorie || null, unitate_masura,
        pret_achizitie || null, pret_vanzare || null,
        stoc_curent || 0, stoc_minim || 0,
        furnizor || null, observatii || null
      ]
    );

    res.status(201).json({ success: true, message: 'Material adăugat cu succes!', data: result.rows[0] });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ success: false, message: 'Eroare la adăugarea materialului', error: error.message });
  }
};

// PUT /api/materiale/:id - Modificare material
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cod_material, nume, categorie, unitate_masura,
      pret_achizitie, pret_vanzare, stoc_curent, stoc_minim,
      furnizor, observatii
    } = req.body;

    if (!nume || !unitate_masura) {
      return res.status(400).json({ success: false, message: 'Numele și unitatea de măsură sunt obligatorii' });
    }

    const checkResult = await pool.query('SELECT id FROM materiale WHERE id = $1 AND activ = true', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Materialul nu a fost găsit' });
    }

    if (cod_material) {
      const dupCheck = await pool.query('SELECT id FROM materiale WHERE cod_material = $1 AND id != $2 AND activ = true', [cod_material, id]);
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Un alt material cu acest cod există deja' });
      }
    }

    const result = await pool.query(
      `UPDATE materiale SET
        cod_material=$1, nume=$2, categorie=$3, unitate_masura=$4,
        pret_achizitie=$5, pret_vanzare=$6, stoc_curent=$7, stoc_minim=$8,
        furnizor=$9, observatii=$10, actualizat_la=CURRENT_TIMESTAMP
       WHERE id=$11
       RETURNING *`,
      [
        cod_material || null, nume, categorie || null, unitate_masura,
        pret_achizitie || null, pret_vanzare || null,
        stoc_curent || 0, stoc_minim || 0,
        furnizor || null, observatii || null, id
      ]
    );

    res.json({ success: true, message: 'Material actualizat cu succes!', data: result.rows[0] });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ success: false, message: 'Eroare la actualizarea materialului', error: error.message });
  }
};

// DELETE /api/materiale/:id - Ștergere material (soft delete)
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query('SELECT id FROM materiale WHERE id = $1 AND activ = true', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Materialul nu a fost găsit' });
    }

    await pool.query('UPDATE materiale SET activ = false, actualizat_la = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ success: true, message: 'Material șters cu succes!' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ success: false, message: 'Eroare la ștergerea materialului', error: error.message });
  }
};
