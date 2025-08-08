import Foundation
import SwiftUI
import WebKit // Adicionado para pré-carregar SVGs
import ActivityKit // Adicionado para LiveActivityService

class UFCEventService: ObservableObject {
    @Published var events: [UFCEvent] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let supabaseURL = "https://igxztpjrojdmyzzhqxsv.supabase.co"
    private let supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU"
    
    init() {
        Task {
            await fetchEvents()
        }
    }
    
    func fetchEvents() async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }
        
        do {
            let fetchedEvents = try await fetchEventsFromSupabase()
            await MainActor.run {
                self.events = fetchedEvents
                self.isLoading = false
            }
            
            // Atualizar Live Activity se houver uma ativa
            await updateLiveActivityIfNeeded(with: fetchedEvents)
            
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    // Atualizar Live Activity se necessário
    private func updateLiveActivityIfNeeded(with events: [UFCEvent]) async {
        print("🔍 Debug: Live Activity update check - \(events.count) events loaded")
        
        // Verificar se há uma Live Activity ativa e atualizar se necessário
        let liveActivityService = await LiveActivityService.shared
        
        // Primeiro, verificar se há Live Activities ativas
        await liveActivityService.checkActiveActivities()
        
        print("🔍 Debug: Checking if Live Activity is active...")
        let isActive = await liveActivityService.isActivityActive
        print("🔍 Debug: Live Activity isActive: \(isActive)")
        
        if isActive {
            let currentActivity = await liveActivityService.currentActivity
            print("🔍 Debug: Current activity: \(currentActivity != nil ? "exists" : "nil")")
            
            if let currentActivity = currentActivity {
                let activeEventId = currentActivity.attributes.eventId
                print("🔍 Debug: Active event ID: \(activeEventId)")
                
                // Encontrar o evento ativo nos dados atualizados
                if let activeEvent = events.first(where: { $0.id == activeEventId }) {
                    print("🔍 Debug: Found active event: \(activeEvent.name)")
                    print("🔍 Debug: Updating Live Activity for active event: \(activeEvent.name)")
                    
                    // Verificar se há mudanças antes de atualizar
                    let currentState = currentActivity.content.state
                    let hasLiveFights = activeEvent.fights?.contains { $0.status == "live" } ?? false
                    let currentHasLiveFights = !currentState.liveFightFighter1LastName.isEmpty
                    
                    print("🔍 Debug: Current state has live fights: \(currentHasLiveFights)")
                    print("🔍 Debug: New data has live fights: \(hasLiveFights)")
                    
                    if hasLiveFights != currentHasLiveFights {
                        print("🚨 Live fight status changed! Updating Live Activity...")
                    } else {
                        print("ℹ️ No live fight status change detected")
                    }
                    
                    await liveActivityService.forceUpdateLiveActivity(event: activeEvent)
                } else {
                    print("🔍 Debug: Active event not found in fetched events")
                }
            }
        } else {
            print("🔍 Debug: No active Live Activity found")
        }
        
        // Debug: Simular a lógica de next fight para debug
        for event in events {
            if let fights = event.fights, !fights.isEmpty {
                // Ordenar lutas por fightOrder (maior para menor)
                let sortedFights = fights.sorted { fight1, fight2 in
                    let order1 = fight1.fightOrder ?? Int.max
                    let order2 = fight2.fightOrder ?? Int.max
                    return order1 > order2 // Ordem decrescente (maior primeiro)
                }
                
                // Encontrar próxima luta
                let nextFight = sortedFights.first { fight in
                    !fight.isFinished && fight.status != "live"
                }
                
                if let nextFight = nextFight {
                    print("🔍 Debug: Event \(event.name) - Next fight should be: \(nextFight.weightClass) (fightOrder: \(nextFight.fightOrder ?? -1))")
                } else {
                    print("🔍 Debug: Event \(event.name) - No next fight found")
                }
                
                // Verificar lutas ao vivo
                let liveFights = fights.filter { $0.isLive && $0.status == "live" }
                if !liveFights.isEmpty {
                    print("🔍 Debug: Event \(event.name) - Live fights: \(liveFights.map { "\($0.weightClass) (fightOrder: \($0.fightOrder ?? -1))" }.joined(separator: ", "))")
                }
            }
        }
        
        print("🔍 Debug: Live Activity update logic completed")
    }
    
    // Forçar refresh dos dados e atualizar Live Activity
    func refreshDataAndUpdateLiveActivity() async {
        print("🔄 Forcing data refresh and Live Activity update...")
        await fetchEvents()
    }
    
    // Forçar atualização imediata da Live Activity (para uso quando luta vai ao vivo)
    func forceLiveActivityUpdate() async {
        print("🚨 Force Live Activity update triggered")
        
        // Buscar dados mais recentes
        do {
            let fetchedEvents = try await fetchEventsFromSupabase()
            await MainActor.run {
                self.events = fetchedEvents
            }
            
            // Atualizar Live Activity imediatamente
            await updateLiveActivityIfNeeded(with: fetchedEvents)
            
            print("✅ Live Activity force update completed")
        } catch {
            print("❌ Error in force Live Activity update: \(error)")
        }
    }
    
    private func fetchCountriesFromSupabase() async throws -> [SupabaseCountry] {
        // Query para countries
        let countriesURLString = "\(supabaseURL)/rest/v1/countries?select=*&order=name.asc"
        
        guard let countriesURL = URL(string: countriesURLString) else {
            throw NetworkError.invalidURL
        }
        
        var countriesRequest = URLRequest(url: countriesURL)
        countriesRequest.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
        countriesRequest.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        countriesRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        countriesRequest.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        print("🌐 Fetching countries from: \(countriesURLString)")
        
        let (countriesData, countriesResponse) = try await URLSession.shared.data(for: countriesRequest)
        
        guard let countriesHttpResponse = countriesResponse as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        print("📡 Countries response status: \(countriesHttpResponse.statusCode)")
        
        guard countriesHttpResponse.statusCode == 200 else {
            let errorString = String(data: countriesData, encoding: .utf8) ?? "Unknown error"
            print("❌ Countries error: \(errorString)")
            throw NetworkError.serverError(countriesHttpResponse.statusCode)
        }
        
        // Decodificar dados
        let supabaseCountries = try JSONDecoder().decode([SupabaseCountry].self, from: countriesData)
        
        print("✅ Loaded \(supabaseCountries.count) countries")
        
        return supabaseCountries
    }

    private func fetchEventsFromSupabase() async throws -> [UFCEvent] {
        // Query otimizada: buscar events com fights em uma única requisição
        let eventsURLString = "\(supabaseURL)/rest/v1/events?select=*,fights(id,eventid,fighter1id,fighter2id,weightclass,fighttype,rounds,timeremaining,status,is_finished,winner_id,winnerid,fightorder,final_round,result_type)&order=date.asc"
        
        guard let eventsURL = URL(string: eventsURLString) else {
            throw NetworkError.invalidURL
        }
        
        var eventsRequest = URLRequest(url: eventsURL)
        eventsRequest.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
        eventsRequest.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        eventsRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        eventsRequest.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        print("🌐 Fetching events from: \(eventsURLString)")
        
        let (eventsData, eventsResponse) = try await URLSession.shared.data(for: eventsRequest)
        
        guard let eventsHttpResponse = eventsResponse as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        print("📡 Events response status: \(eventsHttpResponse.statusCode)")
        
        guard eventsHttpResponse.statusCode == 200 else {
            let errorString = String(data: eventsData, encoding: .utf8) ?? "Unknown error"
            print("❌ Events error: \(errorString)")
            throw NetworkError.serverError(eventsHttpResponse.statusCode)
        }
        
        // Query simplificada: buscar fighters primeiro
        let fightersURLString = "\(supabaseURL)/rest/v1/fighters?select=*&order=name.asc"
        
        guard let fightersURL = URL(string: fightersURLString) else {
            throw NetworkError.invalidURL
        }
        
        var fightersRequest = URLRequest(url: fightersURL)
        fightersRequest.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
        fightersRequest.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        fightersRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        fightersRequest.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        print("🌐 Fetching fighters from: \(fightersURLString)")
        
        let (fightersData, fightersResponse) = try await URLSession.shared.data(for: fightersRequest)
        
        guard let fightersHttpResponse = fightersResponse as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        print("📡 Fighters response status: \(fightersHttpResponse.statusCode)")
        
        guard fightersHttpResponse.statusCode == 200 else {
            let errorString = String(data: fightersData, encoding: .utf8) ?? "Unknown error"
            print("❌ Fighters error: \(errorString)")
            throw NetworkError.serverError(fightersHttpResponse.statusCode)
        }
        
        // Query para countries
        let countriesURLString = "\(supabaseURL)/rest/v1/countries?select=*&order=name.asc"
        
        guard let countriesURL = URL(string: countriesURLString) else {
            throw NetworkError.invalidURL
        }
        
        var countriesRequest = URLRequest(url: countriesURL)
        countriesRequest.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
        countriesRequest.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        countriesRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        countriesRequest.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        print("🌐 Fetching countries from: \(countriesURLString)")
        
        let (countriesData, countriesResponse) = try await URLSession.shared.data(for: countriesRequest)
        
        guard let countriesHttpResponse = countriesResponse as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        print("📡 Countries response status: \(countriesHttpResponse.statusCode)")
        
        guard countriesHttpResponse.statusCode == 200 else {
            let errorString = String(data: countriesData, encoding: .utf8) ?? "Unknown error"
            print("❌ Countries error: \(errorString)")
            throw NetworkError.serverError(countriesHttpResponse.statusCode)
        }
        
        // Decodificar dados
        let supabaseFighters = try JSONDecoder().decode([SupabaseFighter].self, from: fightersData)
        let supabaseCountries = try JSONDecoder().decode([SupabaseCountry].self, from: countriesData)
        
        print("✅ Loaded \(supabaseFighters.count) fighters")
        print("✅ Loaded \(supabaseCountries.count) countries")
        
        // Criar dicionário de countries para lookup rápido
        let countriesDict = Dictionary(uniqueKeysWithValues: supabaseCountries.map { country in
            (country.name, country)
        })
        
        // Criar dicionário de fighters com countries
        let fightersDict = Dictionary(uniqueKeysWithValues: supabaseFighters.map { fighter in
            let countryData = fighter.country.flatMap { countryName in
                countriesDict[countryName]
            }
            
            let fighterWithCountry = SupabaseFighterWithCountry(
                id: fighter.id,
                name: fighter.name,
                nickname: fighter.nickname,
                wins: fighter.wins,
                losses: fighter.losses,
                draws: fighter.draws,
                ranking: fighter.ranking,
                country: fighter.country,
                countries: countryData.map { country in
                    SupabaseFighterWithCountry.CountryData(
                        name: country.name,
                        flagSvg: country.flagSvg
                    )
                }
            )
            
            return (fighter.id, fighterWithCountry)
        })
        
        // Decodificar events
        let supabaseEvents = try JSONDecoder().decode([SupabaseEvent].self, from: eventsData)
        
        print("✅ Loaded \(supabaseEvents.count) events")
        
        // Coletar todas as lutas para cálculo do record
        var allFights: [SupabaseFight] = []
        for event in supabaseEvents {
            if let fights = event.fights {
                allFights.append(contentsOf: fights)
            }
        }
        
        print("✅ Total fights collected: \(allFights.count)")
        
        // Converter para o formato do app
        let events = supabaseEvents.map { event in
            event.toUFCEvent(with: fightersDict, allFights: allFights)
        }
        
        return events
    }
    


    // Remover as funções fetchFlagSvg e fetchAllFlagSvgs que não estão sendo usadas
}

// Modelos para decodificar a resposta do Supabase
struct SupabaseEvent: Codable {
    let id: Int
    let name: String
    let date: String
    let location: String?
    let venue: String?
    let mainEvent: String?
    let status: String?
    let createdAt: String?
    let fights: [SupabaseFight]?
    let image: String? // Adicionando campo image
    
    func toUFCEvent(with fighters: [Int: SupabaseFighterWithCountry], allFights: [SupabaseFight]) -> UFCEvent {
        return UFCEvent(
            id: id,
            name: name,
            date: date,
            location: location,
            venue: venue,
            status: status,
            mainEvent: mainEvent,
            fights: fights?.map { $0.toUFCFight(with: fighters, allFights: allFights) },
            createdAt: createdAt,
            image: image // Adicionando campo image
        )
    }
}

struct SupabaseFight: Codable {
    let id: Int
    let eventid: Int
    let fighter1id: Int
    let fighter2id: Int
    let weightclass: String?
    let fighttype: String?
    let rounds: Int?
    let timeremaining: Int?
    let status: String?
    let isFinished: Bool?
    let is_finished: Bool? // Tentativa com underscore
    let finished: Bool? // Tentativa sem prefixo
    let winnerid: Int?
    let winner_id: Int? // Campo do banco
    let fightorder: Int?
    let final_round: Int?
    let result_type: String?
    let fighter1: SupabaseFighter?
    let fighter2: SupabaseFighter?
    
    func toUFCFight(with fighters: [Int: SupabaseFighterWithCountry], allFights: [SupabaseFight]) -> UFCFight {
        let fighter1Data = fighters[fighter1id]
        let fighter2Data = fighters[fighter2id]
        
        // Determinar o status correto baseado em isFinished
        let finalStatus: String
        let isActuallyFinished = isFinished == true || is_finished == true || finished == true
        
        if isActuallyFinished {
            finalStatus = "finished"
        } else {
            finalStatus = status ?? "scheduled"
        }
        
        // Determinar o winner ID (pode estar em winnerid ou winner_id)
        let finalWinnerId = winnerid ?? winner_id
        
        let ufcFight = UFCFight(
            id: id,
            fighter1: fighter1Data?.toUFCFighter(with: allFights) ?? UFCFighter(id: fighter1id, name: "Unknown", nickname: nil, record: nil, photo: nil, ranking: nil),
            fighter2: fighter2Data?.toUFCFighter(with: allFights) ?? UFCFighter(id: fighter2id, name: "Unknown", nickname: nil, record: nil, photo: nil, ranking: nil),
            weightClass: weightclass ?? "",
            fightType: fighttype,
            rounds: rounds ?? 3,
            status: finalStatus,
            roundTime: timeremaining ?? 300,
            winner: finalWinnerId != nil ? String(finalWinnerId!) : nil,
            method: nil,
            fightOrder: fightorder,
            finalRound: final_round,
            resultType: result_type
        )
        
        // Debug: Log da conversão apenas para lutas com vencedor
        if let finalWinnerId = finalWinnerId, finalWinnerId != -1 {
            print("🔍 Debug: Converting fight ID \(id) - Status: '\(finalStatus)', WinnerID: \(finalWinnerId) -> Winner: '\(ufcFight.winner ?? "nil")', IsFinished: \(ufcFight.isFinished)")
        }
        
        return ufcFight
    }
}

struct SupabaseFighter: Codable {
    let id: Int
    let name: String
    let nickname: String?
    let wins: Int?
    let losses: Int?
    let draws: Int?
    let ranking: String?
    let country: String?
}

struct SupabaseFighterWithCountry: Codable {
    let id: Int
    let name: String
    let nickname: String?
    let wins: Int?
    let losses: Int?
    let draws: Int?
    let ranking: String?
    let country: String?
    let countries: CountryData?
    
    struct CountryData: Codable {
        let name: String
        let flagSvg: String?
        
        enum CodingKeys: String, CodingKey {
            case name
            case flagSvg = "flag_svg"
        }
    }
    
    func toUFCFighter(with allFights: [SupabaseFight] = []) -> UFCFighter {
        // Calcular record manual
        let manualWins = wins ?? 0
        let manualLosses = losses ?? 0
        let manualDraws = draws ?? 0
        
        // Calcular record das lutas
        var fightWins = 0
        var fightLosses = 0
        let fightDraws = 0 // Por enquanto, não temos draws nas lutas
        
        for fight in allFights {
            if fight.fighter1id == id {
                if let winnerId = fight.winnerid, winnerId == id {
                    fightWins += 1
                } else if let winnerId = fight.winnerid, winnerId != -1 {
                    fightLosses += 1
                }
            } else if fight.fighter2id == id {
                if let winnerId = fight.winnerid, winnerId == id {
                    fightWins += 1
                } else if let winnerId = fight.winnerid, winnerId != -1 {
                    fightLosses += 1
                }
            }
        }
        
        // Usar o maior entre manual e fight
        let totalWins = max(manualWins, fightWins)
        let totalLosses = max(manualLosses, fightLosses)
        let totalDraws = manualDraws + fightDraws
        
        let calculatedRecord = "\(totalWins)-\(totalLosses)-\(totalDraws)"
        
        let country = self.country
        let flagSvg = self.countries?.flagSvg // Pegar o SVG do JOIN
        
        return UFCFighter(
            id: id,
            name: name,
            nickname: nickname,
            record: calculatedRecord,
            photo: nil,
            ranking: ranking,
            country: country,
            flagSvg: flagSvg
        )
    }
}

struct SupabaseCountry: Codable {
    let name: String
    let flagSvg: String?
    
    enum CodingKeys: String, CodingKey {
        case name
        case flagSvg = "flag_svg"
    }
}

enum NetworkError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(Int)
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response"
        case .serverError(let code):
            return "Server error: \(code)"
        case .decodingError:
            return "Failed to decode response"
        }
    }
} 