const fs = require('fs');

console.log('🔧 Corrigindo Service Role Key no .env...');

const envPath = '.env';
const correctKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwMTkyNSwiZXhwIjoyMDY4ODc3OTI1fQ.vKFJ5j2SlMonBypOQzZXywKl7UaA19LeroBnqj1Qnw0';

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Remove a linha antiga da Service Role Key
    envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*$/gm, '');
    
    // Adiciona a nova chave correta
    envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${correctKey}\n`;
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Service Role Key corrigida!');
    console.log('📋 Últimos 20 caracteres:', correctKey.slice(-20));
    
} catch (error) {
    console.error('❌ Erro ao corrigir:', error.message);
} 