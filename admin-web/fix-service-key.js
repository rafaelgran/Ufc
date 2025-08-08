const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo Service Role Key...\n');

const envPath = path.join(__dirname, '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Encontrar a linha da Service Role Key
    const serviceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/s);
    
    if (serviceKeyMatch) {
        const currentKey = serviceKeyMatch[1].replace(/\n/g, '').trim();
        console.log('📋 Chave atual encontrada:');
        console.log('   Tamanho:', currentKey.length, 'caracteres');
        console.log('   Início:', currentKey.substring(0, 20) + '...');
        console.log('   Fim:', '...' + currentKey.substring(currentKey.length - 20));
        
        if (currentKey.endsWith('Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8')) {
            console.log('❌ Chave está truncada/inválida!');
            console.log('\n📋 Por favor:');
            console.log('1. Vá ao Supabase Dashboard → Settings → API');
            console.log('2. Copie a Service Role Key completa');
            console.log('3. Execute: node update-service-key.js');
        } else {
            console.log('✅ Chave parece estar correta');
        }
    } else {
        console.log('❌ Service Role Key não encontrada no .env');
    }
    
} catch (error) {
    console.error('❌ Erro ao ler arquivo .env:', error.message);
} 