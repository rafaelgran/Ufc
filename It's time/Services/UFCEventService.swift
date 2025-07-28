import Foundation
import SwiftUI

class UFCEventService: ObservableObject {
    @Published var events: [UFCEvent] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // Supabase configuration
    private let supabaseURL = "https://igxztpjrojdmyzzhqxsv.supabase.co" // Substitua pela sua URL
    private let supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU" // Substitua pela sua key
    
    init() {
        Task {
            await fetchEvents()
        }
    }
    
    @MainActor
    func fetchEvents() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let events = try await fetchEventsFromSupabase()
            self.events = events
            print("✅ Fetched \(events.count) events from Supabase")
        } catch {
            errorMessage = error.localizedDescription
            print("❌ Error fetching events: \(error)")
        }
        
        isLoading = false
    }
    
    private func fetchEventsFromSupabase() async throws -> [UFCEvent] {
        // Primeiro, buscar events com fights
        let eventsURLString = "\(supabaseURL)/rest/v1/events?select=*,fights(*)&order=date.asc"
        
        guard let eventsURL = URL(string: eventsURLString) else {
            throw NetworkError.invalidURL
        }
        
        var eventsRequest = URLRequest(url: eventsURL)
        eventsRequest.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
        eventsRequest.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        eventsRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        eventsRequest.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        print("🌐 Fetching events from Supabase: \(eventsURLString)")
        
        let (eventsData, eventsResponse) = try await URLSession.shared.data(for: eventsRequest)
        
        guard let eventsHttpResponse = eventsResponse as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        print("📡 Events response status: \(eventsHttpResponse.statusCode)")
        
        guard eventsHttpResponse.statusCode == 200 else {
            print("❌ Events error: \(String(data: eventsData, encoding: .utf8) ?? "Unknown error")")
            throw NetworkError.serverError(eventsHttpResponse.statusCode)
        }
        
        // Depois, buscar fighters
        let fightersURLString = "\(supabaseURL)/rest/v1/fighters?select=*"
        
        guard let fightersURL = URL(string: fightersURLString) else {
            throw NetworkError.invalidURL
        }
        
        var fightersRequest = URLRequest(url: fightersURL)
        fightersRequest.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
        fightersRequest.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        fightersRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        fightersRequest.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        print("🌐 Fetching fighters from Supabase: \(fightersURLString)")
        
        let (fightersData, fightersResponse) = try await URLSession.shared.data(for: fightersRequest)
        
        guard let fightersHttpResponse = fightersResponse as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        print("📡 Fighters response status: \(fightersHttpResponse.statusCode)")
        
        guard fightersHttpResponse.statusCode == 200 else {
            print("❌ Fighters error: \(String(data: fightersData, encoding: .utf8) ?? "Unknown error")")
            throw NetworkError.serverError(fightersHttpResponse.statusCode)
        }
        
        print("📦 Received \(eventsData.count) bytes for events and \(fightersData.count) bytes for fighters")
        
        // Decodificar fighters
        let supabaseFighters = try JSONDecoder().decode([SupabaseFighter].self, from: fightersData)
        
        // Criar um dicionário para lookup rápido
        let fightersDict = Dictionary(uniqueKeysWithValues: supabaseFighters.map { ($0.id, $0) })
        
        // Decodificar events
        let supabaseEvents = try JSONDecoder().decode([SupabaseEvent].self, from: eventsData)
        
        // Converter para o formato do app, incluindo os fighters
        return supabaseEvents.map { event in
            event.toUFCEvent(with: fightersDict)
        }
    }
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
    
    func toUFCEvent(with fighters: [Int: SupabaseFighter]) -> UFCEvent {
        return UFCEvent(
            id: id,
            name: name,
            date: date,
            location: location,
            venue: venue,
            status: status,
            mainEvent: mainEvent,
            fights: fights?.map { $0.toUFCFight(with: fighters) },
            createdAt: createdAt
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
    let winnerid: Int?
    let fightorder: Int?
    let fighter1: SupabaseFighter?
    let fighter2: SupabaseFighter?
    
    func toUFCFight(with fighters: [Int: SupabaseFighter]) -> UFCFight {
        let fighter1Data = fighters[fighter1id]
        let fighter2Data = fighters[fighter2id]
        
        return UFCFight(
            id: id,
            fighter1: fighter1Data?.toUFCFighter() ?? UFCFighter(id: fighter1id, name: "Unknown", nickname: nil, record: nil, photo: nil, ranking: nil),
            fighter2: fighter2Data?.toUFCFighter() ?? UFCFighter(id: fighter2id, name: "Unknown", nickname: nil, record: nil, photo: nil, ranking: nil),
            weightClass: weightclass ?? "",
            fightType: fighttype,
            rounds: rounds ?? 3,
            status: status ?? "scheduled",
            roundTime: timeremaining ?? 300,
            winner: winnerid != nil ? String(winnerid!) : nil,
            method: nil
        )
    }
}

struct SupabaseFighter: Codable {
    let id: Int
    let name: String
    let nickname: String?
    let record: String?
    let weightclass: String?
    let ranking: String?
    let wins: Int?
    let losses: Int?
    let draws: Int?
    
    func toUFCFighter() -> UFCFighter {
        return UFCFighter(
            id: id,
            name: name,
            nickname: nickname,
            record: record,
            photo: nil, // Supabase não tem campo photo
            ranking: ranking
        )
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