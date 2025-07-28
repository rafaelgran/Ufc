// Teste simples para verificar problemas com tabs
console.log('🧪 Teste simples de tabs...\n');

// 1. Verificar se os elementos existem
console.log('1. Verificando elementos:');
const fightersTab = document.getElementById('fighters-tab');
const fightersPane = document.getElementById('fighters');

console.log('   - fighters-tab:', fightersTab ? '✅ Existe' : '❌ Não existe');
console.log('   - fighters pane:', fightersPane ? '✅ Existe' : '❌ Não existe');

if (fightersTab) {
    console.log('   - fighters-tab classes:', fightersTab.className);
    console.log('   - fighters-tab onclick:', fightersTab.onclick);
}

if (fightersPane) {
    console.log('   - fighters pane classes:', fightersPane.className);
}

// 2. Verificar estado atual
console.log('\n2. Estado atual:');
const activeTab = document.querySelector('.nav-link.active');
const activePane = document.querySelector('.tab-pane.active');

console.log('   - Tab ativa:', activeTab ? activeTab.id : 'Nenhuma');
console.log('   - Pane ativa:', activePane ? activePane.id : 'Nenhuma');

// 3. Tentar ativar a tab fighters manualmente
console.log('\n3. Tentando ativar fighters tab...');

if (fightersTab && fightersPane) {
    // Remover active de todas as tabs
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    // Remover active de todas as panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });
    
    // Ativar fighters tab
    fightersTab.classList.add('active');
    fightersTab.setAttribute('aria-selected', 'true');
    
    // Ativar fighters pane
    fightersPane.classList.add('show', 'active');
    
    console.log('   ✅ Tab fighters ativada manualmente');
    
    // Verificar se funcionou
    setTimeout(() => {
        console.log('\n4. Verificando resultado:');
        const newActiveTab = document.querySelector('.nav-link.active');
        const newActivePane = document.querySelector('.tab-pane.active');
        
        console.log('   - Tab ativa agora:', newActiveTab ? newActiveTab.id : 'Nenhuma');
        console.log('   - Pane ativa agora:', newActivePane ? newActivePane.id : 'Nenhuma');
        
        if (newActiveTab && newActiveTab.id === 'fighters-tab') {
            console.log('   ✅ SUCCESS: Tab fighters está ativa!');
        } else {
            console.log('   ❌ FAIL: Tab fighters não está ativa');
        }
        
        if (newActivePane && newActivePane.id === 'fighters') {
            console.log('   ✅ SUCCESS: Pane fighters está ativa!');
        } else {
            console.log('   ❌ FAIL: Pane fighters não está ativa');
        }
    }, 100);
} else {
    console.log('   ❌ Elementos não encontrados');
}

// 4. Verificar se há event listeners
console.log('\n5. Verificando event listeners:');
if (fightersTab) {
    // Tentar adicionar um event listener simples
    fightersTab.addEventListener('click', function() {
        console.log('🎯 Fighters tab foi clicada!');
        alert('Fighters tab funcionando!');
    });
    console.log('   ✅ Event listener adicionado ao fighters tab');
}

// 5. Verificar se Bootstrap está funcionando
console.log('\n6. Verificando Bootstrap:');
if (typeof bootstrap !== 'undefined') {
    console.log('   ✅ Bootstrap está carregado');
    
    // Tentar usar Bootstrap Tab
    try {
        const tab = new bootstrap.Tab(fightersTab);
        console.log('   ✅ Bootstrap Tab criado');
    } catch (error) {
        console.log('   ❌ Erro ao criar Bootstrap Tab:', error.message);
    }
} else {
    console.log('   ❌ Bootstrap não está carregado');
}

console.log('\n🎉 Teste concluído!');
console.log('💡 Dica: Clique na tab "Lutadores" para testar se funciona agora'); 