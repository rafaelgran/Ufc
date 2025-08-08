const axios = require('axios');

console.log('🔧 Teste de Limpeza de Resultado da Luta...\n');

async function testClearFightResult() {
    try {
        // 1. Primeiro, vamos buscar uma luta que tenha resultado
        console.log('1️⃣ Buscando lutas com resultado...');
        const fightsResponse = await axios.get('http://localhost:3000/api/fights');
        const fights = fightsResponse.data;
        
        const finishedFight = fights.find(fight => fight.is_finished);
        
        if (!finishedFight) {
            console.log('   ⚠️ Nenhuma luta finalizada encontrada. Vamos criar uma...');
            
            // Criar uma luta de teste com resultado
            const testFightResponse = await axios.post('http://localhost:3000/api/fights', {
                eventid: 1,
                fighter1id: 1,
                fighter2id: 2,
                weightclass: 'Lightweight',
                fighttype: 'Main Card',
                fightorder: 1,
                rounds: 3,
                is_finished: true,
                result_type: 'DE',
                final_round: 3,
                final_time: '05:00',
                winner_id: 1,
                loser_id: 2
            });
            
            const fightId = testFightResponse.data.id;
            console.log(`   ✅ Luta de teste criada com ID: ${fightId}`);
            
            // 2. Agora vamos limpar o resultado
            console.log('\n2️⃣ Limpando resultado da luta...');
            const clearResponse = await axios.post(`http://localhost:3000/api/fights/${fightId}/clear-result`);
            
            console.log('   ✅ Resultado limpo com sucesso!');
            console.log('   📋 Resposta:', clearResponse.data);
            
            // 3. Verificar se o resultado foi realmente limpo
            console.log('\n3️⃣ Verificando se resultado foi limpo...');
            const updatedFightResponse = await axios.get(`http://localhost:3000/api/fights/${fightId}`);
            const updatedFight = updatedFightResponse.data;
            
            if (!updatedFight.is_finished && !updatedFight.winner_id && !updatedFight.loser_id) {
                console.log('   ✅ Resultado foi limpo corretamente!');
            } else {
                console.log('   ❌ Resultado não foi limpo corretamente!');
                console.log('   📋 Estado atual:', {
                    is_finished: updatedFight.is_finished,
                    winner_id: updatedFight.winner_id,
                    loser_id: updatedFight.loser_id
                });
            }
            
            // 4. Limpar a luta de teste
            console.log('\n4️⃣ Removendo luta de teste...');
            await axios.delete(`http://localhost:3000/api/fights/${fightId}`);
            console.log('   ✅ Luta de teste removida');
            
        } else {
            console.log(`   ✅ Luta finalizada encontrada: ID ${finishedFight.id}`);
            
            // 2. Limpar o resultado
            console.log('\n2️⃣ Limpando resultado da luta...');
            const clearResponse = await axios.post(`http://localhost:3000/api/fights/${finishedFight.id}/clear-result`);
            
            console.log('   ✅ Resultado limpo com sucesso!');
            console.log('   📋 Resposta:', clearResponse.data);
            
            // 3. Verificar se o resultado foi realmente limpo
            console.log('\n3️⃣ Verificando se resultado foi limpo...');
            const updatedFightResponse = await axios.get(`http://localhost:3000/api/fights/${finishedFight.id}`);
            const updatedFight = updatedFightResponse.data;
            
            if (!updatedFight.is_finished && !updatedFight.winner_id && !updatedFight.loser_id) {
                console.log('   ✅ Resultado foi limpo corretamente!');
            } else {
                console.log('   ❌ Resultado não foi limpo corretamente!');
                console.log('   📋 Estado atual:', {
                    is_finished: updatedFight.is_finished,
                    winner_id: updatedFight.winner_id,
                    loser_id: updatedFight.loser_id
                });
            }
        }
        
        console.log('\n🎉 Teste de limpeza de resultado concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

testClearFightResult(); 