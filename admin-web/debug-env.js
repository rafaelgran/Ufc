require('dotenv').config();

console.log('🔍 Debug das variáveis de ambiente:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.substring(0, 50) + '...' : 'NÃO DEFINIDA');
console.log('DATABASE_TYPE:', process.env.DATABASE_TYPE);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Testar se o arquivo .env existe
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
console.log('\n📁 Arquivo .env existe:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    console.log('📄 Conteúdo do .env:');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log(envContent);
} 