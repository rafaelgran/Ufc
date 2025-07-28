const { SupabaseService } = require('./supabase-config');

async function testCreateEventError() {
    console.log('🔍 Testando erro na criação de eventos...\n');
    const supabaseService = new SupabaseService();
    
    try {
        // Teste 1: Criar evento com dados mínimos
        console.log('1️⃣ Testando criação com dados mínimos...');
        const minimalEvent = {
            name: 'Test Event Minimal',
            date: '2024-12-25T20:00'
        };
        
        try {
            const newEvent = await supabaseService.createEvent(minimalEvent);
            console.log('✅ Evento criado com sucesso:', newEvent);
        } catch (error) {
            console.log('❌ Erro na criação mínima:', error.message);
            console.log('Detalhes:', error);
        }
        
        // Teste 2: Criar evento com dados completos
        console.log('\n2️⃣ Testando criação com dados completos...');
        const fullEvent = {
            name: 'Test Event Full',
            date: '2024-12-25T20:00',
            location: 'Test Location',
            venue: 'Test Venue',
            mainEvent: 'Test Main Event'
        };
        
        try {
            const newEvent = await supabaseService.createEvent(fullEvent);
            console.log('✅ Evento criado com sucesso:', newEvent);
        } catch (error) {
            console.log('❌ Erro na criação completa:', error.message);
            console.log('Detalhes:', error);
        }
        
        // Teste 3: Verificar estrutura da tabela
        console.log('\n3️⃣ Verificando estrutura da tabela...');
        try {
            const allEvents = await supabaseService.getAllEvents();
            if (allEvents.length > 0) {
                const sampleEvent = allEvents[0];
                console.log('✅ Estrutura da tabela (primeiro evento):', Object.keys(sampleEvent));
                console.log('Exemplo de evento:', sampleEvent);
            }
        } catch (error) {
            console.log('❌ Erro ao verificar estrutura:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testCreateEventError(); 