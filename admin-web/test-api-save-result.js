const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testApiSaveResult() {
    console.log('🧪 Testando API de salvamento de resultado...\n');
    
    try {
        // 1. Buscar uma luta para teste
        console.log('1. Buscando luta para teste...');
        const fightsResponse = await axios.get(`${API_BASE_URL}/fights`);
        const fights = fightsResponse.data;
        
        if (!fights || fights.length === 0) {
            console.error('❌ Nenhuma luta encontrada para teste');
            return;
        }
        
        const fight = fights[0];
        console.log(`✅ Luta encontrada: ID ${fight.id}`);
        console.log(`   Rounds: ${fight.rounds || 3}`);
        console.log(`   Fighter1 ID: ${fight.fighter1id}`);
        console.log(`   Fighter2 ID: ${fight.fighter2id}`);
        
        // 2. Testar salvamento de resultado KO via API
        console.log('\n2. Testando salvamento de resultado KO via API...');
        const koResult = {
            resultType: 'KO',
            finalRound: 2,
            finalTime: '01:30',
            winnerId: fight.fighter1id
        };
        
        console.log('Dados sendo enviados:', koResult);
        
        const koResponse = await axios.post(`${API_BASE_URL}/fights/${fight.id}/save-result`, koResult);
        console.log('✅ Resultado KO salvo com sucesso via API:', koResponse.data);
        
        // 3. Testar salvamento de resultado DE (Decisão) via API
        console.log('\n3. Testando salvamento de resultado DE (Decisão) via API...');
        const deResult = {
            resultType: 'DE',
            finalRound: fight.rounds || 3,
            finalTime: '05:00',
            winnerId: fight.fighter2id
        };
        
        console.log('Dados sendo enviados:', deResult);
        
        const deResponse = await axios.post(`${API_BASE_URL}/fights/${fight.id}/save-result`, deResult);
        console.log('✅ Resultado DE salvo com sucesso via API:', deResponse.data);
        
        // 4. Verificar dados salvos via API
        console.log('\n4. Verificando dados salvos via API...');
        const updatedFightsResponse = await axios.get(`${API_BASE_URL}/fights`);
        const updatedFights = updatedFightsResponse.data;
        const savedFight = updatedFights.find(f => f.id === fight.id);
        
        if (savedFight) {
            console.log('✅ Dados finais da luta via API:');
            console.log(`   Result Type: ${savedFight.result_type}`);
            console.log(`   Final Round: ${savedFight.final_round}`);
            console.log(`   Final Time: ${savedFight.final_time}`);
            console.log(`   Winner ID: ${savedFight.winner_id}`);
            console.log(`   Is Finished: ${savedFight.is_finished}`);
            console.log(`   Is Live: ${savedFight.is_live}`);
        }
        
        console.log('\n🎉 Teste de API concluído!');
        
    } catch (error) {
        console.error('❌ Erro na API:', error.response ? error.response.data : error.message);
    }
}

testApiSaveResult(); 