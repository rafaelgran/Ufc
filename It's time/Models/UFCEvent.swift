import Foundation

struct UFCEvent: Identifiable, Codable {
    let id: String
    let name: String
    let date: String
    let location: String?
    let venue: String?
    let status: String
    let mainEvent: String?
    let fights: [UFCFight]
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, date, location, venue, status, mainEvent, fights
        case createdAt = "created_at"
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        if let date = formatter.date(from: self.date) {
            formatter.dateFormat = "MMMM d, yyyy"
            return formatter.string(from: date)
        }
        return self.date
    }
    
    var timeRemaining: (days: Int, hours: Int, minutes: Int) {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        guard let eventDate = formatter.date(from: self.date) else {
            return (0, 0, 0)
        }
        
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day, .hour, .minute], from: Date(), to: eventDate)
        return (
            days: components.day ?? 0,
            hours: components.hour ?? 0,
            minutes: components.minute ?? 0
        )
    }
    
    var isUpcoming: Bool {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        guard let eventDate = formatter.date(from: self.date) else {
            return false
        }
        return eventDate > Date()
    }
}

struct UFCFight: Identifiable, Codable {
    let id: String
    let fighter1: UFCFighter
    let fighter2: UFCFighter
    let weightClass: String
    let rounds: Int
    let status: String
    let currentRound: Int
    let roundTime: String
    let winner: String?
    let method: String?
    
    var isLive: Bool {
        return status == "live"
    }
    
    var isFinished: Bool {
        return status == "finished"
    }
    
    var isScheduled: Bool {
        return status == "scheduled"
    }
}

struct UFCFighter: Identifiable, Codable {
    let id: String
    let name: String
    let nickname: String?
    let record: String?
    let photo: String?
} 