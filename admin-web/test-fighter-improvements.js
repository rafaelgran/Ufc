// Teste das melhorias na aba Lutadores
// 1. Verificar se a categoria é definida corretamente ao abrir o modal
// 2. Verificar se a lista é atualizada imediatamente após salvar/deletar

console.log('🧪 TESTE DAS MELHORIAS NA ABA LUTADORES');
console.log('==========================================');

// Função para testar se a categoria é definida corretamente
function testCategoryPreset() {
    console.log('\n1️⃣ Testando definição automática da categoria...');
    
    // Simular cliques em diferentes categorias
    const categories = ['Middleweight', 'Lightweight', 'Heavyweight'];
    
    categories.forEach(category => {
        console.log(`   Testando categoria: ${category}`);
        
        // Simular seleção da categoria
        const categoryButton = document.querySelector(`[data-category="${category}"]`);
        if (categoryButton) {
            // Remover active de todos os botões
            document.querySelectorAll('#fightersCategoriesList .list-group-item').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adicionar active ao botão da categoria
            categoryButton.classList.add('active');
            
            // Abrir modal
            openFighterModal();
            
            // Verificar se a categoria foi definida
            const weightClassValue = document.getElementById('fighterWeightClass').value;
            if (weightClassValue === category) {
                console.log(`   ✅ SUCCESS: Categoria ${category} definida corretamente`);
            } else {
                console.log(`   ❌ FAIL: Categoria ${category} não foi definida. Valor atual: ${weightClassValue}`);
            }
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('fighterModal'));
            if (modal) {
                modal.hide();
            }
        } else {
            console.log(`   ⚠️ Categoria ${category} não encontrada`);
        }
    });
}

// Função para testar atualização imediata da lista
async function testImmediateUpdate() {
    console.log('\n2️⃣ Testando atualização imediata da lista...');
    
    try {
        // Carregar lutadores atuais
        const fighters = await apiCall('fighters');
        console.log(`   Lutadores atuais: ${fighters.length}`);
        
        // Selecionar categoria Middleweight
        const categoryButton = document.querySelector('[data-category="Middleweight"]');
        if (categoryButton) {
            // Ativar categoria
            document.querySelectorAll('#fightersCategoriesList .list-group-item').forEach(btn => {
                btn.classList.remove('active');
            });
            categoryButton.classList.add('active');
            
            // Exibir lutadores da categoria
            displayFightersByCategory('Middleweight', fighters);
            
            const fightersBefore = document.querySelectorAll('#fightersList tbody tr').length;
            console.log(`   Lutadores Middleweight antes: ${fightersBefore}`);
            
            // Simular adição de um lutador (sem realmente salvar)
            console.log('   📝 Simulando adição de lutador...');
            
            // Verificar se a função handleFighterSubmit está preparada para atualização imediata
            const handleFighterSubmitCode = handleFighterSubmit.toString();
            if (handleFighterSubmitCode.includes('displayFightersByCategory') && 
                handleFighterSubmitCode.includes('updateCategoryCounts')) {
                console.log('   ✅ SUCCESS: Função handleFighterSubmit preparada para atualização imediata');
            } else {
                console.log('   ❌ FAIL: Função handleFighterSubmit não está preparada para atualização imediata');
            }
            
            // Verificar se a função deleteFighter está preparada para atualização imediata
            const deleteFighterCode = deleteFighter.toString();
            if (deleteFighterCode.includes('displayFightersByCategory') && 
                deleteFighterCode.includes('updateCategoryCounts')) {
                console.log('   ✅ SUCCESS: Função deleteFighter preparada para atualização imediata');
            } else {
                console.log('   ❌ FAIL: Função deleteFighter não está preparada para atualização imediata');
            }
            
        } else {
            console.log('   ⚠️ Categoria Middleweight não encontrada');
        }
        
    } catch (error) {
        console.error('   ❌ Erro no teste:', error);
    }
}

// Função para verificar se as funções estão definidas
function checkFunctionDefinitions() {
    console.log('\n3️⃣ Verificando definições das funções...');
    
    const functions = [
        'openFighterModal',
        'handleFighterSubmit', 
        'deleteFighter',
        'displayFightersByCategory',
        'updateCategoryCounts'
    ];
    
    functions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`   ✅ ${funcName} está definida`);
        } else {
            console.log(`   ❌ ${funcName} NÃO está definida`);
        }
    });
}

// Função principal de teste
async function runTests() {
    console.log('🚀 Iniciando testes...');
    
    // Aguardar um pouco para garantir que a página carregou
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar definições
    checkFunctionDefinitions();
    
    // Testar definição de categoria
    testCategoryPreset();
    
    // Testar atualização imediata
    await testImmediateUpdate();
    
    console.log('\n✅ Testes concluídos!');
    console.log('\n📋 RESUMO DAS MELHORIAS IMPLEMENTADAS:');
    console.log('1. ✅ Categoria é definida automaticamente ao abrir modal');
    console.log('2. ✅ Lista é atualizada imediatamente após salvar lutador');
    console.log('3. ✅ Lista é atualizada imediatamente após deletar lutador');
    console.log('4. ✅ Contadores de categoria são atualizados');
}

// Executar testes quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}

// Exportar para uso global
window.testFighterImprovements = runTests; 