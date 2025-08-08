const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLiveControl() {
    console.log('🧪 Testando funcionalidades de controle ao vivo...\n');
    
    try {
        // 1. Verificar se as colunas existem (testando com uma luta)
        console.log('1. Verificando estrutura da tabela fights...');
        const { data: testFight, error: testError } = await supabase
            .from('fights')
            .select('*')
            .limit(1);
        
        if (testError) {
            console.error('❌ Erro ao acessar tabela fights:', testError);
            return;
        }
        
        if (!testFight || testFight.length === 0) {
            console.log('⚠️  Nenhuma luta encontrada. Crie uma luta primeiro.');
            return;
        }
        
        const fight = testFight[0];
        console.log('✅ Tabela fights acessível');
        console.log('   Verificando se as novas colunas existem...');
        
        // Verificar se as novas colunas existem
        const newColumns = [
            'is_live', 'current_round', 'round_start_time', 'round_end_time',
            'round_duration', 'round_status', 'result_type', 'final_round',
            'final_time', 'winner_id', 'is_finished', 'result_updated_at'
        ];
        
        const existingColumns = Object.keys(fight);
        const foundColumns = newColumns.filter(col => existingColumns.includes(col));
        
        console.log(`✅ Colunas encontradas: ${foundColumns.length}/${newColumns.length}`);
        foundColumns.forEach(col => {
            console.log(`   - ${col}: ${typeof fight[col]}`);
        });
        
        if (foundColumns.length < newColumns.length) {
            console.log('⚠️  Algumas colunas não foram encontradas. Execute as migrações primeiro.');
            const missingColumns = newColumns.filter(col => !existingColumns.includes(col));
            console.log('   Colunas faltando:', missingColumns);
        }
        
        // 2. Buscar uma luta para testar
        console.log('\n2. Buscando luta para teste...');
        console.log(`✅ Luta encontrada: ID ${fight.id}`);
        
        // 3. Testar iniciar luta ao vivo
        console.log('\n3. Testando iniciar luta ao vivo...');
        const { data: liveFight, error: liveError } = await supabase
            .from('fights')
            .update({
                is_live: true,
                current_round: 1,
                round_start_time: new Date().toISOString(),
                round_status: 'running'
            })
            .eq('id', fight.id)
            .select()
            .single();
        
        if (liveError) {
            console.error('❌ Erro ao iniciar luta ao vivo:', liveError);
        } else {
            console.log('✅ Luta iniciada ao vivo:', {
                id: liveFight.id,
                is_live: liveFight.is_live,
                current_round: liveFight.current_round,
                round_status: liveFight.round_status
            });
        }
        
        // 4. Testar pausar round
        console.log('\n4. Testando pausar round...');
        const { data: pausedFight, error: pauseError } = await supabase
            .from('fights')
            .update({
                round_status: 'paused',
                round_end_time: new Date().toISOString()
            })
            .eq('id', fight.id)
            .select()
            .single();
        
        if (pauseError) {
            console.error('❌ Erro ao pausar round:', pauseError);
        } else {
            console.log('✅ Round pausado:', {
                round_status: pausedFight.round_status,
                round_end_time: pausedFight.round_end_time
            });
        }
        
        // 5. Testar próximo round
        console.log('\n5. Testando próximo round...');
        const { data: nextRoundFight, error: nextError } = await supabase
            .from('fights')
            .update({
                current_round: 2,
                round_start_time: new Date().toISOString(),
                round_end_time: null,
                round_status: 'running'
            })
            .eq('id', fight.id)
            .select()
            .single();
        
        if (nextError) {
            console.error('❌ Erro ao avançar round:', nextError);
        } else {
            console.log('✅ Próximo round:', {
                current_round: nextRoundFight.current_round,
                round_status: nextRoundFight.round_status
            });
        }
        
        // 6. Testar salvar resultado
        console.log('\n6. Testando salvar resultado...');
        const { data: resultFight, error: resultError } = await supabase
            .from('fights')
            .update({
                result_type: 'KO',
                final_round: 2,
                final_time: '01:30',
                winner_id: fight.fighter1Id || fight.fighter1id,
                is_finished: true,
                is_live: false,
                result_updated_at: new Date().toISOString()
            })
            .eq('id', fight.id)
            .select()
            .single();
        
        if (resultError) {
            console.error('❌ Erro ao salvar resultado:', resultError);
        } else {
            console.log('✅ Resultado salvo:', {
                result_type: resultFight.result_type,
                final_round: resultFight.final_round,
                final_time: resultFight.final_time,
                is_finished: resultFight.is_finished
            });
        }
        
        // 7. Testar buscar lutas ao vivo
        console.log('\n7. Testando busca de lutas ao vivo...');
        const { data: liveFights, error: liveFightsError } = await supabase
            .from('fights')
            .select('*')
            .eq('is_live', true);
        
        if (liveFightsError) {
            console.error('❌ Erro ao buscar lutas ao vivo:', liveFightsError);
        } else {
            console.log(`✅ Lutas ao vivo encontradas: ${liveFights.length}`);
        }
        
        // 8. Testar buscar lutas finalizadas
        console.log('\n8. Testando busca de lutas finalizadas...');
        const { data: finishedFights, error: finishedError } = await supabase
            .from('fights')
            .select('*')
            .eq('is_finished', true);
        
        if (finishedError) {
            console.error('❌ Erro ao buscar lutas finalizadas:', finishedError);
        } else {
            console.log(`✅ Lutas finalizadas encontradas: ${finishedFights.length}`);
        }
        
        console.log('\n🎉 Testes concluídos com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}

// Executar testes
testLiveControl(); 