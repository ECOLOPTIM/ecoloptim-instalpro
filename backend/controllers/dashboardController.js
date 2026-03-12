const db = require('../config/database');

// GET dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Total clienți
    const clientiResult = await db.query(
      "SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'activ') as activi FROM clienti"
    );

    // Total lucrări pe status
    const lucrariResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'oferta') as oferte,
        COUNT(*) FILTER (WHERE status = 'contract_semnat') as contracte,
        COUNT(*) FILTER (WHERE status = 'in_executie') as in_executie,
        COUNT(*) FILTER (WHERE status = 'finalizata') as finalizate
      FROM lucrari
    `);

    // Valori financiare
    const financiarResult = await db.query(`
      SELECT 
        COALESCE(SUM(valoare_contract), 0) as valoare_totala_contracte,
        COALESCE(SUM(valoare_incasata), 0) as valoare_totala_incasata,
        COALESCE(SUM(valoare_contract - valoare_incasata), 0) as rest_de_incasat
      FROM lucrari
      WHERE status NOT IN ('anulata', 'suspendata')
    `);

    // Facturi neîncasate
    const facturiResult = await db.query(`
      SELECT 
        COUNT(*) as numar_facturi_neincasate,
        COALESCE(SUM(valoare_totala - valoare_incasata), 0) as valoare_neincasata
      FROM facturi
      WHERE status IN ('emisa', 'incasata_partial')
    `);

    // Venit luna curentă
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const venitLunaResult = await db.query(`
      SELECT COALESCE(SUM(suma), 0) as venit_luna
      FROM plati
      WHERE TO_CHAR(data_plata, 'YYYY-MM') = $1
    `, [currentMonth]);

    // Lucrări cu termene apropiate (următoarele 30 zile)
    const termeneResult = await db.query(`
      SELECT COUNT(*) as lucrari_termen_apropiat
      FROM lucrari
      WHERE status IN ('contract_semnat', 'in_executie')
        AND data_finalizare_planificata BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    `);

    res.json({
      clienti: clientiResult.rows[0],
      lucrari: lucrariResult.rows[0],
      financiar: financiarResult.rows[0],
      facturi: facturiResult.rows[0],
      venit_luna: parseFloat(venitLunaResult.rows[0].venit_luna),
      alerte: {
        termene_apropiate: parseInt(termeneResult.rows[0].lucrari_termen_apropiat)
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Eroare la obținerea statisticilor' });
  }
};

// GET lucrări recente
const getLucrariRecente = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const result = await db.query(`
      SELECT 
        l.id, l.numar_lucrare, l.nume_lucrare, l.status, l.tip_lucrare,
        l.valoare_contract, l.procent_finalizare, l.created_at,
        c.nume as client_nume
      FROM lucrari l
      LEFT JOIN clienti c ON l.client_id = c.id
      ORDER BY l.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting lucrari recente:', error);
    res.status(500).json({ message: 'Eroare la obținerea lucrărilor recente' });
  }
};

// GET evoluție lucrări (ultimele 6 luni)
const getEvolutieLucrari = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as luna,
        COUNT(*) as numar_lucrari,
        COALESCE(SUM(valoare_contract), 0) as valoare_totala
      FROM lucrari
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY luna ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting evolutie lucrari:', error);
    res.status(500).json({ message: 'Eroare la obținerea evoluției lucrărilor' });
  }
};

// GET lucrări cu termene apropiate
const getLucrariTermeneApropiate = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        l.id, l.numar_lucrare, l.nume_lucrare, l.status,
        l.data_finalizare_planificata,
        c.nume as client_nume,
        (l.data_finalizare_planificata - CURRENT_DATE) as zile_ramase
      FROM lucrari l
      LEFT JOIN clienti c ON l.client_id = c.id
      WHERE l.status IN ('contract_semnat', 'in_executie')
        AND l.data_finalizare_planificata BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      ORDER BY l.data_finalizare_planificata ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting lucrari termene apropiate:', error);
    res.status(500).json({ message: 'Eroare la obținerea lucrărilor cu termene apropiate' });
  }
};

module.exports = {
  getDashboardStats,
  getLucrariRecente,
  getEvolutieLucrari,
  getLucrariTermeneApropiate
};