const { createClient } = require('@supabase/supabase-js');

async function testDirectUpdate() {
    console.log('🔍 Testando update direto no Supabase...');
    
    const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
        console.log('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
        return;
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // 1. Buscar evento
        console.log('1️⃣ Buscando evento...');
        const { data: events, error: fetchError } = await supabaseAdmin
            .from('events')
            .select('*')
            .limit(1);
        
        if (fetchError) {
            console.log('❌ Erro ao buscar:', fetchError);
            return;
        }
        
        if (!events || events.length === 0) {
            console.log('❌ Nenhum evento encontrado');
            return;
        }
        
        const event = events[0];
        console.log('📋 Evento encontrado:', {
            id: event.id,
            name: event.name,
            date: event.date
        });
        
        // 2. Tentar update direto
        console.log('\n2️⃣ Tentando update direto...');
        const newDate = '2025-12-25T15:30:00.000Z';
        
        const { data: updateResult, error: updateError } = await supabaseAdmin
            .from('events')
            .update({ date: newDate })
            .eq('id', event.id)
            .select();
        
        console.log('📥 Resultado do update direto:');
        console.log('   Data:', updateResult);
        console.log('   Error:', updateError);
        
        if (updateError) {
            console.log('❌ Erro no update direto:', updateError);
        } else if (updateResult && updateResult.length > 0) {
            const updatedEvent = updateResult[0];
            console.log('✅ Update direto bem-sucedido:', {
                id: updatedEvent.id,
                name: updatedEvent.name,
                date: updatedEvent.date
            });
            
            if (updatedEvent.date === newDate) {
                console.log('✅ Data foi atualizada corretamente!');
            } else {
                console.log('❌ Data não foi atualizada!');
                console.log('   Esperado:', newDate);
                console.log('   Recebido:', updatedEvent.date);
            }
        }
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
    }
}

testDirectUpdate(); 