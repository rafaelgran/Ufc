const axios = require('axios');

console.log('🔧 Teste de Exclusão de Lutador...\n');

async function testDeleteFighter() {
    try {
        // 1. Primeiro, vamos criar um lutador de teste
        console.log('1️⃣ Criando lutador de teste...');
        const createResponse = await axios.post('http://localhost:3000/api/fighters', {
            name: 'Test Fighter Delete',
            record: '0-0-0',
            wins: 0,
            losses: 0,
            draws: 0
        });
        
        const fighterId = createResponse.data.id;
        console.log(`   ✅ Lutador criado com ID: ${fighterId}`);
        
        // 2. Agora vamos excluir o lutador
        console.log('\n2️⃣ Excluindo lutador...');
        const deleteResponse = await axios.delete(`http://localhost:3000/api/fighters/${fighterId}`);
        
        console.log('   ✅ Lutador excluído com sucesso!');
        console.log('   📋 Resposta:', deleteResponse.data);
        
        // 3. Verificar se o lutador foi realmente excluído
        console.log('\n3️⃣ Verificando se lutador foi excluído...');
        try {
            await axios.get(`http://localhost:3000/api/fighters/${fighterId}`);
            console.log('   ❌ Erro: Lutador ainda existe!');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('   ✅ Lutador foi excluído corretamente (404 - não encontrado)');
            } else {
                console.log('   ⚠️ Erro inesperado:', error.message);
            }
        }
        
        console.log('\n🎉 Teste de exclusão de lutador concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

testDeleteFighter(); 