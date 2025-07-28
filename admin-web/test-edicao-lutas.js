// Test script for fight editing functionality
console.log('🥊 Testando funcionalidade de edição de lutas...\n');

function testFightEditing() {
    console.log('📋 1. Verificando se selectedEvent está definido:');
    
    // Check if selectedEvent exists
    if (typeof selectedEvent !== 'undefined' && selectedEvent !== null) {
        console.log('✅ selectedEvent está definido');
        console.log(`   - ID: ${selectedEvent.id}`);
        console.log(`   - Nome: ${selectedEvent.name}`);
    } else {
        console.log('❌ selectedEvent NÃO está definido');
        console.log('   - Isso pode causar erros ao editar lutas');
    }
    
    console.log('\n📋 2. Verificando elementos do formulário de luta:');
    
    // Check fight form elements
    const fightForm = document.getElementById('fightForm');
    if (fightForm) {
        console.log('✅ Formulário de luta encontrado');
    } else {
        console.log('❌ Formulário de luta NÃO encontrado');
    }
    
    const fightId = document.getElementById('fightId');
    if (fightId) {
        console.log('✅ Campo fightId encontrado');
    } else {
        console.log('❌ Campo fightId NÃO encontrado');
    }
    
    const fightWeightClass = document.getElementById('fightWeightClass');
    if (fightWeightClass) {
        console.log('✅ Campo weightClass encontrado');
    } else {
        console.log('❌ Campo weightClass NÃO encontrado');
    }
    
    const fighter1 = document.getElementById('fighter1');
    if (fighter1) {
        console.log('✅ Campo fighter1 encontrado');
    } else {
        console.log('❌ Campo fighter1 NÃO encontrado');
    }
    
    const fighter2 = document.getElementById('fighter2');
    if (fighter2) {
        console.log('✅ Campo fighter2 encontrado');
    } else {
        console.log('❌ Campo fighter2 NÃO encontrado');
    }
    
    const fightType = document.getElementById('fightType');
    if (fightType) {
        console.log('✅ Campo fightType encontrado');
    } else {
        console.log('❌ Campo fightType NÃO encontrado');
    }
    
    const fightRounds = document.getElementById('fightRounds');
    if (fightRounds) {
        console.log('✅ Campo fightRounds encontrado');
    } else {
        console.log('❌ Campo fightRounds NÃO encontrado');
    }
    
    console.log('\n📋 3. Verificando funções de luta:');
    
    // Check if functions exist
    if (typeof handleFightSubmit === 'function') {
        console.log('✅ handleFightSubmit está definida');
    } else {
        console.log('❌ handleFightSubmit NÃO está definida');
    }
    
    if (typeof editFight === 'function') {
        console.log('✅ editFight está definida');
    } else {
        console.log('❌ editFight NÃO está definida');
    }
    
    if (typeof deleteFight === 'function') {
        console.log('✅ deleteFight está definida');
    } else {
        console.log('❌ deleteFight NÃO está definida');
    }
    
    if (typeof filterFightersByWeightClass === 'function') {
        console.log('✅ filterFightersByWeightClass está definida');
    } else {
        console.log('❌ filterFightersByWeightClass NÃO está definida');
    }
    
    console.log('\n📋 4. Verificando dados de lutas:');
    
    // Check if fights data exists
    if (typeof window.fightsData !== 'undefined' && window.fightsData) {
        console.log(`✅ Dados de lutas encontrados: ${window.fightsData.length} lutas`);
        
        if (window.fightsData.length > 0) {
            console.log('   - Primeira luta:');
            console.log(`     * ID: ${window.fightsData[0].id}`);
            console.log(`     * Event ID: ${window.fightsData[0].eventid || window.fightsData[0].eventId}`);
            console.log(`     * Weight Class: ${window.fightsData[0].weightclass || window.fightsData[0].weightClass}`);
            console.log(`     * Fighter 1: ${window.fightsData[0].fighter1id || window.fightsData[0].fighter1Id}`);
            console.log(`     * Fighter 2: ${window.fightsData[0].fighter2id || window.fightsData[0].fighter2Id}`);
        }
    } else {
        console.log('❌ Dados de lutas NÃO encontrados');
    }
    
    console.log('\n📋 5. Verificando dados de lutadores:');
    
    // Check if fighters data exists
    if (typeof window.fightersData !== 'undefined' && window.fightersData) {
        console.log(`✅ Dados de lutadores encontrados: ${window.fightersData.length} lutadores`);
    } else {
        console.log('❌ Dados de lutadores NÃO encontrados');
    }
    
    console.log('\n📋 6. Testando simulação de edição:');
    
    // Simulate editing a fight
    if (window.fightsData && window.fightsData.length > 0) {
        const testFight = window.fightsData[0];
        console.log(`   - Simulando edição da luta ID: ${testFight.id}`);
        
        // Check if we can populate the form
        if (fightId) {
            fightId.value = testFight.id;
            console.log(`   ✅ fightId preenchido: ${fightId.value}`);
        }
        
        if (fightWeightClass) {
            fightWeightClass.value = testFight.weightclass || testFight.weightClass || '';
            console.log(`   ✅ weightClass preenchido: ${fightWeightClass.value}`);
        }
        
        if (fightType) {
            fightType.value = testFight.fighttype || testFight.fightType || '';
            console.log(`   ✅ fightType preenchido: ${fightType.value}`);
        }
        
        if (fightRounds) {
            fightRounds.value = testFight.rounds || 3;
            console.log(`   ✅ rounds preenchido: ${fightRounds.value}`);
        }
        
        console.log('   - Formulário preenchido com sucesso!');
    } else {
        console.log('   - Nenhuma luta disponível para teste');
    }
    
    console.log('\n📋 7. Verificando event listeners:');
    
    // Check if event listeners are attached
    if (fightForm) {
        const listeners = getEventListeners(fightForm);
        if (listeners.submit && listeners.submit.length > 0) {
            console.log('✅ Event listener de submit está anexado ao formulário');
        } else {
            console.log('❌ Event listener de submit NÃO está anexado ao formulário');
        }
    }
    
    if (fightWeightClass) {
        const listeners = getEventListeners(fightWeightClass);
        if (listeners.change && listeners.change.length > 0) {
            console.log('✅ Event listener de change está anexado ao weightClass');
        } else {
            console.log('❌ Event listener de change NÃO está anexado ao weightClass');
        }
    }
    
    console.log('\n🚀 8. Como testar manualmente:');
    console.log('   1. Acesse: http://localhost:3000');
    console.log('   2. Selecione um evento');
    console.log('   3. Vá para a aba de detalhes do evento');
    console.log('   4. Clique em "Editar" em uma luta');
    console.log('   5. Verifique se os campos são preenchidos');
    console.log('   6. Modifique algum campo');
    console.log('   7. Clique em "Salvar"');
    console.log('   8. Verifique se a luta foi atualizada');
    
    console.log('\n🎯 9. Problemas comuns e soluções:');
    console.log('   ❌ Erro: "Cannot read properties of null (reading \'id\')"');
    console.log('   ✅ Solução: Verificar se selectedEvent está definido');
    console.log('   ❌ Erro: "Cannot read properties of null (reading \'addEventListener\')"');
    console.log('   ✅ Solução: Verificar se elementos existem antes de adicionar listeners');
    console.log('   ❌ Erro: "handleFightSubmit is not defined"');
    console.log('   ✅ Solução: Verificar se função foi restaurada no código');
    
    console.log('\n🎉 Teste de edição de lutas concluído!');
}

// Helper function to get event listeners (if available)
function getEventListeners(element) {
    const listeners = {};
    try {
        // This is a simplified version - in real browsers you'd need devtools
        listeners.submit = element.onsubmit ? [element.onsubmit] : [];
        listeners.change = element.onchange ? [element.onchange] : [];
    } catch (error) {
        console.log('   - Não foi possível verificar event listeners');
    }
    return listeners;
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testFightEditing);
} else {
    testFightEditing();
} 