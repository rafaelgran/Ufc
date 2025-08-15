//
//  LiveActivityFighterAPI.swift
//  Widget.Its.Time
//
//  Created by Rafael Granemann on 24/07/25.
//

import Foundation
import ActivityKit

/// Exemplo de como usar a API para buscar os nomes dos lutadores da luta ao vivo
/// Este arquivo demonstra as diferentes formas de obter e atualizar os dados dos lutadores

class LiveActivityFighterAPIExample {
    
    // MARK: - Exemplo 1: Busca Manual dos Nomes
    /// Busca os nomes dos lutadores da luta ao vivo
    func exampleFetchFighterNames() async {
        print("🔍 Exemplo: Buscando nomes dos lutadores...")
        
        let (fighter1, fighter2) = await FighterDataService.shared.fetchLiveFightFighters()
        
        if let fighter1 = fighter1, let fighter2 = fighter2 {
            print("✅ Lutadores encontrados:")
            print("   🥊 Lutador 1: \(fighter1.name)")
            print("   🥊 Lutador 2: \(fighter2.name)")
            print("   🎯 Luta: \(fighter1.name) vs \(fighter2.name)")
        } else {
            print("❌ Não foi possível obter os nomes dos lutadores")
        }
    }
    
    // MARK: - Exemplo 2: Atualização Manual da Live Activity
    /// Força a atualização da Live Activity com os dados mais recentes
    func exampleForceUpdateLiveActivity() async {
        print("🔄 Exemplo: Forçando atualização da Live Activity...")
        
        await forceUpdateLiveActivityForLiveFight()
        
        print("✅ Atualização concluída!")
        print("🎯 Os nomes dos lutadores da luta ao vivo foram atualizados")
    }
    
    // MARK: - Exemplo 3: Iniciar Atualizações Automáticas
    /// Inicia o sistema de atualizações automáticas
    func exampleStartAutomaticUpdates() async {
        print("🚀 Exemplo: Iniciando atualizações automáticas...")
        
        // Inicia as atualizações automáticas em background
        Task {
            await startLiveFightMonitoring()
        }
        
        print("✅ Sistema de atualizações automáticas iniciado!")
        print("📱 A Live Activity será atualizada a cada 5 segundos")
        print("🎯 Os nomes dos lutadores da luta ao vivo serão atualizados automaticamente")
    }
    
    // MARK: - Exemplo 4: Verificar Status da Live Activity
    /// Verifica se há uma Live Activity ativa e seu status
    func exampleCheckLiveActivityStatus() {
        print("🔍 Exemplo: Verificando status da Live Activity...")
        
        let activities = Activity<UFCEventLiveActivityAttributes>.activities
        
        if activities.isEmpty {
            print("⚠️ Nenhuma Live Activity ativa")
        } else {
            print("✅ \(activities.count) Live Activity(s) ativa(s)")
            
            for (index, activity) in activities.enumerated() {
                print("   📱 Live Activity \(index + 1):")
                print("      🎯 Evento: \(activity.attributes.eventName)")
                print("      📅 Data: \(activity.attributes.eventDate)")
                print("      🏟️ Local: \(activity.attributes.venue ?? "N/A")")
                print("      🆔 ID: \(activity.attributes.eventId)")
            }
        }
    }
    
    // MARK: - Exemplo 5: Buscar Dados Completos dos Lutadores
    /// Busca dados completos incluindo record, ranking e país
    func exampleFetchCompleteFighterData() async {
        print("🔍 Exemplo: Buscando dados completos dos lutadores...")
        
        let (fighter1, fighter2) = await FighterDataService.shared.fetchLiveFightFighters()
        
        if let fighter1 = fighter1, let fighter2 = fighter2 {
            print("✅ Dados completos dos lutadores:")
            print("   🥊 Lutador 1:")
            print("      Nome: \(fighter1.name)")
            print("      Apelido: \(fighter1.nickname ?? "N/A")")
            print("      Record: \(fighter1.wins ?? 0)-\(fighter1.losses ?? 0)-\(fighter1.draws ?? 0)")
            print("      Ranking: \(fighter1.ranking ?? "N/A")")
            print("      País: \(fighter1.country ?? "N/A")")
            
            print("   🥊 Lutador 2:")
            print("      Nome: \(fighter2.name)")
            print("      Apelido: \(fighter2.nickname ?? "N/A")")
            print("      Record: \(fighter2.wins ?? 0)-\(fighter2.losses ?? 0)-\(fighter2.draws ?? 0)")
            print("      Ranking: \(fighter2.ranking ?? "N/A")")
            print("      País: \(fighter2.country ?? "N/A")")
        } else {
            print("❌ Não foi possível obter os dados dos lutadores")
        }
    }
    
    // MARK: - Exemplo 6: Monitorar Mudanças na Live Activity
    /// Demonstra como monitorar mudanças na Live Activity
    func exampleMonitorLiveActivityChanges() {
        print("👀 Exemplo: Monitorando mudanças na Live Activity...")
        
        // Observar mudanças nas atividades
        Task {
            for await activity in Activity<UFCEventLiveActivityAttributes>.activityUpdates {
                print("🔄 Live Activity atualizada:")
                print("   🎯 Evento: \(activity.attributes.eventName)")
                print("   📱 Status: \(activity.content.state.eventStatus)")
                print("   ⏰ Tempo: \(activity.content.state.timeRemaining)")
                
                if let currentFight = activity.content.state.currentFight {
                    print("   🥊 Luta atual: \(currentFight)")
                }
            }
        }
        
        print("✅ Monitoramento iniciado!")
        print("📱 Você receberá notificações quando a Live Activity for atualizada")
    }
    
    // MARK: - Exemplo 7: Testar Atualização da Live Activity
    /// Testa se a atualização está funcionando corretamente
    func exampleTestLiveActivityUpdate() async {
        print("🧪 Exemplo: Testando atualização da Live Activity...")
        
        // Usar a função de debug que existe
        debugLiveActivityState()
        
        print("✅ Teste concluído! Verifique os logs para mais detalhes")
    }
    
    // MARK: - Exemplo 8: Forçar Nomes Completos
    /// Força a atualização com nomes completos dos lutadores
    func exampleForceFullNames() async {
        print("🚀 Exemplo: Forçando nomes completos...")
        
        await forceUpdateLiveActivityForLiveFight()
        
        print("✅ Nomes completos forçados! Verifique a Live Activity")
    }
}

// MARK: - Uso Prático
/// Como usar estas funções em seu código:

/*
// 1. Criar uma instância
let apiExample = LiveActivityFighterAPIExample()

// 2. Buscar nomes dos lutadores
Task {
    await apiExample.exampleFetchFighterNames()
}

// 3. Forçar atualização
Task {
    await apiExample.exampleForceUpdateLiveActivity()
}

// 4. Iniciar atualizações automáticas
Task {
    await apiExample.exampleStartAutomaticUpdates()
}

// 5. Verificar status
apiExample.exampleCheckLiveActivityStatus()

// 6. Buscar dados completos
Task {
    await apiExample.exampleFetchCompleteFighterData()
}

// 7. Monitorar mudanças
apiExample.exampleMonitorLiveActivityChanges()

// 8. Testar atualização
Task {
    await apiExample.exampleTestLiveActivityUpdate()
}

// 9. Forçar nomes completos
Task {
    await apiExample.exampleForceFullNames()
}
*/
