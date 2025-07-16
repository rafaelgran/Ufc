import Foundation

class UFCEventService: ObservableObject {
    private let baseURL = "http://localhost:3000/api"
    private let session: URLSession
    
    @Published var events: [UFCEvent] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 10
        config.timeoutIntervalForResource = 10
        self.session = URLSession(configuration: config)
    }
    
    @MainActor
    func fetchUpcomingEvents() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let events = try await fetchEventsFromAPI()
            self.events = events.filter { $0.isUpcoming }.sorted { event1, event2 in
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
                let date1 = formatter.date(from: event1.date) ?? Date.distantFuture
                let date2 = formatter.date(from: event2.date) ?? Date.distantFuture
                return date1 < date2
            }
        } catch {
            print("Error fetching events: \(error.localizedDescription)")
            self.events = createMockEvents()
            self.errorMessage = "Erro ao carregar eventos. Usando dados de exemplo."
        }
        
        isLoading = false
    }
    
    private func fetchEventsFromAPI() async throws -> [UFCEvent] {
        guard let url = URL(string: "\(baseURL)/export") else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        
        guard httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode([UFCEvent].self, from: data)
    }
    
    private func createMockEvents() -> [UFCEvent] {
        let mockFighter1 = UFCFighter(
            id: "1",
            name: "Merab Dvalishvili",
            nickname: "The Machine",
            record: "17-4-0",
            photo: nil
        )
        
        let mockFighter2 = UFCFighter(
            id: "2",
            name: "Sean O'Malley",
            nickname: "Sugar",
            record: "17-1-0",
            photo: nil
        )
        
        let mockFight = UFCFight(
            id: "1",
            fighter1: mockFighter1,
            fighter2: mockFighter2,
            weightClass: "Bantamweight",
            rounds: 5,
            status: "scheduled",
            currentRound: 1,
            roundTime: "05:00",
            winner: nil,
            method: nil
        )
        
        let futureDate = Calendar.current.date(byAdding: .day, value: 17, to: Date()) ?? Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        
        return [
            UFCEvent(
                id: "1",
                name: "UFC 316",
                date: formatter.string(from: futureDate),
                location: "Newark, NJ - United States",
                venue: "Prudential Center",
                status: "scheduled",
                mainEvent: "Merab Dvalishvili vs Sean O'Malley",
                fights: [mockFight],
                createdAt: nil
            ),
            UFCEvent(
                id: "2",
                name: "UFC Fight Night",
                date: formatter.string(from: Calendar.current.date(byAdding: .day, value: 21, to: Date()) ?? Date()),
                location: "Las Vegas, NV - United States",
                venue: "UFC APEX",
                status: "scheduled",
                mainEvent: "Ian Garry vs Carlos Prates",
                fights: [],
                createdAt: nil
            )
        ]
    }
} 