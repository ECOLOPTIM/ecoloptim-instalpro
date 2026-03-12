const db = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

// GET documente by lucrare
const getDocumenteByLucrare = async (req, res) => {
  try {
    const { lucrare_id } = req.params;

    const result = await db.query(
      `SELECT 
        d.*,
        u.username as uploaded_by_username,
        u.nume_complet as uploaded_by_name
      FROM documente d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.lucrare_id = $1
      ORDER BY d.created_at DESC`,
      [lucrare_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting documente:', error);
    res.status(500).json({ message: 'Eroare la obținerea documentelor' });
  }
};

// GET all documente
const getAllDocumente = async (req, res) => {
  try {
    const { tip_document, lucrare_id } = req.query;

    let query = `
      SELECT 
        d.*,
        l.numar_lucrare,
        l.nume_lucrare,
        c.nume as client_nume,
        u.username as uploaded_by_username
      FROM documente d
      LEFT JOIN lucrari l ON d.lucrare_id = l.id
      LEFT JOIN clienti c ON l.client_id = c.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (tip_document) {
      query += ` AND d.tip_document = $${paramIndex}`;
      params.push(tip_document);
      paramIndex++;
    }

    if (lucrare_id) {
      query += ` AND d.lucrare_id = $${paramIndex}`;
      params.push(lucrare_id);
      paramIndex++;
    }

    query += ` ORDER BY d.created_at DESC`;

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting all documente:', error);
    res.status(500).json({ message: 'Eroare la obținerea documentelor' });
  }
};

// CREATE document (metadata only - file upload handled separately)
const createDocument = async (req, res) => {
  try {
    const {
      lucrare_id,
      tip_document,
      nume_fisier,
      cale_fisier,
      dimensiune_kb,
      observatii
    } = req.body;

    // Validare
    if (!lucrare_id || !tip_document || !nume_fisier || !cale_fisier) {
      return res.status(400).json({ 
        message: 'Lucrare, tip document, nume și cale sunt obligatorii' 
      });
    }

    const result = await db.query(
      `INSERT INTO documente (
        lucrare_id, tip_document, nume_fisier, cale_fisier,
        dimensiune_kb, uploaded_by, observatii
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        lucrare_id, tip_document, nume_fisier, cale_fisier,
        dimensiune_kb, req.user.id, observatii
      ]
    );

    // Adaugă în timeline lucrare
    await db.query(
      `INSERT INTO timeline_lucrari (lucrare_id, user_id, actiune, descriere)
       VALUES ($1, $2, $3, $4)`,
      [lucrare_id, req.user.id, 'document_adaugat', `Document adăugat: ${nume_fisier}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Eroare la crearea documentului' });
  }
};

// DELETE document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document info
    const docResult = await db.query(
      'SELECT * FROM documente WHERE id = $1',
      [id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Document negăsit' });
    }

    const document = docResult.rows[0];

    // Delete from database
    await db.query('DELETE FROM documente WHERE id = $1', [id]);

    // Adaugă în timeline
    await db.query(
      `INSERT INTO timeline_lucrari (lucrare_id, user_id, actiune, descriere)
       VALUES ($1, $2, $3, $4)`,
      [document.lucrare_id, req.user.id, 'document_sters', `Document șters: ${document.nume_fisier}`]
    );

    // TODO: Delete physical file if needed
    // await fs.unlink(document.cale_fisier);

    res.json({ message: 'Document șters cu succes' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Eroare la ștergerea documentului' });
  }
};

module.exports = {
  getDocumenteByLucrare,
  getAllDocumente,
  createDocument,
  deleteDocument
};