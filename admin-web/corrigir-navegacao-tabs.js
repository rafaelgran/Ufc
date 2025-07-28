// Script para corrigir problemas de navegação de tabs
console.log('🔧 Corrigindo navegação de tabs...\n');

function corrigirNavegacaoTabs() {
    console.log('📋 1. Verificando estrutura de tabs:');
    
    // Verificar se as tabs existem
    const eventsTab = document.getElementById('events-tab');
    const fightersTab = document.getElementById('fighters-tab');
    const liveTab = document.getElementById('live-tab');
    
    console.log('   - Events tab:', eventsTab ? '✅ Encontrada' : '❌ Não encontrada');
    console.log('   - Fighters tab:', fightersTab ? '✅ Encontrada' : '❌ Não encontrada');
    console.log('   - Live tab:', liveTab ? '✅ Encontrada' : '❌ Não encontrada');
    
    // Verificar se as panes existem
    const eventsPane = document.getElementById('events');
    const fightersPane = document.getElementById('fighters');
    const livePane = document.getElementById('live');
    
    console.log('   - Events pane:', eventsPane ? '✅ Encontrada' : '❌ Não encontrada');
    console.log('   - Fighters pane:', fightersPane ? '✅ Encontrada' : '❌ Não encontrada');
    console.log('   - Live pane:', livePane ? '✅ Encontrada' : '❌ Não encontrada');
    
    console.log('\n📋 2. Verificando sistema de navegação:');
    
    // Verificar se as funções de navegação existem
    console.log('   - activateTab:', typeof activateTab === 'function' ? '✅ Existe' : '❌ Não existe');
    console.log('   - navigateToTab:', typeof navigateToTab === 'function' ? '✅ Existe' : '❌ Não existe');
    
    // Verificar se TAB_ANCHORS existe
    console.log('   - TAB_ANCHORS:', typeof TAB_ANCHORS !== 'undefined' ? '✅ Existe' : '❌ Não existe');
    if (typeof TAB_ANCHORS !== 'undefined') {
        console.log('     Conteúdo:', TAB_ANCHORS);
    }
    
    console.log('\n📋 3. Corrigindo event listeners das tabs:');
    
    // Remover todos os event listeners existentes das tabs
    [eventsTab, fightersTab, liveTab].forEach(tab => {
        if (tab) {
            // Clonar o elemento para remover event listeners
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            console.log(`   ✅ ${newTab.id} - Event listeners removidos`);
        }
    });
    
    // Adicionar novos event listeners
    const newEventsTab = document.getElementById('events-tab');
    const newFightersTab = document.getElementById('fighters-tab');
    const newLiveTab = document.getElementById('live-tab');
    
    if (newEventsTab) {
        newEventsTab.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Events tab clicada');
            if (typeof navigateToTab === 'function') {
                navigateToTab('events');
            } else if (typeof activateTab === 'function') {
                activateTab('events');
            } else {
                // Fallback manual
                ativarTabManual('events');
            }
        });
        console.log('   ✅ Event listener adicionado ao events tab');
    }
    
    if (newFightersTab) {
        newFightersTab.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Fighters tab clicada');
            if (typeof navigateToTab === 'function') {
                navigateToTab('fighters');
            } else if (typeof activateTab === 'function') {
                activateTab('fighters');
            } else {
                // Fallback manual
                ativarTabManual('fighters');
            }
        });
        console.log('   ✅ Event listener adicionado ao fighters tab');
    }
    
    if (newLiveTab) {
        newLiveTab.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Live tab clicada');
            if (typeof navigateToTab === 'function') {
                navigateToTab('live');
            } else if (typeof activateTab === 'function') {
                activateTab('live');
            } else {
                // Fallback manual
                ativarTabManual('live');
            }
        });
        console.log('   ✅ Event listener adicionado ao live tab');
    }
    
    console.log('\n📋 4. Criando função de fallback:');
    
    // Criar função de fallback se não existir
    if (typeof ativarTabManual !== 'function') {
        window.ativarTabManual = function(tabId) {
            console.log(`Ativando tab manualmente: ${tabId}`);
            
            // Desativar todas as tabs
            const allTabs = document.querySelectorAll('.nav-link');
            const allPanes = document.querySelectorAll('.tab-pane');
            
            allTabs.forEach(tab => {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            });
            
            allPanes.forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Ativar a tab selecionada
            const targetTab = document.getElementById(`${tabId}-tab`);
            const targetPane = document.getElementById(tabId);
            
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.setAttribute('aria-selected', 'true');
                console.log(`   ✅ Tab ${tabId} ativada`);
            }
            
            if (targetPane) {
                targetPane.classList.add('show', 'active');
                console.log(`   ✅ Pane ${tabId} ativada`);
            }
            
            // Atualizar URL
            window.location.hash = tabId;
            
            // Carregar dados específicos da tab
            if (tabId === 'fighters' && typeof loadFighters === 'function') {
                loadFighters();
            }
        };
        console.log('   ✅ Função ativarTabManual criada');
    } else {
        console.log('   ✅ Função ativarTabManual já existe');
    }
    
    console.log('\n📋 5. Testando navegação:');
    
    // Testar navegação para cada tab
    setTimeout(() => {
        console.log('   - Testando navegação para fighters...');
        if (typeof ativarTabManual === 'function') {
            ativarTabManual('fighters');
            
            setTimeout(() => {
                const fightersTab = document.getElementById('fighters-tab');
                const fightersPane = document.getElementById('fighters');
                
                if (fightersTab && fightersTab.classList.contains('active')) {
                    console.log('   ✅ Tab fighters está ativa');
                } else {
                    console.log('   ❌ Tab fighters não está ativa');
                }
                
                if (fightersPane && fightersPane.classList.contains('active')) {
                    console.log('   ✅ Pane fighters está ativa');
                } else {
                    console.log('   ❌ Pane fighters não está ativa');
                }
                
                // Verificar se os lutadores foram carregados
                if (typeof window.fightersData !== 'undefined') {
                    console.log(`   ✅ Dados de lutadores carregados: ${window.fightersData.length} lutadores`);
                } else {
                    console.log('   ⚠️ Dados de lutadores não carregados');
                }
            }, 100);
        }
    }, 500);
    
    console.log('\n📋 6. Verificando Bootstrap:');
    
    // Verificar se Bootstrap está carregado
    if (typeof bootstrap !== 'undefined') {
        console.log('   ✅ Bootstrap está carregado');
        
        // Tentar usar Bootstrap para ativar tabs
        try {
            const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
            console.log(`   - Encontrados ${tabElements.length} elementos com data-bs-toggle="tab"`);
            
            tabElements.forEach(tab => {
                const tabId = tab.getAttribute('href') || tab.getAttribute('data-bs-target');
                console.log(`     - ${tabId}`);
            });
        } catch (error) {
            console.log('   ❌ Erro ao verificar elementos Bootstrap:', error.message);
        }
    } else {
        console.log('   ❌ Bootstrap não está carregado');
    }
    
    console.log('\n🎉 Correção de navegação concluída!');
    console.log('🚀 Agora teste clicando nas tabs');
}

// Função para testar navegação manual
function testarNavegacao() {
    console.log('\n🧪 Testando navegação manual...');
    
    const tabs = ['events', 'fighters', 'live'];
    
    tabs.forEach((tabId, index) => {
        setTimeout(() => {
            console.log(`\n   - Testando ${tabId}...`);
            if (typeof ativarTabManual === 'function') {
                ativarTabManual(tabId);
                
                setTimeout(() => {
                    const tab = document.getElementById(`${tabId}-tab`);
                    const pane = document.getElementById(tabId);
                    
                    if (tab && tab.classList.contains('active')) {
                        console.log(`   ✅ ${tabId} tab ativa`);
                    } else {
                        console.log(`   ❌ ${tabId} tab não ativa`);
                    }
                    
                    if (pane && pane.classList.contains('active')) {
                        console.log(`   ✅ ${tabId} pane ativa`);
                    } else {
                        console.log(`   ❌ ${tabId} pane não ativa`);
                    }
                }, 100);
            }
        }, index * 1000);
    });
}

// Executar correção quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', corrigirNavegacaoTabs);
} else {
    corrigirNavegacaoTabs();
}

// Expor função de teste globalmente
window.testarNavegacao = testarNavegacao; 