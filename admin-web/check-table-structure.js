const { supabase } = require('./supabase-config');

async function checkTableStructure() {
    console.log('🔍 Verificando estrutura das tabelas no Supabase...\n');
    
    try {
        // Verificar tabela events
        console.log('📊 Tabela EVENTS:');
        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .limit(1);
        
        if (eventsError) {
            console.error('❌ Erro ao verificar events:', eventsError);
        } else {
            console.log('✅ Tabela events acessível');
            if (eventsData && eventsData.length > 0) {
                console.log('📋 Colunas disponíveis:', Object.keys(eventsData[0]));
            }
        }
        
        // Verificar tabela fighters
        console.log('\n🥊 Tabela FIGHTERS:');
        const { data: fightersData, error: fightersError } = await supabase
            .from('fighters')
            .select('*')
            .limit(1);
        
        if (fightersError) {
            console.error('❌ Erro ao verificar fighters:', fightersError);
        } else {
            console.log('✅ Tabela fighters acessível');
            if (fightersData && fightersData.length > 0) {
                console.log('📋 Colunas disponíveis:', Object.keys(fightersData[0]));
            }
        }
        
        // Verificar tabela fights
        console.log('\n🥊 Tabela FIGHTS:');
        const { data: fightsData, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .limit(1);
        
        if (fightsError) {
            console.error('❌ Erro ao verificar fights:', fightsError);
        } else {
            console.log('✅ Tabela fights acessível');
            if (fightsData && fightsData.length > 0) {
                console.log('📋 Colunas disponíveis:', Object.keys(fightsData[0]));
            }
        }
        
        // Testar criação de evento
        console.log('\n🧪 Testando criação de evento...');
        const testEvent = {
            name: 'Test Event',
            date: '2025-12-01T20:00:00',
            location: 'Test Location',
            venue: 'Test Venue',
            mainevent: 'Test Main Event',
            status: 'upcoming'
        };
        
        const { data: newEvent, error: createError } = await supabase
            .from('events')
            .insert([testEvent])
            .select();
        
        if (createError) {
            console.error('❌ Erro ao criar evento:', createError);
        } else {
            console.log('✅ Evento criado com sucesso:', newEvent[0]);
            
            // Deletar o evento de teste
            await supabase
                .from('events')
                .delete()
                .eq('id', newEvent[0].id);
            console.log('🗑️ Evento de teste removido');
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkTableStructure(); 