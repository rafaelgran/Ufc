import Foundation

struct UFCEvent: Identifiable, Codable {
    let id: Int
    let name: String
    let date: String
    let location: String?
    let venue: String?
    let status: String?
    let mainEvent: String?
    let fights: [UFCFight]?
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, date, location, venue, status, mainEvent, fights
        case createdAt = "created_at"
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        
        // Configure timezone para GMT-3 (horário de Brasília)
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        
        // Try multiple date formats
        let dateFormats = [
            "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
            "yyyy-MM-dd'T'HH:mm:ssZ",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm",
            "yyyy-MM-dd HH:mm:ss"
        ]
        
        for format in dateFormats {
            formatter.dateFormat = format
            if let date = formatter.date(from: self.date) {
                let displayFormatter = DateFormatter()
                displayFormatter.dateFormat = "MMMM d, yyyy"
                displayFormatter.locale = Locale(identifier: "pt_BR")
                return displayFormatter.string(from: date)
            }
        }
        
        // If all formats fail, return the original date
        return self.date
    }
    
    var timeRemaining: (days: Int, hours: Int, minutes: Int) {
        let formatter = DateFormatter()
        
        // Configure timezone para GMT-3 (horário de Brasília)
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        
        // Try multiple date formats
        let dateFormats = [
            "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
            "yyyy-MM-dd'T'HH:mm:ssZ",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm",
            "yyyy-MM-dd HH:mm:ss"
        ]
        
        for format in dateFormats {
            formatter.dateFormat = format
            if let eventDate = formatter.date(from: self.date) {
                let calendar = Calendar.current
                let components = calendar.dateComponents([.day, .hour, .minute], from: Date(), to: eventDate)
                return (
                    days: components.day ?? 0,
                    hours: components.hour ?? 0,
                    minutes: components.minute ?? 0
                )
            }
        }
        
        return (0, 0, 0)
    }
    
    var isUpcoming: Bool {
        let formatter = DateFormatter()
        
        // Configure timezone para GMT-3 (horário de Brasília)
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        
        // Try multiple date formats
        let dateFormats = [
            "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
            "yyyy-MM-dd'T'HH:mm:ssZ",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm",
            "yyyy-MM-dd HH:mm:ss"
        ]
        
        for format in dateFormats {
            formatter.dateFormat = format
            if let eventDate = formatter.date(from: self.date) {
                let isUpcoming = eventDate > Date()
                // print("📅 Event: \(self.name), Date: \(self.date), Parsed: \(eventDate), IsUpcoming: \(isUpcoming)")
                return isUpcoming
            }
        }
        
        // print("❌ Could not parse date for event: \(self.name), Date string: \(self.date)")
        return false
    }
    
    var statusOrDefault: String {
        return status ?? "upcoming"
    }
    
    var fightsCount: Int {
        return fights?.count ?? 0
    }
}

struct UFCFight: Identifiable, Codable {
    let id: Int
    let fighter1: UFCFighter
    let fighter2: UFCFighter
    let weightClass: String
    let fightType: String?
    let rounds: Int
    let status: String
    let roundTime: Int
    let winner: String?
    let method: String?
    
    enum CodingKeys: String, CodingKey {
        case id, fighter1, fighter2, weightClass, status
        case fightType = "fighttype"
        case rounds = "rounds"
        case roundTime = "timeRemaining"
        case winner = "winnerId"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        fighter1 = try container.decode(UFCFighter.self, forKey: .fighter1)
        fighter2 = try container.decode(UFCFighter.self, forKey: .fighter2)
        weightClass = try container.decode(String.self, forKey: .weightClass)
        fightType = try container.decodeIfPresent(String.self, forKey: .fightType)
        rounds = try container.decode(Int.self, forKey: .rounds)
        status = try container.decode(String.self, forKey: .status)
        roundTime = try container.decode(Int.self, forKey: .roundTime)
        method = nil // API doesn't send this field
        
        // Handle winnerId which can be null or an integer
        if let winnerId = try container.decodeIfPresent(Int.self, forKey: .winner) {
            winner = String(winnerId)
        } else {
            winner = nil
        }
    }
    
    init(id: Int, fighter1: UFCFighter, fighter2: UFCFighter, weightClass: String, fightType: String?, rounds: Int, status: String, roundTime: Int, winner: String?, method: String?) {
        self.id = id
        self.fighter1 = fighter1
        self.fighter2 = fighter2
        self.weightClass = weightClass
        self.fightType = fightType
        self.rounds = rounds
        self.status = status
        self.roundTime = roundTime
        self.winner = winner
        self.method = method
    }
    
    var isLive: Bool {
        return status == "live"
    }
    
    var isFinished: Bool {
        return status == "finished"
    }
    
    var isScheduled: Bool {
        return status == "scheduled"
    }
    
    var formattedRoundTime: String {
        let minutes = roundTime / 60
        let seconds = roundTime % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
    
    var isChampionship: Bool {
        return fighter1.isChampion || fighter2.isChampion
    }
    
    var isMainEvent: Bool {
        return fightType == "main"
    }
    
    var isPrelim: Bool {
        return fightType == "prelim"
    }
}

struct UFCFighter: Identifiable, Codable {
    let id: Int
    let name: String
    let nickname: String?
    let record: String?
    let photo: String?
    let ranking: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, nickname, record, photo, ranking
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        nickname = try container.decodeIfPresent(String.self, forKey: .nickname)
        record = try container.decodeIfPresent(String.self, forKey: .record)
        photo = try container.decodeIfPresent(String.self, forKey: .photo)
        ranking = try container.decodeIfPresent(String.self, forKey: .ranking)
    }
    
    init(id: Int, name: String, nickname: String?, record: String?, photo: String?, ranking: String?) {
        self.id = id
        self.name = name
        self.nickname = nickname
        self.record = record
        self.photo = photo
        self.ranking = ranking
    }
    
    var isChampion: Bool {
        return ranking == "C"
    }
} 