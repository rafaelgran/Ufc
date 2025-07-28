const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFightsDisplay() {
    console.log('🥊 Testando exibição de lutas...\n');
    
    try {
        // 1. Buscar todos os eventos
        console.log('1️⃣ Buscando eventos...');
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .order('id', { ascending: false })
            .limit(5);
        
        if (eventsError) {
            console.log('❌ Erro ao buscar eventos:', eventsError);
            return;
        }
        
        console.log(`✅ ${events.length} eventos encontrados`);
        
        // 2. Buscar todas as lutas
        console.log('\n2️⃣ Buscando lutas...');
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .order('id', { ascending: false });
        
        if (fightsError) {
            console.log('❌ Erro ao buscar lutas:', fightsError);
            return;
        }
        
        console.log(`✅ ${fights.length} lutas encontradas`);
        
        // 3. Buscar todos os lutadores
        console.log('\n3️⃣ Buscando lutadores...');
        const { data: fighters, error: fightersError } = await supabase
            .from('fighters')
            .select('*');
        
        if (fightersError) {
            console.log('❌ Erro ao buscar lutadores:', fightersError);
            return;
        }
        
        console.log(`✅ ${fighters.length} lutadores encontrados`);
        
        // 4. Analisar estrutura dos dados
        console.log('\n4️⃣ Analisando estrutura dos dados...');
        
        if (fights.length > 0) {
            const sampleFight = fights[0];
            console.log('Estrutura de uma luta:', Object.keys(sampleFight));
            console.log('Exemplo de luta:', {
                id: sampleFight.id,
                eventid: sampleFight.eventid,
                fighter1id: sampleFight.fighter1id,
                fighter2id: sampleFight.fighter2id,
                weightclass: sampleFight.weightclass,
                fighttype: sampleFight.fighttype,
                fightorder: sampleFight.fightorder
            });
        }
        
        // 5. Simular filtro do frontend
        console.log('\n5️⃣ Simulando filtro do frontend...');
        
        if (events.length > 0 && fights.length > 0) {
            const testEventId = events[0].id;
            console.log(`Testando filtro para evento ID: ${testEventId}`);
            
            // Simular o filtro que o frontend faz
            const eventFights = fights.filter(fight => 
                fight.eventId == testEventId || 
                fight.eventid == testEventId
            );
            
            console.log(`✅ ${eventFights.length} lutas encontradas para o evento ${testEventId}`);
            
            if (eventFights.length > 0) {
                eventFights.forEach(fight => {
                    const fighter1 = fighters.find(f => f.id == fight.fighter1Id || f.id == fight.fighter1id);
                    const fighter2 = fighters.find(f => f.id == fight.fighter2Id || f.id == fight.fighter2id);
                    
                    console.log(`   - Luta ${fight.id}: ${fighter1?.name || 'Lutador 1'} vs ${fighter2?.name || 'Lutador 2'} (${fight.weightclass || fight.weightClass})`);
                });
            }
        }
        
        // 6. Verificar campos específicos
        console.log('\n6️⃣ Verificando campos específicos...');
        
        const fieldsToCheck = ['eventid', 'fighter1id', 'fighter2id', 'weightclass', 'fighttype', 'fightorder'];
        fieldsToCheck.forEach(field => {
            const hasField = fights.some(fight => fight[field] !== undefined);
            console.log(`   - Campo '${field}': ${hasField ? '✅ Presente' : '❌ Ausente'}`);
        });
        
        console.log('\n🎉 Teste de exibição de lutas concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testFightsDisplay(); 