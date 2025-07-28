// Script para corrigir problemas com a aba lutadores
console.log('🔧 Corrigindo aba lutadores...\n');

function corrigirAbaLutadores() {
    console.log('📋 1. Verificando e corrigindo elementos da aba lutadores:');
    
    // Verificar se a aba lutadores existe
    let fightersTab = document.getElementById('fighters-tab');
    if (!fightersTab) {
        console.log('❌ Tab lutadores não encontrada - criando...');
        // Tentar encontrar o container de tabs
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            const newTab = document.createElement('li');
            newTab.className = 'nav-item';
            newTab.innerHTML = `
                <a class="nav-link" id="fighters-tab" data-bs-toggle="tab" href="#fighters" role="tab">
                    <i class="fas fa-user-friends me-2"></i>Lutadores
                </a>
            `;
            navTabs.appendChild(newTab);
            console.log('✅ Tab lutadores criada');
            fightersTab = document.getElementById('fighters-tab');
        } else {
            console.log('❌ Container de tabs não encontrado');
        }
    } else {
        console.log('✅ Tab lutadores já existe');
    }
    
    // Verificar se a pane lutadores existe
    const fightersPane = document.getElementById('fighters');
    if (!fightersPane) {
        console.log('❌ Pane lutadores não encontrada - criando...');
        // Tentar encontrar o container de panes
        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
            const newPane = document.createElement('div');
            newPane.className = 'tab-pane fade';
            newPane.id = 'fighters';
            newPane.setAttribute('role', 'tabpanel');
            newPane.innerHTML = `
                <div class="mb-4">
                    <h3><i class="fas fa-user-friends me-2"></i>Gerenciar Lutadores</h3>
                </div>
                
                <div class="row">
                    <!-- Sidebar with Categories -->
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-list me-2"></i>Categorias</h5>
                            </div>
                            <div class="card-body p-0">
                                <div class="list-group list-group-flush" id="fightersCategoriesList">
                                    <button class="list-group-item list-group-item-action active" data-category="all">
                                        <i class="fas fa-users me-2"></i>Todos os Lutadores
                                        <span class="badge bg-primary ms-auto" id="all-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Bantamweight">
                                        <i class="fas fa-weight me-2"></i>Bantamweight
                                        <span class="badge bg-secondary ms-auto" id="Bantamweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Featherweight">
                                        <i class="fas fa-weight me-2"></i>Featherweight
                                        <span class="badge bg-secondary ms-auto" id="Featherweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Flyweight">
                                        <i class="fas fa-weight me-2"></i>Flyweight
                                        <span class="badge bg-secondary ms-auto" id="Flyweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Heavyweight">
                                        <i class="fas fa-weight me-2"></i>Heavyweight
                                        <span class="badge bg-secondary ms-auto" id="Heavyweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Light Heavyweight">
                                        <i class="fas fa-weight me-2"></i>Light Heavyweight
                                        <span class="badge bg-secondary ms-auto" id="Light Heavyweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Lightweight">
                                        <i class="fas fa-weight me-2"></i>Lightweight
                                        <span class="badge bg-secondary ms-auto" id="Lightweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Middleweight">
                                        <i class="fas fa-weight me-2"></i>Middleweight
                                        <span class="badge bg-secondary ms-auto" id="Middleweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Welterweight">
                                        <i class="fas fa-weight me-2"></i>Welterweight
                                        <span class="badge bg-secondary ms-auto" id="Welterweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Women's Bantamweight">
                                        <i class="fas fa-venus me-2"></i>Women's Bantamweight
                                        <span class="badge bg-secondary ms-auto" id="Women's Bantamweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Women's Flyweight">
                                        <i class="fas fa-venus me-2"></i>Women's Flyweight
                                        <span class="badge bg-secondary ms-auto" id="Women's Flyweight-count">0</span>
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-category="Women's Strawweight">
                                        <i class="fas fa-venus me-2"></i>Women's Strawweight
                                        <span class="badge bg-secondary ms-auto" id="Women's Strawweight-count">0</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Main Content Area -->
                    <div class="col-md-9">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 id="fightersCategoryTitle">
                                    <i class="fas fa-users me-2"></i>Todos os Lutadores
                                </h5>
                                <button class="btn btn-primary btn-sm" onclick="openFighterModal()">
                                    <i class="fas fa-plus me-2"></i>Novo Lutador
                                </button>
                            </div>
                            <div class="card-body">
                                <div id="fightersList">
                                    <div class="text-center">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <p>Carregando lutadores...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            tabContent.appendChild(newPane);
            console.log('✅ Pane lutadores criada');
        } else {
            console.log('❌ Container de panes não encontrado');
        }
    } else {
        console.log('✅ Pane lutadores já existe');
    }
    
    console.log('\n📋 2. Verificando e corrigindo event listeners:');
    
    // Verificar se os event listeners estão anexados
    if (fightersTab) {
        // Remover event listeners existentes para evitar duplicação
        const newTab = fightersTab.cloneNode(true);
        fightersTab.parentNode.replaceChild(newTab, fightersTab);
        
        // Adicionar novo event listener
        newTab.addEventListener('click', function() {
            console.log('Tab lutadores clicada');
            if (typeof navigateToTab === 'function') {
                navigateToTab('fighters');
            } else if (typeof activateTab === 'function') {
                activateTab('fighters');
            }
        });
        console.log('✅ Event listener da tab lutadores corrigido');
    }
    
    console.log('\n📋 3. Verificando e corrigindo funções:');
    
    // Verificar se as funções necessárias existem
    if (typeof loadFighters !== 'function') {
        console.log('❌ loadFighters não está definida - definindo...');
        window.loadFighters = async function() {
            try {
                const fighters = await apiCall('fighters');
                window.fightersData = fighters;
                if (typeof displayFighters === 'function') {
                    displayFighters(fighters);
                }
                if (typeof populateFighterSelects === 'function') {
                    populateFighterSelects(fighters);
                }
            } catch (error) {
                console.error('Failed to load fighters:', error);
            }
        };
        console.log('✅ loadFighters definida');
    } else {
        console.log('✅ loadFighters já está definida');
    }
    
    if (typeof displayFighters !== 'function') {
        console.log('❌ displayFighters não está definida - definindo...');
        window.displayFighters = function(fighters) {
            window.fightersData = fighters;
            
            if (fighters.length === 0) {
                const fightersList = document.getElementById('fightersList');
                if (fightersList) {
                    fightersList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-user-friends"></i>
                            <p>Nenhum lutador cadastrado.</p>
                            <button class="btn btn-primary" onclick="openFighterModal()">
                                <i class="fas fa-plus me-2"></i>Adicionar Primeiro Lutador
                            </button>
                        </div>
                    `;
                }
                return;
            }
            
            if (typeof updateCategoryCounts === 'function') {
                updateCategoryCounts(fighters);
            }
            if (typeof displayFightersByCategory === 'function') {
                displayFightersByCategory('all', fighters);
            }
            if (typeof addCategoryEventListeners === 'function') {
                addCategoryEventListeners();
            }
        };
        console.log('✅ displayFighters definida');
    } else {
        console.log('✅ displayFighters já está definida');
    }
    
    console.log('\n📋 4. Carregando lutadores:');
    
    // Tentar carregar lutadores
    if (typeof loadFighters === 'function') {
        console.log('   - Chamando loadFighters...');
        loadFighters().then(() => {
            console.log('   ✅ Lutadores carregados com sucesso');
        }).catch(error => {
            console.log('   ❌ Erro ao carregar lutadores:', error.message);
        });
    } else {
        console.log('   ❌ loadFighters não está disponível');
    }
    
    console.log('\n📋 5. Testando navegação:');
    
    // Testar navegação para a aba lutadores
    setTimeout(() => {
        console.log('   - Testando ativação da aba lutadores...');
        if (typeof activateTab === 'function') {
            activateTab('fighters');
            console.log('   ✅ activateTab chamada');
            
            // Verificar se a aba foi ativada
            setTimeout(() => {
                const currentFightersTab = document.getElementById('fighters-tab');
                const fightersPane = document.getElementById('fighters');
                
                if (currentFightersTab && currentFightersTab.classList.contains('active')) {
                    console.log('   ✅ Tab lutadores está ativa');
                } else {
                    console.log('   ❌ Tab lutadores não está ativa');
                }
                
                if (fightersPane && fightersPane.classList.contains('active')) {
                    console.log('   ✅ Pane lutadores está ativa');
                } else {
                    console.log('   ❌ Pane lutadores não está ativa');
                }
            }, 100);
        } else {
            console.log('   ❌ activateTab não está disponível');
        }
    }, 500);
    
    console.log('\n🎉 Correção da aba lutadores concluída!');
    console.log('🚀 Agora teste clicando na aba "Lutadores"');
}

// Executar correção quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', corrigirAbaLutadores);
} else {
    corrigirAbaLutadores();
} 