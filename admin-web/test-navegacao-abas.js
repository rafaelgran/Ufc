// Test script for tab navigation
console.log('🧪 Testando navegação entre abas...\n');

// Simulate tab clicks
function testTabNavigation() {
    console.log('📋 1. Testando navegação entre abas:');
    
    const tabs = ['events', 'fighters', 'live'];
    
    tabs.forEach(tabId => {
        console.log(`\n🔍 Testando aba: ${tabId}`);
        
        // Simulate tab button click
        const tabButton = document.getElementById(`${tabId}-tab`);
        if (tabButton) {
            console.log(`✅ Botão encontrado: ${tabId}-tab`);
            
            // Check if click listener is attached
            const clickListeners = tabButton.onclick;
            if (clickListeners) {
                console.log(`✅ Click listener encontrado para ${tabId}`);
            } else {
                console.log(`⚠️ Click listener não encontrado para ${tabId}`);
            }
            
            // Check tab pane
            const tabPane = document.getElementById(tabId);
            if (tabPane) {
                console.log(`✅ Painel encontrado: ${tabId}`);
                
                // Check classes
                const hasShow = tabPane.classList.contains('show');
                const hasActive = tabPane.classList.contains('active');
                console.log(`   - Classe 'show': ${hasShow}`);
                console.log(`   - Classe 'active': ${hasActive}`);
            } else {
                console.log(`❌ Painel não encontrado: ${tabId}`);
            }
            
        } else {
            console.log(`❌ Botão não encontrado: ${tabId}-tab`);
        }
    });
    
    console.log('\n📋 2. Testando URLs de navegação:');
    const testUrls = [
        'http://localhost:3000/#events',
        'http://localhost:3000/#fighters', 
        'http://localhost:3000/#live'
    ];
    
    testUrls.forEach(url => {
        console.log(`   - ${url}`);
    });
    
    console.log('\n📋 3. Testando URLs de eventos:');
    const eventUrls = [
        'http://localhost:3000/#event-18',
        'http://localhost:3000/#event-8',
        'http://localhost:3000/#event-9'
    ];
    
    eventUrls.forEach(url => {
        console.log(`   - ${url}`);
    });
    
    console.log('\n📋 4. Checklist de verificação:');
    console.log('   [ ] Clique em "Eventos" navega para aba eventos');
    console.log('   [ ] Clique em "Lutadores" navega para aba lutadores');
    console.log('   [ ] Clique em "Controle ao Vivo" navega para aba live');
    console.log('   [ ] URL muda corretamente');
    console.log('   [ ] Aba ativa é destacada');
    console.log('   [ ] Conteúdo da aba é exibido');
    console.log('   [ ] Navegação direta por URL funciona');
    
    console.log('\n🚀 5. Como testar manualmente:');
    console.log('   1. Acesse: http://localhost:3000');
    console.log('   2. Clique em "Lutadores"');
    console.log('   3. Verifique se navega para aba lutadores');
    console.log('   4. Verifique se URL muda para #fighters');
    console.log('   5. Teste outras abas');
    console.log('   6. Teste navegação direta por URL');
    
    console.log('\n🎯 6. Problemas possíveis:');
    console.log('   - Click listeners não anexados');
    console.log('   - Conflito no hashchange event');
    console.log('   - activateTab não funcionando');
    console.log('   - Elementos DOM não encontrados');
    console.log('   - Classes CSS não aplicadas');
    
    console.log('\n🔧 7. Logs esperados no console:');
    console.log('   - "Tab clicked: fighters"');
    console.log('   - "Navigating to tab: fighters"');
    console.log('   - "Activating tab: fighters"');
    console.log('   - "Activated tab button: fighters"');
    console.log('   - "Activated tab pane: fighters"');
    
    console.log('\n🎉 Teste de navegação entre abas concluído!');
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testTabNavigation);
} else {
    testTabNavigation();
} 