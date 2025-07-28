const { createClient } = require('@supabase/supabase-js');

// Teste direto com a chave hardcoded
const supabaseUrl = 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

console.log('🔍 Testando com chave hardcoded:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 50) + '...');
console.log('Key length:', supabaseKey.length);
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('🧪 Testando conexão...');
        
        const { data, error } = await supabase
            .from('events')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Erro:', error);
            return;
        }
        
        console.log('✅ Conexão bem-sucedida!');
        console.log('📊 Dados recebidos:', data);
        
        // Testar busca de eventos
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .limit(5);
        
        if (eventsError) {
            console.error('❌ Erro ao buscar eventos:', eventsError);
            return;
        }
        
        console.log(`✅ Encontrados ${events.length} eventos`);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testConnection(); 