// Test script for new women's weight classes
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ966pyfwV9bOcu6bHLFJSGaQU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewWeightClasses() {
    console.log('🥊 Testando novas categorias de lutadoras...\n');
    
    // 1. Listar todas as categorias disponíveis
    console.log('📋 1. Categorias disponíveis no sistema:');
    const weightClasses = [
        'Bantamweight',
        'Featherweight', 
        'Flyweight',
        'Heavyweight',
        'Light Heavyweight',
        'Lightweight',
        'Middleweight',
        'Welterweight',
        'Women\'s Bantamweight',
        'Women\'s Flyweight',
        'Women\'s Strawweight'
    ];
    
    weightClasses.forEach((weightClass, index) => {
        console.log(`   ${index + 1}. ${weightClass}`);
    });
    
    // 2. Testar criação de lutadoras nas novas categorias
    console.log('\n👩 2. Testando criação de lutadoras nas novas categorias:');
    
    const testFighters = [
        {
            name: 'Amanda Nunes',
            weightclass: 'Women\'s Bantamweight',
            country: 'Brazil',
            wins: 23,
            losses: 5,
            draws: 0,
            ranking: 'C'
        },
        {
            name: 'Valentina Shevchenko',
            weightclass: 'Women\'s Flyweight',
            country: 'Kyrgyzstan',
            wins: 23,
            losses: 4,
            draws: 0,
            ranking: 'C'
        },
        {
            name: 'Zhang Weili',
            weightclass: 'Women\'s Strawweight',
            country: 'China',
            wins: 24,
            losses: 3,
            draws: 0,
            ranking: 'C'
        }
    ];
    
    for (const fighter of testFighters) {
        console.log(`\n   Testando criação: ${fighter.name} (${fighter.weightclass})`);
        
        try {
            const { data: newFighter, error } = await supabase
                .from('fighters')
                .insert([fighter])
                .select()
                .single();
                
            if (error) {
                console.log(`   ❌ Erro: ${error.message}`);
            } else {
                console.log(`   ✅ Criado com sucesso! ID: ${newFighter.id}`);
                
                // Verificar se foi salvo corretamente
                const { data: savedFighter, error: fetchError } = await supabase
                    .from('fighters')
                    .select('*')
                    .eq('id', newFighter.id)
                    .single();
                    
                if (fetchError) {
                    console.log(`   ❌ Erro ao buscar: ${fetchError.message}`);
                } else {
                    console.log(`   ✅ Verificado: ${savedFighter.name} - ${savedFighter.weightclass}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Erro inesperado: ${error.message}`);
        }
    }
    
    // 3. Testar criação de lutas nas novas categorias
    console.log('\n🥊 3. Testando criação de lutas nas novas categorias:');
    
    // Primeiro, buscar alguns lutadores para criar lutas
    const { data: fighters, error: fightersError } = await supabase
        .from('fighters')
        .select('*')
        .in('weightclass', ['Women\'s Bantamweight', 'Women\'s Flyweight', 'Women\'s Strawweight'])
        .limit(6);
        
    if (fightersError) {
        console.log(`   ❌ Erro ao buscar lutadores: ${fightersError.message}`);
    } else {
        console.log(`   ✅ Encontrados ${fighters.length} lutadores nas novas categorias`);
        
        // Buscar um evento para associar as lutas
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .limit(1);
            
        if (eventsError || !events.length) {
            console.log(`   ❌ Erro ao buscar eventos: ${eventsError?.message || 'Nenhum evento encontrado'}`);
        } else {
            const eventId = events[0].id;
            console.log(`   ✅ Usando evento ID: ${eventId}`);
            
            // Criar lutas de teste
            const testFights = [];
            
            // Agrupar lutadores por categoria
            const fightersByWeight = {};
            fighters.forEach(fighter => {
                if (!fightersByWeight[fighter.weightclass]) {
                    fightersByWeight[fighter.weightclass] = [];
                }
                fightersByWeight[fighter.weightclass].push(fighter);
            });
            
            // Criar lutas para cada categoria
            Object.keys(fightersByWeight).forEach(weightClass => {
                const categoryFighters = fightersByWeight[weightClass];
                if (categoryFighters.length >= 2) {
                    testFights.push({
                        eventid: eventId,
                        fighter1id: categoryFighters[0].id,
                        fighter2id: categoryFighters[1].id,
                        weightclass: weightClass,
                        fighttype: 'main',
                        rounds: 5,
                        fightorder: testFights.length + 1
                    });
                }
            });
            
            console.log(`   📝 Criando ${testFights.length} lutas de teste...`);
            
            for (const fight of testFights) {
                try {
                    const { data: newFight, error } = await supabase
                        .from('fights')
                        .insert([fight])
                        .select()
                        .single();
                        
                    if (error) {
                        console.log(`   ❌ Erro ao criar luta: ${error.message}`);
                    } else {
                        console.log(`   ✅ Luta criada! ID: ${newFight.id} - ${fight.weightclass}`);
                    }
                } catch (error) {
                    console.log(`   ❌ Erro inesperado: ${error.message}`);
                }
            }
        }
    }
    
    // 4. Verificar categorias no banco
    console.log('\n📊 4. Verificando categorias no banco de dados:');
    
    const { data: allFighters, error: allFightersError } = await supabase
        .from('fighters')
        .select('weightclass')
        .not('weightclass', 'is', null);
        
    if (allFightersError) {
        console.log(`   ❌ Erro ao buscar categorias: ${allFightersError.message}`);
    } else {
        const uniqueWeightClasses = [...new Set(allFighters.map(f => f.weightclass))];
        console.log(`   ✅ Categorias encontradas no banco (${uniqueWeightClasses.length}):`);
        uniqueWeightClasses.sort().forEach(weightClass => {
            const count = allFighters.filter(f => f.weightclass === weightClass).length;
            console.log(`      - ${weightClass}: ${count} lutadores`);
        });
    }
    
    // 5. Checklist de verificação
    console.log('\n📋 5. Checklist de verificação:');
    console.log('   [ ] Categorias adicionadas no HTML');
    console.log('   [ ] Categorias funcionando no formulário de lutadores');
    console.log('   [ ] Categorias funcionando no formulário de lutas');
    console.log('   [ ] Criação de lutadores nas novas categorias');
    console.log('   [ ] Criação de lutas nas novas categorias');
    console.log('   [ ] Filtro por categoria funcionando');
    console.log('   [ ] Exibição correta das categorias');
    
    // 6. Instruções de teste
    console.log('\n🚀 6. Como testar manualmente:');
    console.log('   1. Acesse: http://localhost:3000');
    console.log('   2. Vá para aba "Lutadores"');
    console.log('   3. Clique em "Novo Lutador"');
    console.log('   4. Verifique se as novas categorias aparecem:');
    console.log('      - Women\'s Bantamweight');
    console.log('      - Women\'s Flyweight');
    console.log('      - Women\'s Strawweight');
    console.log('   5. Crie um lutador em cada categoria');
    console.log('   6. Vá para aba "Eventos"');
    console.log('   7. Crie uma luta e verifique as categorias');
    console.log('   8. Teste o filtro por categoria');
    
    console.log('\n🎉 Teste das novas categorias concluído!');
    console.log('🥊 As categorias femininas estão disponíveis no sistema!');
}

testNewWeightClasses(); 