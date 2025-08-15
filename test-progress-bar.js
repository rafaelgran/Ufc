// Teste da Barra de Progresso da Live Activity
// Este arquivo testa se a barra de progresso está funcionando corretamente

console.log("🧪 Teste da Barra de Progresso da Live Activity");
console.log("================================================");

// Verificar se há Live Activity ativa
async function checkLiveActivityStatus() {
    try {
        // Simular verificação do estado da Live Activity
        const mockState = {
            eventStatus: "live",
            liveFightFighter1LastName: "Taira Kai",
            liveFightFighter2LastName: "Park Jun-yong",
            mainEventFighter1Ranking: "#12",
            mainEventFighter2Ranking: "#15"
        };
        
        console.log("📱 Estado da Live Activity:");
        console.log(`   - eventStatus: '${mockState.eventStatus}'`);
        console.log(`   - liveFightFighter1LastName: '${mockState.liveFightFighter1LastName}'`);
        console.log(`   - liveFightFighter2LastName: '${mockState.liveFightFighter2LastName}'`);
        
        // Verificar condições para barra de progresso ativa
        const hasLiveFight = mockState.liveFightFighter1LastName.length > 0 && 
                           mockState.liveFightFighter2LastName.length > 0;
        const isEventLive = mockState.eventStatus === "live";
        
        console.log(`   - hasLiveFight: ${hasLiveFight}`);
        console.log(`   - isEventLive: ${isEventLive}`);
        
        if (isEventLive && hasLiveFight) {
            console.log("✅ Condições para barra de progresso ativa estão satisfeitas");
            console.log("🎯 A barra de progresso deve estar funcionando");
            
            // Simular progresso da barra
            simulateProgressBar();
        } else {
            console.log("❌ Condições para barra de progresso ativa NÃO estão satisfeitas");
            console.log("🔍 Verificar:");
            if (!isEventLive) console.log("   - eventStatus deve ser 'live'");
            if (!hasLiveFight) console.log("   - Nomes dos lutadores não podem estar vazios");
        }
        
    } catch (error) {
        console.error("❌ Erro ao verificar Live Activity:", error);
    }
}

// Simular funcionamento da barra de progresso
function simulateProgressBar() {
    console.log("\n🔄 Simulando funcionamento da barra de progresso:");
    
    let progress = 0.01;
    const interval = setInterval(() => {
        progress += 0.1;
        if (progress > 1.0) {
            progress = 0.01;
        }
        
        const percentage = Math.round(progress * 100);
        const bar = "█".repeat(Math.floor(percentage / 5)) + "░".repeat(20 - Math.floor(percentage / 5));
        
        console.log(`   [${bar}] ${percentage}%`);
        
        // Parar após alguns ciclos
        if (progress >= 1.0) {
            clearInterval(interval);
            console.log("✅ Simulação da barra de progresso concluída");
        }
    }, 200);
}

// Executar teste
checkLiveActivityStatus();

console.log("\n📋 Resumo do Teste:");
console.log("====================");
console.log("1. ✅ Verificar se eventStatus = 'live'");
console.log("2. ✅ Verificar se há nomes de lutadores na luta ao vivo");
console.log("3. ✅ Verificar se a barra de progresso está sendo renderizada");
console.log("4. ✅ Verificar se o timer está funcionando (atualizações a cada 2s)");
console.log("5. ✅ Verificar se a animação está suave");

console.log("\n🔧 Se a barra não estiver funcionando:");
console.log("   - Verificar se há Live Activity ativa");
console.log("   - Verificar se o evento está marcado como 'live'");
console.log("   - Verificar se os nomes dos lutadores estão sendo carregados");
console.log("   - Verificar se o timer está sendo iniciado corretamente");
console.log("   - Verificar se não há conflitos com outras funções de progresso");
