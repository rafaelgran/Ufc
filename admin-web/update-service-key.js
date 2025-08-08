const fs = require('fs');
const path = require('path');

console.log('🔑 Atualização da Service Role Key');
console.log('=====================================\n');

console.log('📋 Instruções:');
console.log('1. Vá ao Supabase Dashboard → Settings → API');
console.log('2. Copie a Service Role Key completa (deve ter ~218 caracteres)');
console.log('3. Cole a chave abaixo quando solicitado\n');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Cole a Service Role Key aqui: ', (serviceKey) => {
    if (!serviceKey || serviceKey.length < 200) {
        console.log('❌ Chave muito curta ou inválida. Deve ter pelo menos 200 caracteres.');
        rl.close();
        return;
    }

    if (!serviceKey.startsWith('eyJ')) {
        console.log('❌ Chave não começa com "eyJ". Verifique se é uma JWT válida.');
        rl.close();
        return;
    }

    const envPath = path.join(__dirname, '.env');
    
    try {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Remove a linha antiga da Service Role Key
        envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*$/gm, '');
        
        // Adiciona a nova chave
        envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${serviceKey}\n`;
        
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ Service Role Key atualizada com sucesso!');
        console.log('📋 Tamanho da chave:', serviceKey.length, 'caracteres');
        console.log('📋 Primeiros 20 chars:', serviceKey.substring(0, 20) + '...');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar arquivo .env:', error.message);
    }
    
    rl.close();
}); 