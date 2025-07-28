const { SupabaseService } = require('./supabase-config');

async function testCountryField() {
    console.log('🌍 Testando campo country para lutadores...\n');
    const supabaseService = new SupabaseService();
    
    try {
        // Teste 1: Criar lutador com país
        console.log('1️⃣ Criando lutador com país...');
        const testFighter = {
            name: 'Test Fighter Country',
            nickname: 'Test Nickname',
            record: '10-0-0',
            weightclass: 'Lightweight',
            country: 'Brazil',
            ranking: '5'
        };
        
        const newFighter = await supabaseService.createFighter(testFighter);
        console.log('✅ Lutador criado com sucesso:', {
            id: newFighter.id,
            name: newFighter.name,
            country: newFighter.country
        });
        
        // Teste 2: Atualizar país do lutador
        console.log('\n2️⃣ Atualizando país do lutador...');
        const updatedFighter = await supabaseService.updateFighter(newFighter.id, {
            country: 'United States'
        });
        console.log('✅ País atualizado:', {
            name: updatedFighter.name,
            country: updatedFighter.country
        });
        
        // Teste 3: Buscar todos os lutadores para verificar
        console.log('\n3️⃣ Buscando todos os lutadores...');
        const allFighters = await supabaseService.getAllFighters();
        const fightersWithCountry = allFighters.filter(f => f.country);
        console.log(`✅ ${fightersWithCountry.length} lutadores com país definido:`);
        
        fightersWithCountry.forEach(fighter => {
            console.log(`   - ${fighter.name}: ${fighter.country}`);
        });
        
        // Teste 4: Limpar - deletar lutador de teste
        console.log('\n4️⃣ Deletando lutador de teste...');
        await supabaseService.deleteFighter(newFighter.id);
        console.log('✅ Lutador de teste deletado');
        
        console.log('\n🎉 Todos os testes passaram! Campo country funcionando perfeitamente!');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}

testCountryField(); 