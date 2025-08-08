// Usar fetch nativo do Node.js (disponível nas versões mais recentes)

async function testFighterFightsEndpoint() {
    console.log('🧪 Testando endpoint /api/fighters/:id/fights...\n');

    try {
        // Primeiro, vamos buscar um lutador
        console.log('1. Buscando lutadores...');
        const fightersResponse = await fetch('http://localhost:3000/api/fighters');
        const fighters = await fightersResponse.json();
        
        if (!fighters || fighters.length === 0) {
            console.log('❌ Nenhum lutador encontrado');
            return;
        }

        const fighter = fighters[0];
        console.log(`✅ Lutador encontrado: ${fighter.name} (ID: ${fighter.id})`);

        // Agora vamos testar o endpoint de lutas
        console.log('\n2. Testando endpoint de lutas...');
        const fightsResponse = await fetch(`http://localhost:3000/api/fighters/${fighter.id}/fights`);
        
        if (!fightsResponse.ok) {
            console.log(`❌ Erro no endpoint: ${fightsResponse.status} - ${fightsResponse.statusText}`);
            return;
        }

        const fights = await fightsResponse.json();
        console.log(`✅ Endpoint funcionando: ${fights.length} lutas retornadas`);

        // Vamos analisar as lutas
        console.log('\n3. Analisando lutas:');
        fights.forEach((fight, index) => {
            console.log(`   Luta ${index + 1}:`);
            console.log(`     ID: ${fight.id}`);
            console.log(`     Status: ${fight.status}`);
            console.log(`     Fighter1ID: ${fight.fighter1Id}`);
            console.log(`     Fighter2ID: ${fight.fighter2Id}`);
            console.log(`     WinnerID: ${fight.winnerId}`);
            console.log(`     Event: ${fight.eventName}`);
            console.log('');
        });

        // Vamos verificar se há lutas finalizadas
        const finishedFights = fights.filter(fight => fight.status === 'finished');
        console.log(`📊 Lutas finalizadas: ${finishedFights.length}/${fights.length}`);

        if (finishedFights.length > 0) {
            console.log('\n4. Lutas finalizadas:');
            finishedFights.forEach(fight => {
                const isWinner = fight.winnerId == fighter.id;
                const isParticipant = fight.fighter1Id == fighter.id || fight.fighter2Id == fighter.id;
                
                console.log(`   Luta ${fight.id}: ${isWinner ? '✅ VITÓRIA' : '❌ DERROTA'} (${fight.eventName})`);
            });
        } else {
            console.log('\n4. Nenhuma luta finalizada encontrada');
        }

        console.log('\n✅ Teste concluído!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testFighterFightsEndpoint(); 