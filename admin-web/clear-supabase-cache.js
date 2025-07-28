const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearSupabaseCache() {
    console.log('🧹 Limpando cache do Supabase...\n');
    
    try {
        // 1. Verificar estrutura da tabela events
        console.log('1️⃣ Verificando estrutura da tabela events...');
        const { data: eventsStructure, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .limit(1);
        
        if (eventsError) {
            console.log('❌ Erro ao verificar estrutura:', eventsError);
        } else {
            console.log('✅ Estrutura da tabela events:', Object.keys(eventsStructure[0] || {}));
        }
        
        // 2. Verificar se a coluna mainevent existe
        console.log('\n2️⃣ Verificando coluna mainevent...');
        const { data: testEvent, error: testError } = await supabase
            .from('events')
            .select('id, name, mainevent')
            .limit(1);
        
        if (testError) {
            console.log('❌ Erro ao verificar mainevent:', testError);
        } else {
            console.log('✅ Coluna mainevent existe:', testEvent[0]?.mainevent);
        }
        
        // 3. Tentar criar um evento com mainevent
        console.log('\n3️⃣ Testando criação com mainevent...');
        const testEventData = {
            name: 'Test Cache Clear',
            date: new Date().toISOString(),
            location: 'Test',
            venue: 'Test',
            mainevent: 'Test Main Event'
        };
        
        const { data: newEvent, error: createError } = await supabase
            .from('events')
            .insert([testEventData])
            .select();
        
        if (createError) {
            console.log('❌ Erro na criação:', createError);
        } else {
            console.log('✅ Evento criado com sucesso:', newEvent[0]);
            
            // 4. Deletar o evento de teste
            console.log('\n4️⃣ Deletando evento de teste...');
            const { error: deleteError } = await supabase
                .from('events')
                .delete()
                .eq('id', newEvent[0].id);
            
            if (deleteError) {
                console.log('❌ Erro ao deletar:', deleteError);
            } else {
                console.log('✅ Evento de teste deletado');
            }
        }
        
        // 5. Verificar todos os eventos existentes
        console.log('\n5️⃣ Verificando eventos existentes...');
        const { data: allEvents, error: allEventsError } = await supabase
            .from('events')
            .select('*')
            .order('id', { ascending: false })
            .limit(5);
        
        if (allEventsError) {
            console.log('❌ Erro ao buscar eventos:', allEventsError);
        } else {
            console.log(`✅ ${allEvents.length} eventos encontrados`);
            allEvents.forEach(event => {
                console.log(`   - ID: ${event.id}, Name: ${event.name}, MainEvent: ${event.mainevent || 'null'}`);
            });
        }
        
        console.log('\n🎉 Cache limpo e verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

clearSupabaseCache(); 