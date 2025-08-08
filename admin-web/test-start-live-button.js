const { SupabaseService } = require('./supabase-config');

async function testStartLiveButton() {
    try {
        console.log('🔍 Testando botão "Iniciar ao Vivo"...');
        
        const supabaseService = new SupabaseService();
        
        // Buscar uma luta que não esteja ao vivo
        const fights = await supabaseService.getAllFights();
        let testFight = fights.find(f => f.status !== 'live' && !f.is_live && f.status !== 'finished');
        
        if (!testFight) {
            testFight = fights.find(f => f.status !== 'finished');
            console.log('⚠️ Usando luta que não está finalizada para teste');
        }
        
        if (!testFight) {
            console.log('❌ Nenhuma luta adequada encontrada para teste');
            return;
        }
        
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        console.log(`📊 is_finished atual: ${testFight.is_finished}`);
        
        // Verificar dados ANTES
        console.log('\n📋 Dados ANTES do teste:');
        const beforeFight = await supabaseService.getAllFights();
        const beforeTestFight = beforeFight.find(f => f.id === testFight.id);
        console.log(`   - ID: ${beforeTestFight.id}`);
        console.log(`   - Status: ${beforeTestFight.status}`);
        console.log(`   - is_live: ${beforeTestFight.is_live}`);
        console.log(`   - is_finished: ${beforeTestFight.is_finished}`);
        
        // Testar startFightLive diretamente
        console.log('\n🚀 Testando startFightLive diretamente...');
        const updatedFight = await supabaseService.startFightLive(testFight.id);
        
        console.log(`✅ Resposta do startFightLive:`);
        console.log(`   - ID: ${updatedFight.id}`);
        console.log(`   - Status: ${updatedFight.status}`);
        console.log(`   - is_live: ${updatedFight.is_live}`);
        console.log(`   - current_round: ${updatedFight.current_round}`);
        console.log(`   - round_status: ${updatedFight.round_status}`);
        
        // Aguardar um pouco
        console.log('\n⏳ Aguardando 2 segundos...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar dados DEPOIS
        console.log('\n📋 Dados DEPOIS do teste:');
        const afterFight = await supabaseService.getAllFights();
        const afterTestFight = afterFight.find(f => f.id === testFight.id);
        console.log(`   - ID: ${afterTestFight.id}`);
        console.log(`   - Status: ${afterTestFight.status}`);
        console.log(`   - is_live: ${afterTestFight.is_live}`);
        console.log(`   - is_finished: ${afterTestFight.is_finished}`);
        
        // Comparar
        console.log('\n🔍 Comparação:');
        console.log(`   - Status mudou? ${beforeTestFight.status} → ${afterTestFight.status}`);
        console.log(`   - is_live mudou? ${beforeTestFight.is_live} → ${afterTestFight.is_live}`);
        
        if (afterTestFight.status === 'live' && afterTestFight.is_live === true) {
            console.log('✅ startFightLive funcionando corretamente!');
        } else {
            console.log('❌ startFightLive NÃO funcionou corretamente');
            console.log('🔍 Verificando se há problemas específicos...');
            
            // Testar atualização manual
            console.log('\n🧪 Testando atualização manual...');
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            
            const { data: manualUpdate, error: manualError } = await supabase
                .from('fights')
                .update({
                    is_live: true,
                    status: 'live',
                    current_round: 1,
                    round_start_time: new Date().toISOString(),
                    round_status: 'running'
                })
                .eq('id', testFight.id)
                .select();
            
            if (manualError) {
                console.log('❌ Erro na atualização manual:', manualError);
            } else {
                console.log('✅ Atualização manual funcionou:', manualUpdate[0]);
                
                // Verificar novamente
                const finalFights = await supabaseService.getAllFights();
                const finalFight = finalFights.find(f => f.id === testFight.id);
                console.log(`📊 Dados após atualização manual:`);
                console.log(`   - ID: ${finalFight.id}`);
                console.log(`   - Status: ${finalFight.status}`);
                console.log(`   - is_live: ${finalFight.is_live}`);
            }
        }
        
        console.log('\n✅ Teste do botão "Iniciar ao Vivo" concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testStartLiveButton(); 