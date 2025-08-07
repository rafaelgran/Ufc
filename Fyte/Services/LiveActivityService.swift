//
//  LiveActivityService.swift
//  It's time
//
//  Created by Rafael Granemann on 24/07/25.
//

import Foundation
import ActivityKit
import WidgetKit

// MARK: - Live Activity Attributes
struct UFCEventLiveActivityAttributes: ActivityAttributes {
    public     struct ContentState: Codable, Hashable {
        var timeRemaining: String
        var eventStatus: String
        var currentFight: String?
        var finishedFights: Int
        var totalFights: Int
        var fighter1LastName: String
        var fighter2LastName: String
        var nextFighter1LastName: String
        var nextFighter2LastName: String
        // Novos campos para ranking e bandeiras
        var fighter1Ranking: String?
        var fighter2Ranking: String?
        var fighter1Country: String?
        var fighter2Country: String?
        var fighter1Record: String?
        var fighter2Record: String?
        var currentFightWeightClass: String?
        // ===== LUTA PRINCIPAL (fightOrder 1) =====
        var mainEventFighter1LastName: String
        var mainEventFighter2LastName: String
        var mainEventFighter1Ranking: String?
        var mainEventFighter2Ranking: String?
        var mainEventFighter1Country: String?
        var mainEventFighter2Country: String?
        var mainEventWeightClass: String?
        
        // ===== LUTA AO VIVO (status "live") =====
        var liveFightFighter1LastName: String
        var liveFightFighter2LastName: String
        var liveFightFighter1Ranking: String?
        var liveFightFighter2Ranking: String?
        var liveFightFighter1Country: String?
        var liveFightFighter2Country: String?
        var liveFightWeightClass: String?
    }
    
    var eventName: String
    var eventDate: String
    var mainEvent: String
    var venue: String?
    var eventId: Int
}

@MainActor
class LiveActivityService: ObservableObject {
    static let shared = LiveActivityService()
    
    @Published var currentActivity: Activity<UFCEventLiveActivityAttributes>?
    @Published var isActivityActive = false
    
    private var updateTimer: Timer?
    
    private init() {
        print("🔍 Debug: LiveActivityService initialized")
    }
    
    // Iniciar Live Activity para um evento
    func startEventActivity(for event: UFCEvent) async {
        print("🔍 Debug: startEventActivity called for event: \(event.name)")
        
        let areActivitiesEnabled = ActivityAuthorizationInfo().areActivitiesEnabled
        print("🔍 Debug: Live Activities enabled: \(areActivitiesEnabled)")
        
        guard areActivitiesEnabled else {
            print("❌ Live Activities não estão habilitadas")
            return
        }
        
        // Parar atividade anterior se existir
        await stopCurrentActivity()
        
        // Calcular lutas finalizadas
        let finishedFights = calculateFinishedFights(for: event)
        let totalFights = event.fights?.count ?? 0
        
        // Obter luta atual e próxima luta
        let currentFight = getCurrentFight(for: event)
        let nextFight = getNextFight(for: event, finishedFights: finishedFights)
        
        // Obter luta principal (fightOrder 1)
        let mainEventFight = getHighlightFight(for: event)
        
        // Obter luta que deve ser exibida no destaque
        let displayFight = getDisplayFight(for: event)
        
        // Verificar se há luta ao vivo
        let hasLiveFight = displayFight?.status == "live"
        let eventStatus = hasLiveFight ? "live" : "starting"
        
        // Extrair nomes dos lutadores
        let currentFighter1LastName = extractLastName(from: displayFight?.fighter1.name ?? "")
        let currentFighter2LastName = extractLastName(from: displayFight?.fighter2.name ?? "")
        let nextFighter1LastName = extractLastName(from: nextFight?.fighter1.name ?? "")
        let nextFighter2LastName = extractLastName(from: nextFight?.fighter2.name ?? "")
        let mainEventFighter1LastName = extractLastName(from: mainEventFight?.fighter1.name ?? "")
        let mainEventFighter2LastName = extractLastName(from: mainEventFight?.fighter2.name ?? "")
        
        // Criar estado inicial
        let initialState = UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: hasLiveFight ? "LIVE" : "Starting Soon",
            eventStatus: eventStatus,
            currentFight: currentFight,
            finishedFights: finishedFights,
            totalFights: totalFights,
            fighter1LastName: hasLiveFight ? currentFighter1LastName : mainEventFighter1LastName,
            fighter2LastName: hasLiveFight ? currentFighter2LastName : mainEventFighter2LastName,
            nextFighter1LastName: nextFighter1LastName,
            nextFighter2LastName: nextFighter2LastName,
            fighter1Ranking: hasLiveFight ? displayFight?.fighter1.ranking : mainEventFight?.fighter1.ranking,
            fighter2Ranking: hasLiveFight ? displayFight?.fighter2.ranking : mainEventFight?.fighter2.ranking,
            fighter1Country: hasLiveFight ? displayFight?.fighter1.country : mainEventFight?.fighter1.country,
            fighter2Country: hasLiveFight ? displayFight?.fighter2.country : mainEventFight?.fighter2.country,
            fighter1Record: hasLiveFight ? displayFight?.fighter1.record : nil,
            fighter2Record: hasLiveFight ? displayFight?.fighter2.record : nil,
            currentFightWeightClass: hasLiveFight ? displayFight?.weightClass : nil,
            // ===== LUTA PRINCIPAL (fightOrder 1) =====
            mainEventFighter1LastName: mainEventFighter1LastName,
            mainEventFighter2LastName: mainEventFighter2LastName,
            mainEventFighter1Ranking: mainEventFight?.fighter1.ranking,
            mainEventFighter2Ranking: mainEventFight?.fighter2.ranking,
            mainEventFighter1Country: mainEventFight?.fighter1.country,
            mainEventFighter2Country: mainEventFight?.fighter2.country,
            mainEventWeightClass: mainEventFight?.weightClass,
            // ===== LUTA AO VIVO (status "live") =====
            liveFightFighter1LastName: hasLiveFight ? currentFighter1LastName : "",
            liveFightFighter2LastName: hasLiveFight ? currentFighter2LastName : "",
            liveFightFighter1Ranking: hasLiveFight ? displayFight?.fighter1.ranking : nil,
            liveFightFighter2Ranking: hasLiveFight ? displayFight?.fighter2.ranking : nil,
            liveFightFighter1Country: hasLiveFight ? displayFight?.fighter1.country : nil,
            liveFightFighter2Country: hasLiveFight ? displayFight?.fighter2.country : nil,
            liveFightWeightClass: hasLiveFight ? displayFight?.weightClass : nil
        )
        
        do {
            let activity = try Activity.request(
                attributes: UFCEventLiveActivityAttributes(
                    eventName: event.name,
                    eventDate: event.date,
                    mainEvent: event.mainEvent ?? "TBD",
                    venue: event.venue,
                    eventId: event.id
                ),
                content: ActivityContent(state: initialState, staleDate: nil),
                pushType: nil
            )
            
            currentActivity = activity
            print("✅ Live Activity iniciada para: \(event.name)")
            
            // Iniciar timer de atualização
            startUpdateTimer(for: event)
            
        } catch {
            print("❌ Erro ao iniciar Live Activity: \(error)")
        }
    }
    
    // Parar Live Activity atual
    func stopCurrentActivity() async {
        guard let activity = currentActivity else { return }
        
        updateTimer?.invalidate()
        updateTimer = nil
        
        let finalState = UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: "FINALIZADO",
            eventStatus: "finished",
            currentFight: nil,
            finishedFights: 0,
            totalFights: 0,
            fighter1LastName: "",
            fighter2LastName: "",
            nextFighter1LastName: "",
            nextFighter2LastName: "",
            fighter1Ranking: nil,
            fighter2Ranking: nil,
            fighter1Country: nil,
            fighter2Country: nil,
            fighter1Record: nil,
            fighter2Record: nil,
            currentFightWeightClass: nil,
            // ===== LUTA PRINCIPAL (fightOrder 1) =====
            mainEventFighter1LastName: "",
            mainEventFighter2LastName: "",
            mainEventFighter1Ranking: nil,
            mainEventFighter2Ranking: nil,
            mainEventFighter1Country: nil,
            mainEventFighter2Country: nil,
            mainEventWeightClass: nil,
            // ===== LUTA AO VIVO (status "live") =====
            liveFightFighter1LastName: "",
            liveFightFighter2LastName: "",
            liveFightFighter1Ranking: nil,
            liveFightFighter2Ranking: nil,
            liveFightFighter1Country: nil,
            liveFightFighter2Country: nil,
            liveFightWeightClass: nil
        )
        
        await activity.endCompat(finalState, dismissalPolicy: .immediate)
        
        currentActivity = nil
        isActivityActive = false
        
        print("🛑 Live Activity finalizada")
    }
    
    // Obter luta atual
    private func getCurrentFight(for event: UFCEvent) -> String? {
        guard let fights = event.fights, !fights.isEmpty else { return nil }
        
        // Buscar luta ao vivo
        let liveFight = fights.first { $0.status == "live" }
        if let liveFight = liveFight {
            return "\(liveFight.fighter1.name) vs \(liveFight.fighter2.name)"
        }
        
        // Se não há luta ao vivo, buscar próxima luta
        let finishedFights = calculateFinishedFights(for: event)
        let nextFight = getNextFight(for: event, finishedFights: finishedFights)
        if let nextFight = nextFight {
            return "\(nextFight.fighter1.name) vs \(nextFight.fighter2.name)"
        }
        
        return nil
    }
    
    // Extrair sobrenome do nome completo
    private func extractLastName(from fullName: String) -> String {
        let nameParts = fullName.components(separatedBy: " ")
        
        if nameParts.count > 1 {
            let lastName = nameParts.dropFirst().joined(separator: " ")
            return lastName
        } else {
            return fullName
        }
    }
    
    // Calcular a próxima luta baseada no número de lutas finalizadas
    // Obter a próxima luta baseada no fightOrder (ordem decrescente)
    private func getNextFight(for event: UFCEvent, finishedFights: Int) -> UFCFight? {
        guard let fights = event.fights, !fights.isEmpty else { return nil }
        
        // Ordenar lutas por fightOrder (maior para menor, pois maior fightOrder = próxima luta)
        let sortedFights = fights.sorted { fight1, fight2 in
            let order1 = fight1.fightOrder ?? Int.max
            let order2 = fight2.fightOrder ?? Int.max
            return order1 > order2 // Ordem decrescente (maior primeiro)
        }
        
        // Encontrar a próxima luta não finalizada (maior fightOrder primeiro)
        for fight in sortedFights {
            if !fight.isFinished {
                // Se a luta não está ao vivo, é a próxima
                if fight.status != "live" {
                    return fight
                } else {
                    // Se a luta está ao vivo, continuar procurando a próxima
                }
            } else {
                // Luta finalizada, não é a próxima
            }
        }
        
        return nil
    }
    
    // Obter a luta de destaque (fightOrder 1)
    private func getHighlightFight(for event: UFCEvent) -> UFCFight? {
        guard let fights = event.fights, !fights.isEmpty else { 
            return nil 
        }
        
        // Buscar a luta com fightOrder 1
        let highlightFight = fights.first { $0.fightOrder == 1 }
        
        if let highlightFight = highlightFight {
            return highlightFight
        } else {
            return fights.first
        }
    }
    
    // Obter a luta que deve ser exibida no destaque da Live Activity
    private func getDisplayFight(for event: UFCEvent) -> UFCFight? {
        guard let fights = event.fights, !fights.isEmpty else { 
            return nil 
        }
        
        // Primeiro, verificar se há alguma luta ao vivo
        let liveFight = fights.first { $0.status == "live" }
        if let liveFight = liveFight {
            return liveFight
        }
        
        // Se não há luta ao vivo, usar a luta de destaque (fightOrder 1)
        let highlightFight = getHighlightFight(for: event)
        return highlightFight
    }
    
    // Atualizar status para "LIVE"
    func updateToLiveStatus(currentFight: String? = nil, event: UFCEvent? = nil) async {
        guard let activity = currentActivity else { 
            return 
        }
        
        // Se não temos o evento, usar dados do estado atual
        let currentState = activity.content.state
        let totalFights = currentState.totalFights
        
        // Calcular lutas finalizadas (incluindo "live" e "finished")
        var finishedFights = currentState.finishedFights
        if let event = event {
            finishedFights = calculateFinishedFights(for: event)
        }
        
        // Calcular luta atual e próxima luta se temos o evento
        var currentFighter1LastName = currentState.fighter1LastName
        var currentFighter2LastName = currentState.fighter2LastName
        var nextFighter1LastName = currentState.nextFighter1LastName
        var nextFighter2LastName = currentState.nextFighter2LastName
        var displayFight: UFCFight? = nil
        
        if let event = event {
            // Obter a luta que deve ser exibida no destaque
            displayFight = getDisplayFight(for: event)
            currentFighter1LastName = extractLastName(from: displayFight?.fighter1.name ?? "")
            currentFighter2LastName = extractLastName(from: displayFight?.fighter2.name ?? "")
            
            // Calcular próxima luta
            let nextFight = getNextFight(for: event, finishedFights: finishedFights)
            nextFighter1LastName = extractLastName(from: nextFight?.fighter1.name ?? "")
            nextFighter2LastName = extractLastName(from: nextFight?.fighter2.name ?? "")
        }
        
        // Verificar se realmente há uma luta ao vivo
        let hasLiveFight = displayFight?.status == "live"
        let eventStatus = hasLiveFight ? "live" : "starting"
        
        let liveState = UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: hasLiveFight ? "LIVE" : currentState.timeRemaining,
            eventStatus: eventStatus,
            currentFight: currentFight,
            finishedFights: finishedFights,
            totalFights: totalFights,
            fighter1LastName: hasLiveFight ? currentFighter1LastName : currentState.mainEventFighter1LastName, // Luta ao vivo ou principal
            fighter2LastName: hasLiveFight ? currentFighter2LastName : currentState.mainEventFighter2LastName, // Luta ao vivo ou principal
            nextFighter1LastName: nextFighter1LastName,
            nextFighter2LastName: nextFighter2LastName,
            fighter1Ranking: hasLiveFight ? displayFight?.fighter1.ranking : currentState.mainEventFighter1Ranking, // Ranking da luta ao vivo ou principal
            fighter2Ranking: hasLiveFight ? displayFight?.fighter2.ranking : currentState.mainEventFighter2Ranking, // Ranking da luta ao vivo ou principal
            fighter1Country: hasLiveFight ? displayFight?.fighter1.country : currentState.mainEventFighter1Country,
            fighter2Country: hasLiveFight ? displayFight?.fighter2.country : currentState.mainEventFighter2Country,
            fighter1Record: hasLiveFight ? displayFight?.fighter1.record : nil,
            fighter2Record: hasLiveFight ? displayFight?.fighter2.record : nil,
            currentFightWeightClass: hasLiveFight ? displayFight?.weightClass : nil,
            // ===== LUTA PRINCIPAL (fightOrder 1) =====
            mainEventFighter1LastName: currentState.mainEventFighter1LastName,
            mainEventFighter2LastName: currentState.mainEventFighter2LastName,
            mainEventFighter1Ranking: currentState.mainEventFighter1Ranking,
            mainEventFighter2Ranking: currentState.mainEventFighter2Ranking,
            mainEventFighter1Country: currentState.mainEventFighter1Country,
            mainEventFighter2Country: currentState.mainEventFighter2Country,
            mainEventWeightClass: currentState.mainEventWeightClass,
            // ===== LUTA AO VIVO (status "live") =====
            liveFightFighter1LastName: hasLiveFight ? currentFighter1LastName : "",
            liveFightFighter2LastName: hasLiveFight ? currentFighter2LastName : "",
            liveFightFighter1Ranking: hasLiveFight ? displayFight?.fighter1.ranking : nil,
            liveFightFighter2Ranking: hasLiveFight ? displayFight?.fighter2.ranking : nil,
            liveFightFighter1Country: hasLiveFight ? displayFight?.fighter1.country : nil,
            liveFightFighter2Country: hasLiveFight ? displayFight?.fighter2.country : nil,
            liveFightWeightClass: hasLiveFight ? displayFight?.weightClass : nil
        )
        
        await activity.updateCompat(liveState)
    }
    
    // Atualizar luta atual
    func updateCurrentFight(_ fight: String) async {
        guard let activity = currentActivity else { return }
        
        let currentState = activity.content.state
        let updatedState = UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: currentState.timeRemaining,
            eventStatus: currentState.eventStatus,
            currentFight: fight,
            finishedFights: currentState.finishedFights,
            totalFights: currentState.totalFights,
            fighter1LastName: currentState.fighter1LastName,
            fighter2LastName: currentState.fighter2LastName,
            nextFighter1LastName: currentState.nextFighter1LastName,
            nextFighter2LastName: currentState.nextFighter2LastName,
            fighter1Ranking: currentState.fighter1Ranking,
            fighter2Ranking: currentState.fighter2Ranking,
            fighter1Country: currentState.fighter1Country,
            fighter2Country: currentState.fighter2Country,
            fighter1Record: currentState.fighter1Record,
            fighter2Record: currentState.fighter2Record,
            currentFightWeightClass: currentState.currentFightWeightClass,
            mainEventFighter1LastName: currentState.mainEventFighter1LastName,
            mainEventFighter2LastName: currentState.mainEventFighter2LastName,
            mainEventFighter1Ranking: currentState.mainEventFighter1Ranking,
            mainEventFighter2Ranking: currentState.mainEventFighter2Ranking,
            mainEventFighter1Country: currentState.mainEventFighter1Country,
            mainEventFighter2Country: currentState.mainEventFighter2Country,
            mainEventWeightClass: currentState.mainEventWeightClass,
            liveFightFighter1LastName: currentState.liveFightFighter1LastName,
            liveFightFighter2LastName: currentState.liveFightFighter2LastName,
            liveFightFighter1Ranking: currentState.liveFightFighter1Ranking,
            liveFightFighter2Ranking: currentState.liveFightFighter2Ranking,
            liveFightFighter1Country: currentState.liveFightFighter1Country,
            liveFightFighter2Country: currentState.liveFightFighter2Country,
            liveFightWeightClass: currentState.liveFightWeightClass
        )
        
        await activity.updateCompat(updatedState)
    }
    
    // Atualizar número de lutas finalizadas e próxima luta
    func updateFinishedFights(_ finishedFights: Int, event: UFCEvent) async {
        guard let activity = currentActivity else { return }
        
        let currentState = activity.content.state
        
        // Calcular lutas finalizadas (incluindo "live" e "finished")
        let calculatedFinishedFights = calculateFinishedFights(for: event)
        
        // Calcular próxima luta baseada no número de lutas finalizadas
        let nextFight = getNextFight(for: event, finishedFights: calculatedFinishedFights)
        let nextFighter1LastName = extractLastName(from: nextFight?.fighter1.name ?? "")
        let nextFighter2LastName = extractLastName(from: nextFight?.fighter2.name ?? "")
        
        let updatedState = UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: currentState.timeRemaining,
            eventStatus: currentState.eventStatus,
            currentFight: currentState.currentFight,
            finishedFights: calculatedFinishedFights,
            totalFights: currentState.totalFights,
            fighter1LastName: currentState.fighter1LastName,
            fighter2LastName: currentState.fighter2LastName,
            nextFighter1LastName: nextFighter1LastName,
            nextFighter2LastName: nextFighter2LastName,
            fighter1Ranking: currentState.fighter1Ranking,
            fighter2Ranking: currentState.fighter2Ranking,
            fighter1Country: currentState.fighter1Country,
            fighter2Country: currentState.fighter2Country,
            fighter1Record: currentState.fighter1Record,
            fighter2Record: currentState.fighter2Record,
            currentFightWeightClass: currentState.currentFightWeightClass,
            mainEventFighter1LastName: currentState.mainEventFighter1LastName,
            mainEventFighter2LastName: currentState.mainEventFighter2LastName,
            mainEventFighter1Ranking: currentState.mainEventFighter1Ranking,
            mainEventFighter2Ranking: currentState.mainEventFighter2Ranking,
            mainEventFighter1Country: currentState.mainEventFighter1Country,
            mainEventFighter2Country: currentState.mainEventFighter2Country,
            mainEventWeightClass: currentState.mainEventWeightClass,
            liveFightFighter1LastName: currentState.liveFightFighter1LastName,
            liveFightFighter2LastName: currentState.liveFightFighter2LastName,
            liveFightFighter1Ranking: currentState.liveFightFighter1Ranking,
            liveFightFighter2Ranking: currentState.liveFightFighter2Ranking,
            liveFightFighter1Country: currentState.liveFightFighter1Country,
            liveFightFighter2Country: currentState.liveFightFighter2Country,
            liveFightWeightClass: currentState.liveFightWeightClass
        )
        
        await activity.updateCompat(updatedState)
    }
    
    // Timer para atualizar o countdown
    private func startUpdateTimer(for event: UFCEvent) {
        updateTimer?.invalidate()
        
        updateTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                // Verificar se a Live Activity ainda deve estar ativa
                if let self = self, let currentActivity = self.currentActivity {
                    // Se a Live Activity é para um evento diferente, parar o timer
                    if currentActivity.attributes.eventId != event.id {
                        self.updateTimer?.invalidate()
                        self.updateTimer = nil
                        return
                    }
                    
                    // Verificar se o evento ainda deve manter a Live Activity ativa
                    if !self.shouldKeepActivityActive(for: event) {
                        print("🛑 Event finished, stopping Live Activity timer")
                        self.updateTimer?.invalidate()
                        self.updateTimer = nil
                        await self.stopCurrentActivity()
                        return
                    }
                }
                
                await self?.updateCountdown(for: event)
            }
        }
    }
    
    // Atualizar countdown
    private func updateCountdown(for event: UFCEvent) async {
        guard let activity = currentActivity else { return }
        
        let timeRemaining = formatTimeRemaining(for: event)
        let currentState = activity.content.state
        
        // Se o evento já começou, apenas atualizar o tempo (não sobrescrever lutas)
        if timeRemaining == "00:00:00" || timeRemaining == "EVENTO INICIADO" {
            // Manter as informações de lutas atuais, apenas atualizar o tempo
            let updatedState = UFCEventLiveActivityAttributes.ContentState(
                timeRemaining: timeRemaining,
                eventStatus: "live",
                currentFight: currentState.currentFight,
                finishedFights: currentState.finishedFights,
                totalFights: currentState.totalFights,
                fighter1LastName: currentState.fighter1LastName,
                fighter2LastName: currentState.fighter2LastName,
                nextFighter1LastName: currentState.nextFighter1LastName,
                nextFighter2LastName: currentState.nextFighter2LastName,
                fighter1Ranking: currentState.fighter1Ranking,
                fighter2Ranking: currentState.fighter2Ranking,
                fighter1Country: currentState.fighter1Country,
                fighter2Country: currentState.fighter2Country,
                fighter1Record: currentState.fighter1Record,
                fighter2Record: currentState.fighter2Record,
                currentFightWeightClass: currentState.currentFightWeightClass,
                mainEventFighter1LastName: currentState.mainEventFighter1LastName,
                mainEventFighter2LastName: currentState.mainEventFighter2LastName,
                mainEventFighter1Ranking: currentState.mainEventFighter1Ranking,
                mainEventFighter2Ranking: currentState.mainEventFighter2Ranking,
                mainEventFighter1Country: currentState.mainEventFighter1Country,
                mainEventFighter2Country: currentState.mainEventFighter2Country,
            mainEventWeightClass: currentState.mainEventWeightClass,
            liveFightFighter1LastName: currentState.liveFightFighter1LastName,
            liveFightFighter2LastName: currentState.liveFightFighter2LastName,
            liveFightFighter1Ranking: currentState.liveFightFighter1Ranking,
            liveFightFighter2Ranking: currentState.liveFightFighter2Ranking,
            liveFightFighter1Country: currentState.liveFightFighter1Country,
            liveFightFighter2Country: currentState.liveFightFighter2Country,
            liveFightWeightClass: currentState.liveFightWeightClass
            )
            
            await activity.updateCompat(updatedState)
            return
        }
        
        // Se o evento ainda não começou, atualizar countdown e lutas
        let finishedFights = calculateFinishedFights(for: event)
        let nextFight = getNextFight(for: event, finishedFights: finishedFights)
        
        let updatedState = UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: timeRemaining,
            eventStatus: currentState.eventStatus,
            currentFight: currentState.currentFight,
            finishedFights: finishedFights,
            totalFights: currentState.totalFights,
            fighter1LastName: currentState.mainEventFighter1LastName, // SEMPRE luta principal
            fighter2LastName: currentState.mainEventFighter2LastName, // SEMPRE luta principal
            nextFighter1LastName: extractLastName(from: nextFight?.fighter1.name ?? ""),
            nextFighter2LastName: extractLastName(from: nextFight?.fighter2.name ?? ""),
            fighter1Ranking: currentState.mainEventFighter1Ranking, // Ranking da luta principal
            fighter2Ranking: currentState.mainEventFighter2Ranking, // Ranking da luta principal
            fighter1Country: currentState.mainEventFighter1Country,
            fighter2Country: currentState.mainEventFighter2Country,
            fighter1Record: nil,
            fighter2Record: nil,
            currentFightWeightClass: nil,
            mainEventFighter1LastName: currentState.mainEventFighter1LastName,
            mainEventFighter2LastName: currentState.mainEventFighter2LastName,
            mainEventFighter1Ranking: currentState.mainEventFighter1Ranking,
            mainEventFighter2Ranking: currentState.mainEventFighter2Ranking,
            mainEventFighter1Country: currentState.mainEventFighter1Country,
            mainEventFighter2Country: currentState.mainEventFighter2Country,
            mainEventWeightClass: currentState.mainEventWeightClass,
            liveFightFighter1LastName: currentState.liveFightFighter1LastName,
            liveFightFighter2LastName: currentState.liveFightFighter2LastName,
            liveFightFighter1Ranking: currentState.liveFightFighter1Ranking,
            liveFightFighter2Ranking: currentState.liveFightFighter2Ranking,
            liveFightFighter1Country: currentState.liveFightFighter1Country,
            liveFightFighter2Country: currentState.liveFightFighter2Country,
            liveFightWeightClass: currentState.liveFightWeightClass
        )
        
        await activity.updateCompat(updatedState)
    }
    
    // Formatar tempo restante
    private func formatTimeRemaining(for event: UFCEvent) -> String {
        let timeRemaining = event.timeRemaining
        
        if timeRemaining.days > 0 {
            return "\(timeRemaining.days)d \(timeRemaining.hours)h \(timeRemaining.minutes)m"
        } else if timeRemaining.hours > 0 {
            return String(format: "%02d:%02d:%02d", timeRemaining.hours, timeRemaining.minutes, 0)
        } else if timeRemaining.minutes > 0 {
            return String(format: "00:%02d:%02d", timeRemaining.minutes, 0)
        } else {
            return "EVENTO INICIADO"
        }
    }
    
    // Verificar se há Live Activity ativa
    func checkActiveActivities() async {
        print("🔍 Debug: ===== checkActiveActivities START =====")
        print("🔍 Debug: Checking for active activities...")
        let activities = Activity<UFCEventLiveActivityAttributes>.activities
        print("🔍 Debug: Found \(activities.count) active activities")
        
        for activity in activities {
            print("🔍 Live Activity ativa: \(activity.attributes.eventName)")
            currentActivity = activity
            isActivityActive = true
            break
        }
        print("🔍 Debug: ===== checkActiveActivities END =====")
    }
    
    // Verificar e restaurar Live Activities perdidas
    func checkAndRestoreLiveActivities(events: [UFCEvent]) async {
        let activities = Activity<UFCEventLiveActivityAttributes>.activities
        
        if activities.isEmpty {
            print("🔍 Debug: No active Live Activities found, checking if we should start one")
            
            // Procurar por eventos que deveriam ter Live Activity ativa
            for event in events {
                if shouldKeepActivityActive(for: event) {
                    // Se o evento está próximo de começar ou está acontecendo agora
                    if isEventNearStart(for: event) || isEventLive(for: event) {
                        print("🔍 Debug: Restoring Live Activity for event: \(event.name)")
                        await startEventActivity(for: event)
                        break
                    }
                }
            }
        } else {
            // Atualizar referência para a Live Activity ativa
            currentActivity = activities.first
            isActivityActive = true
            print("🔍 Debug: Found existing Live Activity: \(activities.first?.attributes.eventName ?? "Unknown")")
        }
    }
    
    // Verificar se uma Live Activity específica ainda deve estar ativa
    func shouldKeepActivityActive(for event: UFCEvent) -> Bool {
        let timeRemaining = event.timeRemaining
        let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
        
        // Manter ativa se:
        // 1. Evento ainda não começou (tempo positivo)
        // 2. Evento está acontecendo agora (entre 0 e -480 minutos = 8 horas)
        // 3. Evento acabou há menos de 8 horas (tempo suficiente para eventos longos)
        return totalMinutes > -480
    }
    
    // Verificar se um evento está em andamento (live)
    func isEventLive(for event: UFCEvent) -> Bool {
        let timeRemaining = event.timeRemaining
        let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
        
        // Evento está live se já começou mas ainda não passou 2 horas (tempo mais realista)
        return totalMinutes <= 0 && totalMinutes > -120
    }
    
    // Calcular número de lutas finalizadas (incluindo "live" e "finished")
    private func calculateFinishedFights(for event: UFCEvent) -> Int {
        guard let fights = event.fights else { return 0 }
        
        let finishedCount = fights.filter { fight in
            let status = fight.status
            return status == "live" || status == "finished"
        }.count
        
        return finishedCount
    }
    
    // Forçar atualização da Live Activity com dados mais recentes
    func forceUpdateLiveActivity(event: UFCEvent) async {
        guard let activity = currentActivity else { 
            return 
        }
        
        print("🔍 Debug: Force updating Live Activity for event: \(event.name)")
        
        // Parar o timer temporariamente para evitar conflitos
        updateTimer?.invalidate()
        updateTimer = nil
        
        // Calcular lutas finalizadas (incluindo "live" e "finished")
        let finishedFights = calculateFinishedFights(for: event)
        
        // Recalcular a próxima luta com dados atualizados
        let nextFight = getNextFight(for: event, finishedFights: finishedFights)
        let displayFight = getDisplayFight(for: event)
        
        let currentState = activity.content.state
        let timeRemaining = formatTimeRemaining(for: event)
        
        // Determinar status do evento
        let eventStatus = timeRemaining == "00:00:00" || timeRemaining == "EVENTO INICIADO" ? "live" : "starting"
        
        let updatedState = UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: timeRemaining,
            eventStatus: eventStatus,
            currentFight: currentState.currentFight,
            finishedFights: finishedFights,
            totalFights: event.fights?.count ?? 0,
            fighter1LastName: extractLastName(from: displayFight?.fighter1.name ?? ""),
            fighter2LastName: extractLastName(from: displayFight?.fighter2.name ?? ""),
            nextFighter1LastName: extractLastName(from: nextFight?.fighter1.name ?? ""),
            nextFighter2LastName: extractLastName(from: nextFight?.fighter2.name ?? ""),
            fighter1Ranking: displayFight?.fighter1.ranking,
            fighter2Ranking: displayFight?.fighter2.ranking,
            fighter1Country: displayFight?.fighter1.country,
            fighter2Country: displayFight?.fighter2.country,
            fighter1Record: displayFight?.fighter1.record,
            fighter2Record: displayFight?.fighter2.record,
            currentFightWeightClass: displayFight?.weightClass,
            mainEventFighter1LastName: currentState.mainEventFighter1LastName,
            mainEventFighter2LastName: currentState.mainEventFighter2LastName,
            mainEventFighter1Ranking: currentState.mainEventFighter1Ranking,
            mainEventFighter2Ranking: currentState.mainEventFighter2Ranking,
            mainEventFighter1Country: currentState.mainEventFighter1Country,
            mainEventFighter2Country: currentState.mainEventFighter2Country,
            mainEventWeightClass: currentState.mainEventWeightClass,
            liveFightFighter1LastName: currentState.liveFightFighter1LastName,
            liveFightFighter2LastName: currentState.liveFightFighter2LastName,
            liveFightFighter1Ranking: currentState.liveFightFighter1Ranking,
            liveFightFighter2Ranking: currentState.liveFightFighter2Ranking,
            liveFightFighter1Country: currentState.liveFightFighter1Country,
            liveFightFighter2Country: currentState.liveFightFighter2Country,
            liveFightWeightClass: currentState.liveFightWeightClass
        )
        
                await activity.updateCompat(updatedState)
        print("✅ Live Activity force updated with latest data - \(finishedFights)/\(event.fights?.count ?? 0)")

        // Chamar updateToLiveStatus para garantir que as variáveis liveFightFighter* sejam populadas corretamente
        print("🔍 Debug: Chamando updateToLiveStatus...")
        await updateToLiveStatus(currentFight: currentState.currentFight, event: event)
        print("🔍 Debug: updateToLiveStatus concluído")
        
        // Reiniciar o timer com dados atualizados
        startUpdateTimer(for: event)
    }
    
    // Verificar se um evento está próximo de começar
    func isEventNearStart(for event: UFCEvent) -> Bool {
        let timeRemaining = event.timeRemaining
        let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
        
        // Evento está próximo se começa em até 15 minutos
        return totalMinutes <= 15 && totalMinutes > 0
    }
}

// MARK: - Extensions para facilitar o uso
extension LiveActivityService {
    // Iniciar Live Activity quando o evento estiver próximo (15 minutos antes)
    func startActivityIfNear(event: UFCEvent) async {
        // Se já há uma Live Activity ativa, verificar se é para o mesmo evento
        if let currentActivity = currentActivity {
            if currentActivity.attributes.eventId == event.id {
                print("🔍 Debug: Live Activity already active for event: \(event.name)")
                return
            } else {
                // Se há uma Live Activity para outro evento, verificar se deve trocar
                let currentEventTimeRemaining = currentActivity.content.state.timeRemaining
                
                // Só trocar se o novo evento está mais próximo e o atual não está live
                if currentEventTimeRemaining == "EVENTO INICIADO" || currentEventTimeRemaining == "LIVE" {
                    print("🔍 Debug: Current event is live, not switching to: \(event.name)")
                    return
                }
            }
        }
        
        // Iniciar se o evento está próximo de começar ou está acontecendo agora
        if isEventNearStart(for: event) || isEventLive(for: event) {
            let timeRemaining = event.timeRemaining
            let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
            print("🔍 Debug: Starting Live Activity for event: \(event.name), minutes remaining: \(totalMinutes)")
            await startEventActivity(for: event)
        }
    }
    
    // Parar Live Activity quando o evento terminar
    func stopActivityIfFinished(event: UFCEvent) async {
        // Só parar se a Live Activity atual é para este evento específico
        guard let currentActivity = currentActivity,
              currentActivity.attributes.eventId == event.id else {
            return
        }
        
        // Verificar se ainda deve manter a Live Activity ativa
        if shouldKeepActivityActive(for: event) {
            print("🔍 Debug: Keeping Live Activity active for event: \(event.name)")
            return
        }
        
        print("🛑 Stopping Live Activity for finished event: \(event.name)")
        await stopCurrentActivity()
    }
}

// MARK: - iOS Version Compatibility Extensions
extension Activity where Attributes == UFCEventLiveActivityAttributes {
    // Compatible update method that works with current iOS version
    // Note: Using deprecated API for compatibility with current iOS version
    func updateCompat(_ state: Attributes.ContentState) async {
        await self.update(using: state)
    }
    
    // Compatible end method that works with current iOS version
    // Note: Using deprecated API for compatibility with current iOS version
    func endCompat(_ state: Attributes.ContentState, dismissalPolicy: ActivityUIDismissalPolicy) async {
        await self.end(using: state, dismissalPolicy: dismissalPolicy)
    }
} 