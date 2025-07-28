const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEditFightFrontend() {
    console.log('🖥️ Testando edição de lutas como o frontend...\n');
    
    try {
        // 1. Simular carregamento de dados como o frontend faz
        console.log('1️⃣ Simulando carregamento de dados (loadData)...');
        
        // Simular window.fightsData
        const { data: fightsData, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .order('id', { ascending: false });
        
        if (fightsError) {
            console.log('❌ Erro ao carregar lutas:', fightsError);
            return;
        }
        
        console.log(`✅ ${fightsData.length} lutas carregadas em window.fightsData`);
        
        // Simular window.fightersData
        const { data: fightersData, error: fightersError } = await supabase
            .from('fighters')
            .select('*');
        
        if (fightersError) {
            console.log('❌ Erro ao carregar lutadores:', fightersError);
            return;
        }
        
        console.log(`✅ ${fightersData.length} lutadores carregados em window.fightersData`);
        
        // 2. Simular função editFight do frontend
        console.log('\n2️⃣ Simulando função editFight...');
        
        function simulateEditFight(fightId) {
            console.log(`   Editando luta ID: ${fightId}`);
            
            // Simular window.fightsData.find(f => f.id == fightId)
            const fight = fightsData.find(f => f.id == fightId);
            
            if (!fight) {
                console.log('   ❌ Luta não encontrada em window.fightsData');
                console.log('   IDs disponíveis:', fightsData.map(f => f.id));
                return;
            }
            
            console.log('   ✅ Luta encontrada:', {
                id: fight.id,
                eventid: fight.eventid,
                fighter1id: fight.fighter1id,
                fighter2id: fight.fighter2id,
                weightclass: fight.weightclass,
                fighttype: fight.fighttype,
                rounds: fight.rounds
            });
            
            // Simular preenchimento do formulário
            console.log('   📝 Preenchendo formulário:');
            console.log(`   - fightId: ${fight.id}`);
            console.log(`   - fighter1: ${fight.fighter1Id || fight.fighter1id}`);
            console.log(`   - fighter2: ${fight.fighter2Id || fight.fighter2id}`);
            console.log(`   - weightClass: ${fight.weightClass || fight.weightclass}`);
            console.log(`   - fightType: ${fight.fightType || fight.fighttype}`);
            console.log(`   - rounds: ${fight.rounds}`);
            
            // Verificar se os lutadores existem
            const fighter1 = fightersData.find(f => f.id == (fight.fighter1Id || fight.fighter1id));
            const fighter2 = fightersData.find(f => f.id == (fight.fighter2Id || fight.fighter2id));
            
            console.log(`   - Lutador 1: ${fighter1 ? '✅' : '❌'} ${fighter1?.name || 'N/A'}`);
            console.log(`   - Lutador 2: ${fighter2 ? '✅' : '❌'} ${fighter2?.name || 'N/A'}`);
            
            return fight;
        }
        
        // 3. Testar com diferentes IDs de luta
        console.log('\n3️⃣ Testando com diferentes IDs...');
        
        const testIds = [9, 10, 11, 999]; // IDs válidos e inválido
        
        testIds.forEach(fightId => {
            console.log(`\n   --- Testando luta ID ${fightId} ---`);
            simulateEditFight(fightId);
        });
        
        // 4. Verificar se há problemas de tipo de dados
        console.log('\n4️⃣ Verificando tipos de dados...');
        
        const sampleFight = fightsData[0];
        console.log('   Tipos de dados da primeira luta:');
        console.log(`   - id: ${typeof sampleFight.id} (${sampleFight.id})`);
        console.log(`   - fighter1id: ${typeof sampleFight.fighter1id} (${sampleFight.fighter1id})`);
        console.log(`   - fighter2id: ${typeof sampleFight.fighter2id} (${sampleFight.fighter2id})`);
        
        // 5. Testar comparação de IDs
        console.log('\n5️⃣ Testando comparações de ID...');
        
        const testId = 9;
        console.log(`   Testando busca por ID ${testId}:`);
        
        // Teste 1: Comparação estrita
        const fight1 = fightsData.find(f => f.id === testId);
        console.log(`   - f.id === ${testId}: ${fight1 ? '✅ Encontrado' : '❌ Não encontrado'}`);
        
        // Teste 2: Comparação com ==
        const fight2 = fightsData.find(f => f.id == testId);
        console.log(`   - f.id == ${testId}: ${fight2 ? '✅ Encontrado' : '❌ Não encontrado'}`);
        
        // Teste 3: Conversão para string
        const fight3 = fightsData.find(f => f.id.toString() === testId.toString());
        console.log(`   - f.id.toString() === ${testId}.toString(): ${fight3 ? '✅ Encontrado' : '❌ Não encontrado'}`);
        
        // 6. Simular problema específico
        console.log('\n6️⃣ Simulando possível problema...');
        
        // Verificar se window.fightsData está sendo atualizado corretamente
        console.log('   Verificando se os dados estão sendo carregados corretamente:');
        console.log(`   - Total de lutas: ${fightsData.length}`);
        console.log(`   - Primeira luta ID: ${fightsData[0]?.id}`);
        console.log(`   - Última luta ID: ${fightsData[fightsData.length - 1]?.id}`);
        
        // Verificar se há lutas duplicadas ou problemas
        const uniqueIds = [...new Set(fightsData.map(f => f.id))];
        console.log(`   - IDs únicos: ${uniqueIds.length}`);
        console.log(`   - IDs: ${uniqueIds.join(', ')}`);
        
        if (uniqueIds.length !== fightsData.length) {
            console.log('   ⚠️ ATENÇÃO: Há IDs duplicados!');
        }
        
        console.log('\n🎉 Teste de edição frontend concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testEditFightFrontend(); 