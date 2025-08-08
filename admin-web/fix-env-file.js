const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo arquivo .env...\n');

const envPath = path.join(__dirname, '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Remover a linha antiga da Service Role Key (que está quebrada)
    envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*$/gm, '');
    
    // Adicionar a nova chave em uma única linha
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwMTkyNSwiZXhwIjoyMDY4ODc3OTI1fQ.vKFJ5j2SlMonBypOQzZXywKl7UaA19LeroBnqj1Qnw0';
    
    envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}\n`;
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Arquivo .env corrigido!');
    console.log('📋 Tamanho da chave:', serviceRoleKey.length, 'caracteres');
    console.log('📋 Primeiros 20 chars:', serviceRoleKey.substring(0, 20) + '...');
    console.log('📋 Últimos 20 chars:', '...' + serviceRoleKey.substring(serviceRoleKey.length - 20));
    
} catch (error) {
    console.error('❌ Erro ao corrigir arquivo .env:', error.message);
} 