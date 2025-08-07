import Foundation
import SwiftUI

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
    let image: String? // Campo para URL da imagem do evento
    
    enum CodingKeys: String, CodingKey {
        case id, name, date, location, venue, status, mainEvent, fights, image
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
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm" // Adicionando formato que estava faltando
        ]
        
        for format in dateFormats {
            formatter.dateFormat = format
            if let eventDate = formatter.date(from: self.date) {
                let currentDate = Date()
                
                // Evento é considerado "upcoming" se ainda não passou 12 horas desde o início
                let twelveHoursAfterEvent = eventDate.addingTimeInterval(12 * 60 * 60) // 12 horas em segundos
                let isUpcoming = twelveHoursAfterEvent > currentDate
                
                print("📅 Event: \(self.name), Date: \(self.date), Parsed: \(eventDate), Current: \(currentDate), TwelveHoursAfter: \(twelveHoursAfterEvent), IsUpcoming: \(isUpcoming)")
                return isUpcoming
            }
        }
        
        print("❌ Could not parse date for event: \(self.name), Date string: \(self.date)")
        return false
    }
    
    var isLive: Bool {
        let formatter = DateFormatter()
        
        // Configure timezone para GMT-3 (horário de Brasília)
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        
        // Try multiple date formats
        let dateFormats = [
            "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
            "yyyy-MM-dd'T'HH:mm:ssZ",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm"
        ]
        
        for format in dateFormats {
            formatter.dateFormat = format
            if let eventDate = formatter.date(from: self.date) {
                let currentDate = Date()
                
                // Evento está "live" se já iniciou mas ainda não passou 12 horas
                let twelveHoursAfterEvent = eventDate.addingTimeInterval(12 * 60 * 60) // 12 horas em segundos
                let isLive = currentDate >= eventDate && currentDate < twelveHoursAfterEvent
                
                return isLive
            }
        }
        
        return false
    }
    
    var statusOrDefault: String {
        return status ?? "upcoming"
    }
    
    var fightsCount: Int {
        return fights?.count ?? 0
    }
    
    var mainEventFights: [UFCFight] {
        let mainEvents = fights?.filter { $0.isMainEvent } ?? []
        // Sort by fightOrder if available, otherwise keep original order
        return mainEvents.sorted { fight1, fight2 in
            // If both have fightOrder, sort by it
            if let order1 = fight1.fightOrder, let order2 = fight2.fightOrder {
                return order1 < order2
            }
            // If only one has fightOrder, prioritize the one with order
            if fight1.fightOrder != nil {
                return true
            }
            if fight2.fightOrder != nil {
                return false
            }
            // If neither has fightOrder, keep original order
            return true
        }
    }
    
    var firstMainEventFight: UFCFight? {
        return mainEventFights.first
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
    let fightOrder: Int?
    let finalRound: Int?
    let resultType: String?
    
    enum CodingKeys: String, CodingKey {
        case id, fighter1, fighter2, weightClass, status
        case fightType = "fighttype"
        case rounds = "rounds"
        case roundTime = "timeRemaining"
        case winner = "winnerId"
        case fightOrder = "fightorder"
        case finalRound = "final_round"
        case resultType = "result_type"
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
        fightOrder = try container.decodeIfPresent(Int.self, forKey: .fightOrder)
        method = nil // API doesn't send this field
        finalRound = try container.decodeIfPresent(Int.self, forKey: .finalRound)
        resultType = try container.decodeIfPresent(String.self, forKey: .resultType)
        
        // Handle winnerId which can be null or an integer
        if let winnerId = try container.decodeIfPresent(Int.self, forKey: .winner) {
            winner = String(winnerId)
        } else {
            winner = nil
        }
    }
    
    init(id: Int, fighter1: UFCFighter, fighter2: UFCFighter, weightClass: String, fightType: String?, rounds: Int, status: String, roundTime: Int, winner: String?, method: String?, fightOrder: Int? = nil, finalRound: Int? = nil, resultType: String? = nil) {
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
        self.fightOrder = fightOrder
        self.finalRound = finalRound
        self.resultType = resultType
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
    let country: String?
    let flagSvg: String? // Added for SVG flag
    
    enum CodingKeys: String, CodingKey {
        case id, name, nickname, record, photo, ranking, country, flagSvg
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        nickname = try container.decodeIfPresent(String.self, forKey: .nickname)
        record = try container.decodeIfPresent(String.self, forKey: .record)
        photo = try container.decodeIfPresent(String.self, forKey: .photo)
        ranking = try container.decodeIfPresent(String.self, forKey: .ranking)
        country = try container.decodeIfPresent(String.self, forKey: .country)
        flagSvg = try container.decodeIfPresent(String.self, forKey: .flagSvg)
    }
    
    init(id: Int, name: String, nickname: String?, record: String?, photo: String?, ranking: String?, country: String? = nil, flagSvg: String? = nil) {
        self.id = id
        self.name = name
        self.nickname = nickname
        self.record = record
        self.photo = photo
        self.ranking = ranking
        self.country = country
        self.flagSvg = flagSvg
    }
    

    
    var isChampion: Bool {
        return ranking == "C"
    }
    
    // Função para obter o emoji da bandeira do país (fallback)
    var countryFlag: String {
        guard let country = country else { return "" }
        
        // Mapeamento de países para emojis de bandeira (fallback)
        let countryToFlag: [String: String] = [
            "United States": "🇺🇸",
            "Brazil": "🇧🇷",
            "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
            "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
            "Ireland": "🇮🇪",
            "Canada": "🇨🇦",
            "Australia": "🇦🇺",
            "New Zealand": "🇳🇿",
            "South Africa": "🇿🇦",
            "Nigeria": "🇳🇬",
            "Ghana": "🇬🇭",
            "Cameroon": "🇨🇲",
            "Morocco": "🇲🇦",
            "Tunisia": "🇹🇳",
            "Algeria": "🇩🇿",
            "Egypt": "🇪🇬",
            "Kenya": "🇰🇪",
            "Uganda": "🇺🇬",
            "Tanzania": "🇹🇿",
            "Ethiopia": "🇪🇹",
            "Somalia": "🇸🇴",
            "Sudan": "🇸🇩",
            "South Sudan": "🇸🇸",
            "Eritrea": "🇪🇷",
            "Djibouti": "🇩🇯",
            "Comoros": "🇰🇲",
            "United Arab Emirates": "🇦🇪",
            "Madagascar": "🇲🇬",
            "Mauritius": "🇲🇺",
            "Seychelles": "🇸🇨",
            "Reunion": "🇷🇪",
            "Mayotte": "🇾🇹",
            "France": "🇫🇷",
            "Germany": "🇩🇪",
            "Italy": "🇮🇹",
            "Spain": "🇪🇸",
            "Portugal": "🇵🇹",
            "Netherlands": "🇳🇱",
            "Belgium": "🇧🇪",
            "Switzerland": "🇨🇭",
            "Austria": "🇦🇹",
            "Sweden": "🇸🇪",
            "Norway": "🇳🇴",
            "Denmark": "🇩🇰",
            "Finland": "🇫🇮",
            "Iceland": "🇮🇸",
            "Poland": "🇵🇱",
            "Czech Republic": "🇨🇿",
            "Slovakia": "🇸🇰",
            "Hungary": "🇭🇺",
            "Romania": "🇷🇴",
            "Bulgaria": "🇧🇬",
            "Greece": "🇬🇷",
            "Croatia": "🇭🇷",
            "Slovenia": "🇸🇮",
            "Serbia": "🇷🇸",
            "Bosnia and Herzegovina": "🇧🇦",
            "Montenegro": "🇲🇪",
            "Albania": "🇦🇱",
            "North Macedonia": "🇲🇰",
            "Kosovo": "🇽🇰",
            "Moldova": "🇲🇩",
            "Ukraine": "🇺🇦",
            "Belarus": "🇧🇾",
            "Lithuania": "🇱🇹",
            "Latvia": "🇱🇻",
            "Estonia": "🇪🇪",
            "Russia": "🇷🇺",
            "Georgia": "🇬🇪",
            "Armenia": "🇦🇲",
            "Azerbaijan": "🇦🇿",
            "Turkey": "🇹🇷",
            "Cyprus": "🇨🇾",
            "Malta": "🇲🇹",
            "Israel": "🇮🇱",
            "Lebanon": "🇱🇧",
            "Syria": "🇸🇾",
            "Jordan": "🇯🇴",
            "Iraq": "🇮🇶",
            "Iran": "🇮🇷",
            "Afghanistan": "🇦🇫",
            "Pakistan": "🇵🇰",
            "Uzbekistan": "🇺🇿",
            "India": "🇮🇳",
            "Bangladesh": "🇧🇩",
            "Sri Lanka": "🇱🇰",
            "Nepal": "🇳🇵",
            "Bhutan": "🇧🇹",
            "Maldives": "🇲🇻",
            "China": "🇨🇳",
            "Japan": "🇯🇵",
            "South Korea": "🇰🇷",
            "North Korea": "🇰🇵",
            "Taiwan": "🇹🇼",
            "Hong Kong": "🇭🇰",
            "Macau": "🇲🇴",
            "Mongolia": "🇲🇳",
            "Vietnam": "🇻🇳",
            "Laos": "🇱🇦",
            "Cambodia": "🇰🇭",
            "Thailand": "🇹🇭",
            "Myanmar": "🇲🇲",
            "Malaysia": "🇲🇾",
            "Singapore": "🇸🇬",
            "Indonesia": "🇮🇩",
            "Philippines": "🇵🇭",
            "Brunei": "🇧🇳",
            "East Timor": "🇹🇱",
            "Papua New Guinea": "🇵🇬",
            "Fiji": "🇫🇯",
            "Vanuatu": "🇻🇺",
            "New Caledonia": "🇳🇨",
            "Solomon Islands": "🇸🇧",
            "Kiribati": "🇰🇮",
            "Tuvalu": "🇹🇻",
            "Nauru": "🇳🇷",
            "Palau": "🇵🇼",
            "Marshall Islands": "🇲🇭",
            "Micronesia": "🇫🇲",
            "Guam": "🇬🇺",
            "Northern Mariana Islands": "🇲🇵",
            "American Samoa": "🇦🇸",
            "Cook Islands": "🇨🇰",
            "Niue": "🇳🇺",
            "Tokelau": "🇹🇰",
            "Wallis and Futuna": "🇼🇫",
            "French Polynesia": "🇵🇫",
            "Pitcairn": "🇵🇳",
            "Mexico": "🇲🇽",
            "Guatemala": "🇬🇹",
            "Belize": "🇧🇿",
            "El Salvador": "🇸🇻",
            "Honduras": "🇭🇳",
            "Nicaragua": "🇳🇮",
            "Costa Rica": "🇨🇷",
            "Panama": "🇵🇦",
            "Colombia": "🇨🇴",
            "Venezuela": "🇻🇪",
            "Guyana": "🇬🇾",
            "Suriname": "🇸🇷",
            "French Guiana": "🇬🇫",
            "Ecuador": "🇪🇨",
            "Peru": "🇵🇪",
            "Bolivia": "🇧🇴",
            "Paraguay": "🇵🇾",
            "Uruguay": "🇺🇾",
            "Argentina": "🇦🇷",
            "Chile": "🇨🇱",
            "Falkland Islands": "🇫🇰",
            "South Georgia": "🇬🇸",
            "Antarctica": "🇦🇶",
            "Cuba": "🇨🇺",
            "Jamaica": "🇯🇲",
            "Haiti": "🇭🇹",
            "Dominican Republic": "🇩🇴",
            "Puerto Rico": "🇵🇷",
            "U.S. Virgin Islands": "🇻🇮",
            "British Virgin Islands": "🇻🇬",
            "Anguilla": "🇦🇮",
            "Saint Kitts and Nevis": "🇰🇳",
            "Antigua and Barbuda": "🇦🇬",
            "Montserrat": "🇲🇸",
            "Guadeloupe": "🇬🇵",
            "Martinique": "🇲🇶",
            "Saint Lucia": "🇱🇨",
            "Saint Vincent and the Grenadines": "🇻🇨",
            "Barbados": "🇧🇧",
            "Grenada": "🇬🇩",
            "Trinidad and Tobago": "🇹🇹",
            "Dominica": "🇩🇲",
            "Saint Martin": "🇲🇫",
            "Sint Maarten": "🇸🇽",
            "Saint Barthélemy": "🇧🇱",
            "Aruba": "🇦🇼",
            "Curaçao": "🇨🇼",
            "Bonaire": "🇧🇶",
            "Sint Eustatius": "🇧🇶",
            "Saba": "🇧🇶"
        ]
        
        return countryToFlag[country] ?? ""
    }
    
    // Função para obter o SVG da bandeira
    var countryFlagSvg: String? {
        return flagSvg
    }
} 