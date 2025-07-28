const { SupabaseService } = require('./supabase-config');

async function testRecordFields() {
    console.log('🥊 Testando campos de record separados (wins, losses, draws)...\n');
    const supabaseService = new SupabaseService();
    
    try {
        // Teste 1: Criar lutador com record separado
        console.log('1️⃣ Criando lutador com record separado...');
        const testFighter = {
            name: 'Test Fighter Record',
            nickname: 'Test Nickname',
            wins: 15,
            losses: 3,
            draws: 1,
            weightclass: 'Welterweight',
            country: 'Canada',
            ranking: '8'
        };
        
        const newFighter = await supabaseService.createFighter(testFighter);
        console.log('✅ Lutador criado com sucesso:', {
            id: newFighter.id,
            name: newFighter.name,
            record: `${newFighter.wins}-${newFighter.losses}-${newFighter.draws}`,
            country: newFighter.country
        });
        
        // Teste 2: Atualizar record do lutador
        console.log('\n2️⃣ Atualizando record do lutador...');
        const updatedFighter = await supabaseService.updateFighter(newFighter.id, {
            wins: 16,
            losses: 3,
            draws: 1
        });
        console.log('✅ Record atualizado:', {
            name: updatedFighter.name,
            record: `${updatedFighter.wins}-${updatedFighter.losses}-${updatedFighter.draws}`
        });
        
        // Teste 3: Buscar todos os lutadores para verificar
        console.log('\n3️⃣ Buscando todos os lutadores...');
        const allFighters = await supabaseService.getAllFighters();
        const fightersWithRecord = allFighters.filter(f => f.wins !== undefined || f.losses !== undefined || f.draws !== undefined);
        console.log(`✅ ${fightersWithRecord.length} lutadores com record separado:`);
        
        fightersWithRecord.forEach(fighter => {
            const record = `${fighter.wins || 0}-${fighter.losses || 0}-${fighter.draws || 0}`;
            console.log(`   - ${fighter.name}: ${record} (${fighter.country || 'Sem país'})`);
        });
        
        // Teste 4: Limpar - deletar lutador de teste
        console.log('\n4️⃣ Deletando lutador de teste...');
        await supabaseService.deleteFighter(newFighter.id);
        console.log('✅ Lutador de teste deletado');
        
        console.log('\n🎉 Todos os testes passaram! Campos de record separados funcionando perfeitamente!');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}

testRecordFields(); 