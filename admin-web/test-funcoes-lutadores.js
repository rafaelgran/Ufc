// Test script for fighters functions
console.log('🥊 Testando funções de lutadores...\n');

function testFightersFunctions() {
    console.log('📋 1. Verificando funções essenciais:');
    
    // Check if essential functions exist
    const essentialFunctions = [
        'handleFighterSubmit',
        'editFighter', 
        'deleteFighter',
        'resetFighterForm',
        'calculateRecord',
        'openFighterModal',
        'displayFighters',
        'displayFightersByCategory',
        'updateCategoryCounts',
        'addCategoryEventListeners'
    ];
    
    essentialFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`   ✅ ${funcName} - OK`);
        } else {
            console.log(`   ❌ ${funcName} - FALTANDO`);
        }
    });
    
    console.log('\n📋 2. Verificando elementos HTML:');
    
    // Check if HTML elements exist
    const htmlElements = [
        'fighterForm',
        'fighterModal',
        'fighterName',
        'fighterNickname',
        'fighterWins',
        'fighterLosses', 
        'fighterDraws',
        'fighterWeightClass',
        'fighterCountry',
        'fighterRanking',
        'fighterRecordDisplay',
        'fightersList',
        'fightersCategoriesList',
        'fightersCategoryTitle'
    ];
    
    htmlElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`   ✅ ${elementId} - Encontrado`);
        } else {
            console.log(`   ❌ ${elementId} - Não encontrado`);
        }
    });
    
    console.log('\n📋 3. Verificando dados globais:');
    
    // Check global data
    if (window.fightersData) {
        console.log(`   ✅ window.fightersData - ${window.fightersData.length} lutadores`);
    } else {
        console.log(`   ❌ window.fightersData - Não definido`);
    }
    
    console.log('\n📋 4. Testando funcionalidades:');
    
    // Test category buttons
    const categoryButtons = document.querySelectorAll('#fightersCategoriesList .list-group-item');
    if (categoryButtons.length > 0) {
        console.log(`   ✅ ${categoryButtons.length} botões de categoria encontrados`);
        
        // Test first category button
        const firstButton = categoryButtons[0];
        const category = firstButton.getAttribute('data-category');
        console.log(`   ✅ Primeira categoria: ${category}`);
    } else {
        console.log(`   ❌ Nenhum botão de categoria encontrado`);
    }
    
    // Test fighter modal
    const fighterModal = document.getElementById('fighterModal');
    if (fighterModal) {
        console.log(`   ✅ Modal de lutador encontrado`);
        
        // Check if modal can be opened
        try {
            const modal = new bootstrap.Modal(fighterModal);
            console.log(`   ✅ Modal pode ser instanciado`);
        } catch (error) {
            console.log(`   ❌ Erro ao instanciar modal: ${error.message}`);
        }
    } else {
        console.log(`   ❌ Modal de lutador não encontrado`);
    }
    
    console.log('\n📋 5. Testando event listeners:');
    
    // Check if event listeners are attached
    const fighterForm = document.getElementById('fighterForm');
    if (fighterForm) {
        console.log(`   ✅ Formulário de lutador encontrado`);
        
        // Check if submit event listener is attached
        const events = getEventListeners(fighterForm);
        if (events && events.submit) {
            console.log(`   ✅ Event listener de submit anexado`);
        } else {
            console.log(`   ❌ Event listener de submit não encontrado`);
        }
    } else {
        console.log(`   ❌ Formulário de lutador não encontrado`);
    }
    
    console.log('\n📋 6. Checklist de verificação:');
    console.log('   [ ] Função handleFighterSubmit definida');
    console.log('   [ ] Função editFighter definida');
    console.log('   [ ] Função deleteFighter definida');
    console.log('   [ ] Modal de lutador funciona');
    console.log('   [ ] Formulário de lutador funciona');
    console.log('   [ ] Menu lateral funciona');
    console.log('   [ ] Filtro por categoria funciona');
    console.log('   [ ] Contadores funcionam');
    console.log('   [ ] Ações de editar/deletar funcionam');
    
    console.log('\n🚀 7. Como testar manualmente:');
    console.log('   1. Acesse: http://localhost:3000');
    console.log('   2. Vá para aba "Lutadores"');
    console.log('   3. Clique em "Novo Lutador"');
    console.log('   4. Preencha os dados e salve');
    console.log('   5. Verifique se aparece na lista');
    console.log('   6. Clique em "Editar" em um lutador');
    console.log('   7. Modifique os dados e salve');
    console.log('   8. Clique em "Deletar" em um lutador');
    console.log('   9. Teste o filtro por categoria');
    
    console.log('\n🎯 8. Problemas possíveis:');
    console.log('   - Funções não definidas');
    console.log('   - Elementos HTML não encontrados');
    console.log('   - Event listeners não anexados');
    console.log('   - Modal não funciona');
    console.log('   - API não responde');
    console.log('   - Dados não carregam');
    
    console.log('\n🔧 9. Logs esperados no console:');
    console.log('   - "handleFighterSubmit called"');
    console.log('   - "editFighter called"');
    console.log('   - "deleteFighter called"');
    console.log('   - "displayFightersByCategory called"');
    console.log('   - "updateCategoryCounts called"');
    
    console.log('\n🎉 Teste das funções de lutadores concluído!');
    console.log('🥊 Verifique se todas as funções estão funcionando!');
}

// Helper function to get event listeners (if available)
function getEventListeners(element) {
    // This is a simplified check - in real browsers you'd need dev tools
    return null;
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testFightersFunctions);
} else {
    testFightersFunctions();
} 