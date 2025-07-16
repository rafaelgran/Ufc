import Foundation

struct UFCEvent: Identifiable, Codable {
    let id: String
    let title: String
    let mainEvent: String
    let date: Date
    let venue: String
    let location: String
    var eventType: EventType
    
    enum EventType: String, Codable {
        case ppv = "PPV"
        case fightNight = "UFC Fight Night"
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM d"
        return formatter.string(from: date)
    }
    
    var timeRemaining: (days: Int, hours: Int, minutes: Int) {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day, .hour, .minute], from: Date(), to: date)
        return (
            days: components.day ?? 0,
            hours: components.hour ?? 0,
            minutes: components.minute ?? 0
        )
    }
} 