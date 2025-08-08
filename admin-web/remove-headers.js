const fs = require('fs');

console.log('🔧 Removendo todas as chamadas .headers() do supabase-config.js...');

const filePath = 'supabase-config.js';

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove todas as chamadas .headers(adminHeaders)
    content = content.replace(/\.headers\(adminHeaders\);/g, ';');
    
    // Remove as linhas que declaram adminHeaders se não forem mais usadas
    content = content.replace(/const adminHeaders = await getAdminHeaders\(\);\s*\n\s*/g, '');
    
    fs.writeFileSync(filePath, content);
    
    console.log('✅ Todas as chamadas .headers() foram removidas!');
    
} catch (error) {
    console.error('❌ Erro ao remover headers:', error.message);
} 