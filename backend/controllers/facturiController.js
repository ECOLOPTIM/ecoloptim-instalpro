const db = require('../config/database');

// GET all facturi
const getAllFacturi = async (req, res) => {
  try {
    const { status, tip_factura, client_id, lucrare_id } = req.query;

    let query = `
      SELECT 
        f.*,
        c.nume as client_nume,
        c.tip_client,
        l.numar_lucrare,
        l.nume_lucrare,
        (f.valoare_totala - f.valoare_platita) as rest_de_incasat
      FROM facturi f
      LEFT JOIN clienti c ON f.client_id = c.id
      LEFT JOIN lucrari l ON f.lucrare_id = l.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND f.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (tip_factura) {
      query += ` AND f.tip_factura = $${paramIndex}`;
      params.push(tip_factura);
      paramIndex++;
    }

    if (client_id) {
      query += ` AND f.client_id = $${paramIndex}`;
      params.push(client_id);
      paramIndex++;
    }

    if (lucrare_id) {
      query += ` AND f.lucrare_id = $${paramIndex}`;
      params.push(lucrare_id);
      paramIndex++;
    }

    query += ` ORDER BY f.data_emitere DESC`;

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting facturi:', error);
    res.status(500).json({ message: 'Eroare la obținerea facturilor' });
  }
};

// GET factura by ID
const getFacturaById = async (req, res) => {
  try {
    const { id } = req.params;

    const facturaResult = await db.query(
      `SELECT 
        f.*,
        c.nume as client_nume,
        c.cui as client_cui,
        c.reg_com as client_reg_com,
        c.adresa_strada, c.adresa_numar, c.localitate, c.judet,
        c.telefon_primar as client_telefon,
        c.email as client_email,
        l.numar_lucrare,
        l.nume_lucrare,
        (f.valoare_totala - f.valoare_platita) as rest_de_incasat
      FROM facturi f
      LEFT JOIN clienti c ON f.client_id = c.id
      LEFT JOIN lucrari l ON f.lucrare_id = l.id
      WHERE f.id = $1`,
      [id]
    );

    if (facturaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Factură negăsită' });
    }

    // Plăți asociate
    const platiResult = await db.query(
      `SELECT * FROM plati 
       WHERE factura_id = $1 
       ORDER BY data_plata DESC`,
      [id]
    );

    res.json({
      ...facturaResult.rows[0],
      plati: platiResult.rows
    });
  } catch (error) {
    console.error('Error getting factura:', error);
    res.status(500).json({ message: 'Eroare la obținerea facturii' });
  }
};

// CREATE factura
const createFactura = async (req, res) => {
  try {
    const {
      tip_factura,
      client_id,
      lucrare_id,
      data_emitere,
      data_scadenta,
      valoare_totala,
      observatii
    } = req.body;

    // Validare
    if (!tip_factura || !client_id || !data_emitere || !valoare_totala) {
      return res.status(400).json({ 
        message: 'Tip, client, dată emitere și valoare sunt obligatorii' 
      });
    }

    // Generare număr factură
    const year = new Date().getFullYear();
    const prefix = tip_factura === 'proforma' ? 'PRO' : 
                   tip_factura === 'chitanta' ? 'CHI' : 'FACT';
    
    const countResult = await db.query(
      `SELECT COUNT(*) FROM facturi 
       WHERE tip_factura = $1 AND EXTRACT(YEAR FROM data_emitere) = $2`,
      [tip_factura, year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const numar_factura = `${prefix}-${year}-${String(count).padStart(4, '0')}`;

    const result = await db.query(
      `INSERT INTO facturi (
        numar_factura, tip_factura, client_id, lucrare_id,
        data_emitere, data_scadenta, valoare_totala, observatii
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        numar_factura, tip_factura, client_id, lucrare_id,
        data_emitere, data_scadenta, valoare_totala, observatii
      ]
    );

    // Adaugă în timeline dacă e asociată cu lucrare
    if (lucrare_id) {
      await db.query(
        `INSERT INTO timeline_lucrari (lucrare_id, user_id, actiune, descriere)
         VALUES ($1, $2, $3, $4)`,
        [lucrare_id, req.user.id, 'factura_emisa', `Factură emisă: ${numar_factura}`]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating factura:', error);
    res.status(500).json({ message: 'Eroare la crearea facturii' });
  }
};

// UPDATE factura
const updateFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tip_factura,
      client_id,
      lucrare_id,
      data_emitere,
      data_scadenta,
      valoare_totala,
      status,
      observatii
    } = req.body;

    const result = await db.query(
      `UPDATE facturi SET
        tip_factura = $1, client_id = $2, lucrare_id = $3,
        data_emitere = $4, data_scadenta = $5, valoare_totala = $6,
        status = $7, observatii = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [
        tip_factura, client_id, lucrare_id,
        data_emitere, data_scadenta, valoare_totala,
        status, observatii, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Factură negăsită' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating factura:', error);
    res.status(500).json({ message: 'Eroare la actualizarea facturii' });
  }
};

// DELETE factura
const deleteFactura = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifică dacă are plăți
    const platiCheck = await db.query(
      'SELECT COUNT(*) FROM plati WHERE factura_id = $1',
      [id]
    );

    if (parseInt(platiCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Nu se poate șterge factura. Are plăți înregistrate.' 
      });
    }

    const result = await db.query(
      'DELETE FROM facturi WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Factură negăsită' });
    }

    res.json({ message: 'Factură ștearsă cu succes' });
  } catch (error) {
    console.error('Error deleting factura:', error);
    res.status(500).json({ message: 'Eroare la ștergerea facturii' });
  }
};

// ADD plata to factura
const addPlata = async (req, res) => {
  try {
    const { factura_id } = req.params;
    const { data_plata, suma, modalitate_plata, numar_document, observatii } = req.body;

    // Validare
    if (!data_plata || !suma || !modalitate_plata) {
      return res.status(400).json({ 
        message: 'Data, sumă și modalitate plată sunt obligatorii' 
      });
    }

    // Adaugă plata
    const plataResult = await db.query(
      `INSERT INTO plati (factura_id, data_plata, suma, modalitate_plata, numar_document, observatii)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [factura_id, data_plata, suma, modalitate_plata, numar_document, observatii]
    );

    // Actualizează valoare platită și status factură
    const updateResult = await db.query(
      `UPDATE facturi 
       SET valoare_platita = valoare_platita + $1,
           status = CASE 
             WHEN (valoare_platita + $1) >= valoare_totala THEN 'incasata'
             WHEN (valoare_platita + $1) > 0 THEN 'partial_incasata'
             ELSE status
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [suma, factura_id]
    );

    // Actualizează valoare încasată în lucrare
    const factura = updateResult.rows[0];
    if (factura.lucrare_id) {
      await db.query(
        `UPDATE lucrari 
         SET valoare_incasata = (
           SELECT COALESCE(SUM(valoare_platita), 0) 
           FROM facturi 
           WHERE lucrare_id = $1
         )
         WHERE id = $1`,
        [factura.lucrare_id]
      );

      // Adaugă în timeline
      await db.query(
        `INSERT INTO timeline_lucrari (lucrare_id, user_id, actiune, descriere)
         VALUES ($1, $2, $3, $4)`,
        [factura.lucrare_id, req.user.id, 'plata_incasata', `Plată încasată: ${suma} RON`]
      );
    }

    res.status(201).json({
      plata: plataResult.rows[0],
      factura: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error adding plata:', error);
    res.status(500).json({ message: 'Eroare la adăugarea plății' });
  }
};

module.exports = {
  getAllFacturi,
  getFacturaById,
  createFactura,
  updateFactura,
  deleteFactura,
  addPlata
};