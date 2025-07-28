// Script para forçar a ativação da aba lutadores
console.log('💪 Forçando ativação da aba lutadores...\n');

function forcarAtivarFighters() {
    console.log('1. Verificando elementos...');
    
    const fightersTab = document.getElementById('fighters-tab');
    const fightersPane = document.getElementById('fighters');
    
    if (!fightersTab) {
        console.log('❌ Tab fighters não encontrada');
        return;
    }
    
    if (!fightersPane) {
        console.log('❌ Pane fighters não encontrada');
        return;
    }
    
    console.log('✅ Elementos encontrados');
    
    console.log('\n2. Desativando todas as tabs...');
    
    // Desativar todas as tabs
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        console.log(`   - ${tab.id} desativada`);
    });
    
    // Desativar todas as panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
        console.log(`   - ${pane.id} desativada`);
    });
    
    console.log('\n3. Ativando fighters tab...');
    
    // Ativar fighters tab
    fightersTab.classList.add('active');
    fightersTab.setAttribute('aria-selected', 'true');
    console.log('   ✅ Tab fighters ativada');
    
    // Ativar fighters pane
    fightersPane.classList.add('show', 'active');
    console.log('   ✅ Pane fighters ativada');
    
    console.log('\n4. Verificando resultado...');
    
    setTimeout(() => {
        const activeTab = document.querySelector('.nav-link.active');
        const activePane = document.querySelector('.tab-pane.active');
        
        if (activeTab && activeTab.id === 'fighters-tab') {
            console.log('✅ SUCCESS: Tab fighters está ativa!');
        } else {
            console.log('❌ FAIL: Tab fighters não está ativa');
        }
        
        if (activePane && activePane.id === 'fighters') {
            console.log('✅ SUCCESS: Pane fighters está ativa!');
        } else {
            console.log('❌ FAIL: Pane fighters não está ativa');
        }
        
        console.log('\n5. Carregando lutadores...');
        
        // Tentar carregar lutadores
        if (typeof loadFighters === 'function') {
            loadFighters().then(() => {
                console.log('✅ Lutadores carregados com sucesso');
            }).catch(error => {
                console.log('❌ Erro ao carregar lutadores:', error.message);
            });
        } else {
            console.log('⚠️ Função loadFighters não encontrada');
        }
        
    }, 100);
    
    console.log('\n🎉 Ativação forçada concluída!');
}

// Executar imediatamente
forcarAtivarFighters();

// Também adicionar event listener para cliques futuros
const fightersTab = document.getElementById('fighters-tab');
if (fightersTab) {
    fightersTab.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🎯 Fighters tab clicada - forçando ativação...');
        forcarAtivarFighters();
    });
    console.log('✅ Event listener adicionado para cliques futuros');
}

// Expor função globalmente
window.forcarAtivarFighters = forcarAtivarFighters; 