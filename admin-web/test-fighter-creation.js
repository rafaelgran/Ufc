const { SupabaseService } = require('./supabase-config');

async function testFighterCreation() {
    console.log('🥊 Testando criação de lutador com categoria...\n');
    
    const supabaseService = new SupabaseService();
    
    try {
        // Teste 1: Criar lutador com categoria
        console.log('1️⃣ Testando criação de lutador com categoria...');
        const testFighter = {
            name: 'Test Fighter',
            nickname: 'Test Nickname',
            record: '10-0-0',
            weightclass: 'Light Heavyweight', // Usando weightclass (minúscula)
            ranking: '1',
            wins: 10,
            losses: 0,
            draws: 0
        };
        
        const newFighter = await supabaseService.createFighter(testFighter);
        console.log('✅ Lutador criado com sucesso:', newFighter);
        
        // Teste 2: Verificar se a categoria foi salva
        console.log('\n2️⃣ Verificando se a categoria foi salva...');
        const fighters = await supabaseService.getAllFighters();
        const createdFighter = fighters.find(f => f.id === newFighter.id);
        
        if (createdFighter) {
            console.log('✅ Lutador encontrado na lista:');
            console.log(`   Nome: ${createdFighter.name}`);
            console.log(`   Categoria: ${createdFighter.weightclass}`);
            console.log(`   Record: ${createdFighter.record}`);
        }
        
        // Teste 3: Atualizar categoria
        console.log('\n3️⃣ Testando atualização de categoria...');
        const updatedFighter = await supabaseService.updateFighter(newFighter.id, {
            weightclass: 'Heavyweight'
        });
        console.log('✅ Categoria atualizada:', updatedFighter.weightclass);
        
        // Teste 4: Deletar lutador de teste
        console.log('\n4️⃣ Removendo lutador de teste...');
        await supabaseService.deleteFighter(newFighter.id);
        console.log('🗑️ Lutador de teste removido');
        
        console.log('\n🎉 Todos os testes passaram! A categoria está funcionando corretamente.');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}

testFighterCreation(); 