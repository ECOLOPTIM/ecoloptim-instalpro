const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function createTestUser() {
  try {
    // Hash parola "admin123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    console.log('Hash generat:', hashedPassword);
    
    // Șterge user-ul existent
    await pool.query('DELETE FROM utilizatori WHERE username = $1', ['admin']);
    
    // Inserează user nou cu hash corect
    const result = await pool.query(
      `INSERT INTO utilizatori (username, email, password, rol, nume_complet) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, username, email, rol`,
      ['admin', 'admin@ecoloptim.ro', hashedPassword, 'admin', 'Administrator']
    );
    
    console.log('✅ User creat cu succes:', result.rows[0]);
    console.log('Username: admin');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la crearea user-ului:', error);
    process.exit(1);
  }
}

createTestUser();
