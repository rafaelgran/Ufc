const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testStatusField() {
    try {
        console.log('🔍 Testando atualização específica do campo status...');
        
        // Criar cliente Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Buscar uma luta para testar
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .limit(1);
        
        if (fightsError) {
            console.error('❌ Erro ao buscar lutas:', fightsError);
            return;
        }
        
        if (fights.length === 0) {
            console.log('❌ Nenhuma luta encontrada');
            return;
        }
        
        const testFight = fights[0];
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        
        // Testar atualização apenas do status
        console.log('\n🔄 Testando atualização apenas do status...');
        
        const { data: updateData, error: updateError } = await supabase
            .from('fights')
            .update({
                status: 'live'
            })
            .eq('id', testFight.id)
            .select();
        
        if (updateError) {
            console.error('❌ Erro ao atualizar status:', updateError);
            return;
        }
        
        console.log(`✅ Status atualizado:`, updateData[0]);
        
        // Verificar se foi realmente atualizado
        const { data: verifyData, error: verifyError } = await supabase
            .from('fights')
            .select('*')
            .eq('id', testFight.id)
            .single();
        
        if (verifyError) {
            console.error('❌ Erro ao verificar dados:', verifyError);
            return;
        }
        
        console.log(`📊 Dados após atualização:`);
        console.log(`   - ID: ${verifyData.id}`);
        console.log(`   - Status: ${verifyData.status}`);
        console.log(`   - is_live: ${verifyData.is_live}`);
        
        if (verifyData.status === 'live') {
            console.log('✅ Campo status pode ser atualizado!');
        } else {
            console.log('❌ Campo status não foi atualizado');
        }
        
        // Testar atualização completa
        console.log('\n🔄 Testando atualização completa...');
        
        const { data: fullUpdateData, error: fullUpdateError } = await supabase
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
        
        if (fullUpdateError) {
            console.error('❌ Erro na atualização completa:', fullUpdateError);
            return;
        }
        
        console.log(`✅ Atualização completa:`, fullUpdateData[0]);
        
        // Verificar dados finais
        const { data: finalData, error: finalError } = await supabase
            .from('fights')
            .select('*')
            .eq('id', testFight.id)
            .single();
        
        if (finalError) {
            console.error('❌ Erro ao verificar dados finais:', finalError);
            return;
        }
        
        console.log(`📊 Dados finais:`);
        console.log(`   - ID: ${finalData.id}`);
        console.log(`   - Status: ${finalData.status}`);
        console.log(`   - is_live: ${finalData.is_live}`);
        console.log(`   - current_round: ${finalData.current_round}`);
        console.log(`   - round_status: ${finalData.round_status}`);
        
        if (finalData.status === 'live' && finalData.is_live === true) {
            console.log('✅ Atualização completa funcionando!');
        } else {
            console.log('❌ Atualização completa não funcionou');
        }
        
        console.log('\n✅ Teste do campo status concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testStatusField(); 