// Test script for fighters tab functionality
console.log('🥊 Testando aba lutadores...\n');

function testFightersTab() {
    console.log('📋 1. Verificando elementos da aba lutadores:');
    
    // Check if fighters tab exists
    const fightersTab = document.getElementById('fighters-tab');
    if (fightersTab) {
        console.log('✅ Tab lutadores encontrada');
        console.log(`   - Texto: ${fightersTab.textContent}`);
        console.log(`   - Classes: ${fightersTab.className}`);
    } else {
        console.log('❌ Tab lutadores NÃO encontrada');
    }
    
    // Check if fighters tab pane exists
    const fightersTabPane = document.getElementById('fighters');
    if (fightersTabPane) {
        console.log('✅ Pane lutadores encontrada');
        console.log(`   - Classes: ${fightersTabPane.className}`);
    } else {
        console.log('❌ Pane lutadores NÃO encontrada');
    }
    
    console.log('\n📋 2. Verificando elementos internos da aba lutadores:');
    
    // Check sidebar elements
    const fightersCategoriesList = document.getElementById('fightersCategoriesList');
    if (fightersCategoriesList) {
        console.log('✅ Lista de categorias encontrada');
        const categoryButtons = fightersCategoriesList.querySelectorAll('.list-group-item');
        console.log(`   - Botões de categoria: ${categoryButtons.length}`);
        
        categoryButtons.forEach((button, index) => {
            const category = button.getAttribute('data-category');
            const text = button.textContent.trim();
            console.log(`   - Botão ${index + 1}: ${category} - "${text}"`);
        });
    } else {
        console.log('❌ Lista de categorias NÃO encontrada');
    }
    
    // Check fighters list container
    const fightersList = document.getElementById('fightersList');
    if (fightersList) {
        console.log('✅ Container de lista de lutadores encontrado');
        console.log(`   - Conteúdo atual: ${fightersList.innerHTML.substring(0, 100)}...`);
    } else {
        console.log('❌ Container de lista de lutadores NÃO encontrado');
    }
    
    // Check category title
    const fightersCategoryTitle = document.getElementById('fightersCategoryTitle');
    if (fightersCategoryTitle) {
        console.log('✅ Título de categoria encontrado');
        console.log(`   - Texto: ${fightersCategoryTitle.textContent}`);
    } else {
        console.log('❌ Título de categoria NÃO encontrado');
    }
    
    console.log('\n📋 3. Verificando dados de lutadores:');
    
    // Check if fighters data exists
    if (typeof window.fightersData !== 'undefined' && window.fightersData) {
        console.log(`✅ Dados de lutadores encontrados: ${window.fightersData.length} lutadores`);
        
        if (window.fightersData.length > 0) {
            console.log('   - Primeiro lutador:');
            const firstFighter = window.fightersData[0];
            console.log(`     * ID: ${firstFighter.id}`);
            console.log(`     * Nome: ${firstFighter.name}`);
            console.log(`     * Categoria: ${firstFighter.weightclass || firstFighter.weightClass}`);
            console.log(`     * País: ${firstFighter.country}`);
        }
    } else {
        console.log('❌ Dados de lutadores NÃO encontrados');
    }
    
    console.log('\n📋 4. Verificando funções de lutadores:');
    
    // Check if functions exist
    if (typeof loadFighters === 'function') {
        console.log('✅ loadFighters está definida');
    } else {
        console.log('❌ loadFighters NÃO está definida');
    }
    
    if (typeof displayFighters === 'function') {
        console.log('✅ displayFighters está definida');
    } else {
        console.log('❌ displayFighters NÃO está definida');
    }
    
    if (typeof displayFightersByCategory === 'function') {
        console.log('✅ displayFightersByCategory está definida');
    } else {
        console.log('❌ displayFightersByCategory NÃO está definida');
    }
    
    if (typeof updateCategoryCounts === 'function') {
        console.log('✅ updateCategoryCounts está definida');
    } else {
        console.log('❌ updateCategoryCounts NÃO está definida');
    }
    
    if (typeof addCategoryEventListeners === 'function') {
        console.log('✅ addCategoryEventListeners está definida');
    } else {
        console.log('❌ addCategoryEventListeners NÃO está definida');
    }
    
    console.log('\n📋 5. Verificando event listeners:');
    
    // Check if tab click listener is working
    if (fightersTab) {
        const listeners = getEventListeners(fightersTab);
        if (listeners.click && listeners.click.length > 0) {
            console.log('✅ Event listener de click está anexado ao tab');
        } else {
            console.log('❌ Event listener de click NÃO está anexado ao tab');
        }
    }
    
    // Check if category buttons have listeners
    if (fightersCategoriesList) {
        const categoryButtons = fightersCategoriesList.querySelectorAll('.list-group-item');
        if (categoryButtons.length > 0) {
            const firstButton = categoryButtons[0];
            const listeners = getEventListeners(firstButton);
            if (listeners.click && listeners.click.length > 0) {
                console.log('✅ Event listeners de categoria estão anexados');
            } else {
                console.log('❌ Event listeners de categoria NÃO estão anexados');
            }
        }
    }
    
    console.log('\n📋 6. Testando navegação para aba lutadores:');
    
    // Test tab activation
    try {
        console.log('   - Tentando ativar aba lutadores...');
        if (typeof activateTab === 'function') {
            activateTab('fighters');
            console.log('   ✅ activateTab chamada com sucesso');
            
            // Check if tab is now active
            setTimeout(() => {
                if (fightersTab && fightersTab.classList.contains('active')) {
                    console.log('   ✅ Tab lutadores está ativa');
                } else {
                    console.log('   ❌ Tab lutadores NÃO está ativa');
                }
                
                if (fightersTabPane && fightersTabPane.classList.contains('active')) {
                    console.log('   ✅ Pane lutadores está ativa');
                } else {
                    console.log('   ❌ Pane lutadores NÃO está ativa');
                }
            }, 100);
        } else {
            console.log('   ❌ activateTab NÃO está definida');
        }
    } catch (error) {
        console.log('   ❌ Erro ao ativar aba lutadores:', error.message);
    }
    
    console.log('\n📋 7. Testando carregamento de lutadores:');
    
    // Test loading fighters
    try {
        console.log('   - Tentando carregar lutadores...');
        if (typeof loadFighters === 'function') {
            loadFighters().then(() => {
                console.log('   ✅ loadFighters executada com sucesso');
                
                // Check if data was loaded
                if (window.fightersData && window.fightersData.length > 0) {
                    console.log(`   ✅ ${window.fightersData.length} lutadores carregados`);
                } else {
                    console.log('   ⚠️ Nenhum lutador carregado');
                }
            }).catch(error => {
                console.log('   ❌ Erro ao carregar lutadores:', error.message);
            });
        } else {
            console.log('   ❌ loadFighters NÃO está definida');
        }
    } catch (error) {
        console.log('   ❌ Erro ao chamar loadFighters:', error.message);
    }
    
    console.log('\n📋 8. Verificando estado atual da aba:');
    
    // Check current tab state
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        console.log(`   - Aba ativa atual: ${activeTab.textContent.trim()}`);
    } else {
        console.log('   - Nenhuma aba ativa');
    }
    
    const activePane = document.querySelector('.tab-pane.active');
    if (activePane) {
        console.log(`   - Pane ativa atual: ${activePane.id}`);
    } else {
        console.log('   - Nenhuma pane ativa');
    }
    
    console.log('\n🚀 9. Como testar manualmente:');
    console.log('   1. Acesse: http://localhost:3000');
    console.log('   2. Clique na aba "Lutadores"');
    console.log('   3. Verifique se a aba fica ativa');
    console.log('   4. Verifique se os lutadores são carregados');
    console.log('   5. Verifique se o menu lateral aparece');
    console.log('   6. Teste clicar nas categorias do menu');
    console.log('   7. Teste adicionar um novo lutador');
    
    console.log('\n🎯 10. Problemas comuns e soluções:');
    console.log('   ❌ Erro: "Tab lutadores não encontrada"');
    console.log('   ✅ Solução: Verificar se HTML está correto');
    console.log('   ❌ Erro: "Dados de lutadores não carregados"');
    console.log('   ✅ Solução: Verificar se loadFighters está sendo chamada');
    console.log('   ❌ Erro: "Event listeners não anexados"');
    console.log('   ✅ Solução: Verificar se addCategoryEventListeners está sendo chamada');
    console.log('   ❌ Erro: "Funções não definidas"');
    console.log('   ✅ Solução: Verificar se código JavaScript está carregado');
    
    console.log('\n🎉 Teste da aba lutadores concluído!');
}

// Helper function to get event listeners (if available)
function getEventListeners(element) {
    const listeners = {};
    try {
        // This is a simplified version - in real browsers you'd need devtools
        listeners.click = element.onclick ? [element.onclick] : [];
        listeners.submit = element.onsubmit ? [element.onsubmit] : [];
        listeners.change = element.onchange ? [element.onchange] : [];
    } catch (error) {
        console.log('   - Não foi possível verificar event listeners');
    }
    return listeners;
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testFightersTab);
} else {
    testFightersTab();
} 