// Script to quickly generate a hashed password
import bcrypt from 'bcryptjs';

const password = 'HRAdmin123!';  // The plain text password to be encrypted
// already create: 
// username: hr_admin_1, email: hr.admin1@company.com, password: HRAdmin123!
// username: hr_admin_2, email: hr.admin2@company.com, password: HRAdmin456!


bcrypt.hash(password, 10)
    .then(hash => {
        console.log('\n✅ Password encrypted successfully！\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Original Password:', password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Hashed Password (Copy the line below)）:');
        console.log(hash);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Encryption failed:', err);
        process.exit(1);
    });
