// Test script para verificar a exibição de resultados
console.log('🧪 Testando exibição de resultados...');

// Simular dados de lutadores
const fightersData = [
    { id: 1, name: 'Jon Jones', record: '27-1-0' },
    { id: 2, name: 'Stipe Miocic', record: '20-4-0' }
];

// Simular luta finalizada
const testFight = {
    id: 13,
    fighter1id: 1,
    fighter2id: 2,
    weightclass: 'Light Heavyweight',
    rounds: 5,
    is_finished: true,
    result_type: 'DE',
    final_round: 5,
    final_time: '05:00',
    winner_id: 2
};

// Testar função createFightItem
function testCreateFightItem() {
    console.log('Testando createFightItem com luta finalizada...');
    
    // Simular a função createFightItem
    const fighter1 = fightersData.find(f => f.id == testFight.fighter1id);
    const fighter2 = fightersData.find(f => f.id == testFight.fighter2id);
    
    const isFinished = testFight.is_finished || false;
    
    if (isFinished && testFight.result_type && testFight.winner_id) {
        const winner = fightersData.find(f => f.id == testFight.winner_id);
        
        // Format result text
        let resultText = '';
        switch (testFight.result_type) {
            case 'DE': resultText = 'Decision'; break;
            case 'KO': resultText = 'KO'; break;
            case 'TKO': resultText = 'TKO'; break;
            case 'SUB': resultText = 'Submission'; break;
            case 'Draw': resultText = 'Draw'; break;
            case 'DQ': resultText = 'Disqualification'; break;
            case 'NC': resultText = 'No Contest'; break;
            default: resultText = testFight.result_type;
        }
        
        const resultDisplay = `R${testFight.final_round} - ${resultText}`;
        
        // Check if winner is fighter1 or fighter2
        const isWinnerFighter1 = (testFight.winner_id == testFight.fighter1id);
        const isWinnerFighter2 = (testFight.winner_id == testFight.fighter2id);
        
        console.log('✅ Resultado:', resultDisplay);
        console.log('✅ Vencedor:', winner.name);
        console.log('✅ Fighter1 é vencedor:', isWinnerFighter1);
        console.log('✅ Fighter2 é vencedor:', isWinnerFighter2);
        
        // Simular HTML output
        const fighter1Display = `${fighter1.name}${isWinnerFighter1 ? ' ✓' : ''}`;
        const fighter2Display = `${fighter2.name}${isWinnerFighter2 ? ' ✓' : ''}`;
        
        console.log('✅ Fighter1 display:', fighter1Display);
        console.log('✅ Fighter2 display:', fighter2Display);
        
        return {
            result: resultDisplay,
            winner: winner.name,
            fighter1Display: fighter1Display,
            fighter2Display: fighter2Display
        };
    }
    
    return null;
}

// Executar teste
const result = testCreateFightItem();
if (result) {
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('Resultado esperado:');
    console.log(`- Result: ${result.result}`);
    console.log(`- Winner: ${result.winner}`);
    console.log(`- Fighter1: ${result.fighter1Display}`);
    console.log(`- Fighter2: ${result.fighter2Display}`);
} else {
    console.log('❌ Teste falhou');
} 