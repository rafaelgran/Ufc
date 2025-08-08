const { SupabaseService } = require('./supabase-config');

async function debugStatusUpdate() {
    try {
        const supabaseService = new SupabaseService();
        
        console.log('🔍 Debug detalhado da atualização de status...');
        
        // Buscar uma luta para testar
        const fights = await supabaseService.getAllFights();
        if (fights.length === 0) {
            console.log('❌ Nenhuma luta encontrada para testar');
            return;
        }
        
        const testFight = fights[0];
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        console.log(`📊 Dados completos:`, JSON.stringify(testFight, null, 2));
        
        // Verificar se a luta tem um evento associado
        if (!testFight.eventId && !testFight.eventid) {
            console.log('❌ Luta não tem evento associado');
            return;
        }
        
        const eventId = testFight.eventId || testFight.eventid;
        console.log(`📅 Evento ID: ${eventId}`);
        
        // Testar startFightLive com debug detalhado
        console.log('\n🚀 Testando startFightLive com debug...');
        
        // Verificar dados ANTES da atualização
        console.log('\n📋 Dados ANTES da atualização:');
        const beforeFight = await supabaseService.getAllFights();
        const beforeTestFight = beforeFight.find(f => f.id === testFight.id);
        console.log(`   - ID: ${beforeTestFight.id}`);
        console.log(`   - Status: ${beforeTestFight.status}`);
        console.log(`   - is_live: ${beforeTestFight.is_live}`);
        console.log(`   - current_round: ${beforeTestFight.current_round}`);
        console.log(`   - round_status: ${beforeTestFight.round_status}`);
        
        // Executar startFightLive
        console.log('\n🔄 Executando startFightLive...');
        const updatedFight = await supabaseService.startFightLive(testFight.id);
        
        console.log(`\n✅ Resposta do startFightLive:`);
        console.log(`   - ID: ${updatedFight.id}`);
        console.log(`   - Status: ${updatedFight.status}`);
        console.log(`   - is_live: ${updatedFight.is_live}`);
        console.log(`   - current_round: ${updatedFight.current_round}`);
        console.log(`   - round_status: ${updatedFight.round_status}`);
        console.log(`   - Dados completos:`, JSON.stringify(updatedFight, null, 2));
        
        // Aguardar um pouco para garantir que a atualização foi processada
        console.log('\n⏳ Aguardando 3 segundos...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar dados DEPOIS da atualização
        console.log('\n📋 Dados DEPOIS da atualização:');
        const afterFight = await supabaseService.getAllFights();
        const afterTestFight = afterFight.find(f => f.id === testFight.id);
        console.log(`   - ID: ${afterTestFight.id}`);
        console.log(`   - Status: ${afterTestFight.status}`);
        console.log(`   - is_live: ${afterTestFight.is_live}`);
        console.log(`   - current_round: ${afterTestFight.current_round}`);
        console.log(`   - round_status: ${afterTestFight.round_status}`);
        console.log(`   - Dados completos:`, JSON.stringify(afterTestFight, null, 2));
        
        // Comparar dados
        console.log('\n🔍 Comparação:');
        console.log(`   - Status mudou? ${beforeTestFight.status} → ${afterTestFight.status}`);
        console.log(`   - is_live mudou? ${beforeTestFight.is_live} → ${afterTestFight.is_live}`);
        
        if (afterTestFight.status === 'live' && afterTestFight.is_live === true) {
            console.log('✅ Status atualizado corretamente no banco!');
        } else {
            console.log('❌ Status NÃO foi atualizado corretamente no banco');
            console.log('🔍 Verificando se há problemas na query...');
            
            // Testar query direta
            console.log('\n🧪 Testando query direta...');
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );
            
            const { data: directData, error: directError } = await supabase
                .from('fights')
                .select('*')
                .eq('id', testFight.id)
                .single();
            
            if (directError) {
                console.log('❌ Erro na query direta:', directError);
            } else {
                console.log('📊 Dados da query direta:');
                console.log(`   - ID: ${directData.id}`);
                console.log(`   - Status: ${directData.status}`);
                console.log(`   - is_live: ${directData.is_live}`);
                console.log(`   - Dados completos:`, JSON.stringify(directData, null, 2));
            }
        }
        
        console.log('\n✅ Debug concluído!');
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o debug
debugStatusUpdate(); 