import Foundation

class UFCEventService {
    private let apiKey: String
    private let session: URLSession
    
    init(apiKey: String) {
        self.apiKey = apiKey
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 30
        self.session = URLSession(configuration: config)
    }
    
    func fetchUpcomingEvents() async throws -> [UFCEvent] {
        do {
            print("Starting API request...")
            let events = try await fetchEventsFromAPI()
            print("API request successful")
            return events
        } catch {
            print("Error fetching events: \(error.localizedDescription)")
            return createMockEvents()
        }
    }
    
    private func fetchEventsFromAPI() async throws -> [UFCEvent] {
        guard let url = URL(string: "https://v3.api-sports.io/mma/events") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.setValue(apiKey, forHTTPHeaderField: "x-apisports-key")
        request.setValue("v3.api-sports.io", forHTTPHeaderField: "x-apisports-host")
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        
        guard httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        // For debugging
        if let responseString = String(data: data, encoding: .utf8) {
            print("API Response: \(responseString)")
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let apiResponse = try decoder.decode(APIResponse.self, from: data)
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
        
        return apiResponse.response
            .map { event in
                let dateString = "\(event.date) \(event.time ?? "00:00:00")"
                let date = dateFormatter.date(from: dateString) ?? Date()
                
                return UFCEvent(
                    id: String(event.id),
                    title: event.name,
                    mainEvent: event.mainEvent,
                    date: date,
                    venue: event.venue?.name ?? "TBA",
                    location: formatLocation(city: event.venue?.city, country: event.venue?.country),
                    eventType: event.name.lowercased().contains("fight night") ? .fightNight : .ppv
                )
            }
            .filter { $0.date > Date() }
            .sorted { $0.date < $1.date }
    }
    
    private func formatLocation(city: String?, country: String?) -> String {
        let components = [city, country].compactMap { $0 }
        return components.isEmpty ? "Location TBA" : components.joined(separator: ", ")
    }
    
    private func createMockEvents() -> [UFCEvent] {
        print("Using mock events")
        return [
            UFCEvent(
                id: "1",
                title: "UFC 316",
                mainEvent: "Merab Dvalishvili vs Sean O'Malley",
                date: Date().addingTimeInterval(86400 * 17),
                venue: "Prudential Center",
                location: "Newark, NJ - United States",
                eventType: .ppv
            ),
            UFCEvent(
                id: "2",
                title: "UFC Fight Night",
                mainEvent: "Ian Garry vs Carlos Prates",
                date: Date().addingTimeInterval(86400 * 21),
                venue: "UFC APEX",
                location: "Las Vegas, NV - United States",
                eventType: .fightNight
            ),
            UFCEvent(
                id: "3",
                title: "UFC Fight Night",
                mainEvent: "Brendon Royval vs Manel Kape",
                date: Date().addingTimeInterval(86400 * 28),
                venue: "UFC APEX",
                location: "Las Vegas, NV - United States",
                eventType: .fightNight
            )
        ]
    }
}

// MARK: - API Response Types
private struct APIResponse: Codable {
    let response: [Event]
    
    struct Event: Codable {
        let id: Int
        let name: String
        let date: String
        let time: String?
        let mainEvent: String
        let venue: Venue?
        
        struct Venue: Codable {
            let name: String?
            let city: String?
            let country: String?
        }
        
        enum CodingKeys: String, CodingKey {
            case id, name, date, time, venue
            case mainEvent = "main_event"
        }
    }
}

// API response models (commented out for now)
/*
private struct APIResponse: Codable {
    let events: [APIEvent]
    
    enum CodingKeys: String, CodingKey {
        case events = "response"
    }
}

private struct APIEvent: Codable {
    let id: Int
    let name: String
    let date: Date
    let venue: String
    let city: String
    let country: String
    let mainEvent: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case date
        case venue
        case city
        case country
        case mainEvent = "main_event"
    }
}
*/ 