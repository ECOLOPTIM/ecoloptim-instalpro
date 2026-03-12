const bcrypt = require('bcryptjs');

const testPassword = 'admin123';
const storedHash = '$2a$10$TCT7HzIIu/Hh2mL52q8QbuUP/6CQlVeF47Ktu0DCPogFWeliW65rG';

console.log('🔐 Testing bcrypt compare...');
console.log('Password:', testPassword);
console.log('Hash:', storedHash);

bcrypt.compare(testPassword, storedHash).then(result => {
  console.log('✅ Result:', result);
  if (result) {
    console.log('✅ Password matches!');
  } else {
    console.log('❌ Password does NOT match!');
  }
  process.exit(0);
});
