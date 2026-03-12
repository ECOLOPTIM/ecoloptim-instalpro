const bcrypt = require('bcryptjs');

async function generateHash() {
  const parola = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(parola, salt);
  
  console.log('===========================================');
  console.log('Password:', parola);
  console.log('Hash:', hash);
  console.log('===========================================');
  console.log('\nRulează această comandă în PostgreSQL:\n');
  console.log(`UPDATE utilizatori SET parola_hash = '${hash}' WHERE username = 'admin';`);
  console.log('\n===========================================');
}

generateHash();
