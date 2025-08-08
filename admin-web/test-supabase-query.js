const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseQuery() {
    try {
        console.log('🔍 Testando consulta do Supabase...');
        
        // Criar cliente Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        // Simular a query exata do app iOS
        console.log('\n🌐 Testando query do app iOS...');
        
        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select(`
                *,
                fights(
                    id,
                    eventid,
                    fighter1id,
                    fighter2id,
                    weightclass,
                    fighttype,
                    rounds,
                    timeremaining,
                    status,
                    is_finished,
                    winner_id,
                    winnerid,
                    fightorder,
                    final_round,
                    result_type
                )
            `)
            .order('date', { ascending: true });
        
        if (eventsError) {
            console.error('❌ Erro na query de eventos:', eventsError);
            return;
        }
        
        console.log(`✅ Query executada com sucesso!`);
        console.log(`📊 Total de eventos: ${eventsData.length}`);
        
        // Verificar se os eventos têm lutas
        eventsData.forEach((event, index) => {
            console.log(`\n🎯 Evento ${index + 1}: ${event.name} (ID: ${event.id})`);
            console.log(`   - Data: ${event.date}`);
            console.log(`   - Lutas: ${event.fights ? event.fights.length : 0}`);
            
            if (event.fights && event.fights.length > 0) {
                console.log(`   - Primeiras 3 lutas:`);
                event.fights.slice(0, 3).forEach(fight => {
                    console.log(`     - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder || 'undefined'} - status: ${fight.status} - is_finished: ${fight.is_finished}`);
                });
                
                // Verificar se há lutas com fightorder
                const fightsWithOrder = event.fights.filter(f => f.fightorder !== undefined && f.fightorder !== null);
                console.log(`   - Lutas com fightorder: ${fightsWithOrder.length}/${event.fights.length}`);
                
                if (fightsWithOrder.length > 0) {
                    console.log(`   - Exemplos de fightorder:`);
                    fightsWithOrder.slice(0, 3).forEach(fight => {
                        console.log(`     - ID ${fight.id}: fightorder = ${fight.fightorder}`);
                    });
                }
                
                // Verificar lutas não finalizadas
                const unfinishedFights = event.fights.filter(f => !f.is_finished);
                console.log(`   - Lutas não finalizadas: ${unfinishedFights.length}`);
                
                if (unfinishedFights.length > 0) {
                    console.log(`   - Lutas não finalizadas:`);
                    unfinishedFights.forEach(fight => {
                        console.log(`     - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder || 'undefined'} - status: ${fight.status}`);
                    });
                }
            }
        });
        
        // Testar query direta de lutas
        console.log('\n🌐 Testando query direta de lutas...');
        
        const { data: fightsData, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .order('fightorder', { ascending: true });
        
        if (fightsError) {
            console.error('❌ Erro na query de lutas:', fightsError);
            return;
        }
        
        console.log(`✅ Query de lutas executada com sucesso!`);
        console.log(`📊 Total de lutas: ${fightsData.length}`);
        
        // Verificar lutas com fightorder
        const fightsWithOrder = fightsData.filter(f => f.fightorder !== undefined && f.fightorder !== null);
        console.log(`📊 Lutas com fightorder: ${fightsWithOrder.length}/${fightsData.length}`);
        
        if (fightsWithOrder.length > 0) {
            console.log(`\n📋 Primeiras 5 lutas com fightorder:`);
            fightsWithOrder.slice(0, 5).forEach(fight => {
                console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder} - status: ${fight.status} - is_finished: ${fight.is_finished}`);
            });
        }
        
        // Verificar lutas sem fightorder
        const fightsWithoutOrder = fightsData.filter(f => f.fightorder === undefined || f.fightorder === null);
        console.log(`\n📊 Lutas SEM fightorder: ${fightsWithoutOrder.length}`);
        
        if (fightsWithoutOrder.length > 0) {
            console.log(`📋 Primeiras 5 lutas sem fightorder:`);
            fightsWithoutOrder.slice(0, 5).forEach(fight => {
                console.log(`   - ID ${fight.id}: ${fight.weightclass} - status: ${fight.status} - is_finished: ${fight.is_finished}`);
            });
        }
        
        console.log('\n✅ Teste de consulta concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testSupabaseQuery(); 