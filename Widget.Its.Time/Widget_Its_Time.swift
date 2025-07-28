//
//  Widget_Its_Time.swift
//  Widget.Its.Time
//
//  Created by Rafael Granemann on 24/07/25.
//

import WidgetKit
import SwiftUI
import CoreText

// MARK: - Font Registration for Widget
struct WidgetFonts {
    static func registerFonts() {
        registerFont(named: "Rajdhani-Regular")
        registerFont(named: "Rajdhani-Bold")
        registerFont(named: "Rajdhani-Medium")
    }
    
    private static func registerFont(named fontName: String) {
        guard let fontURL = Bundle.main.url(forResource: fontName, withExtension: "ttf") else {
            print("⚠️ Widget: Font file not found: \(fontName).ttf")
            return
        }
        
        var error: Unmanaged<CFError>?
        if CTFontManagerRegisterFontsForURL(fontURL as CFURL, .process, &error) {
            print("✅ Widget: Successfully registered font: \(fontName)")
        } else {
            if let error = error?.takeRetainedValue() {
                print("❌ Widget: Failed to register font \(fontName): \(error)")
            } else {
                print("❌ Widget: Failed to register font \(fontName): Unknown error")
            }
        }
    }
}

extension Font {
    static func rajdhani(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        switch weight {
        case .bold:
            return .custom("Rajdhani-Bold", size: size)
        case .medium:
            return .custom("Rajdhani-Medium", size: size)
        default:
            return .custom("Rajdhani-Regular", size: size)
        }
    }
}

// MARK: - Widget Data Model
struct WidgetEventData {
    let eventName: String
    let fighter1Name: String
    let fighter2Name: String
    let eventDate: Date
    let daysRemaining: Int
    let hoursRemaining: Int
    let minutesRemaining: Int
}

// MARK: - Widget Entry
struct UFCWidgetEntry: TimelineEntry {
    let date: Date
    let eventName: String
    let fighter1Name: String
    let fighter2Name: String
    let eventDate: Date
    let daysRemaining: Int
    let hoursRemaining: Int
    let minutesRemaining: Int
    let location: String
    let weightClass: String
    let isChampionship: Bool
}

// MARK: - Widget Provider
struct UFCWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> UFCWidgetEntry {
        let days: TimeInterval = 86400 * 17
        let hours: TimeInterval = 3600 * 14
        let minutes: TimeInterval = 60 * 34
        let eventDate = Date().addingTimeInterval(days + hours + minutes)
        return UFCWidgetEntry(
            date: Date(),
            eventName: "UFC FIGHT NIGHT",
            fighter1Name: "Ian Garry",
            fighter2Name: "Carlos Prates",
            eventDate: eventDate,
            daysRemaining: 17,
            hoursRemaining: 14,
            minutesRemaining: 34,
            location: "T-Mobile Arena",
            weightClass: "Welterweight",
            isChampionship: true
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (UFCWidgetEntry) -> ()) {
        let entry = getNextEventData()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<UFCWidgetEntry>) -> ()) {
        let currentDate = Date()
        let entry = getNextEventData()
        
        // Update every minute
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 1, to: currentDate) ?? currentDate
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func getNextEventData() -> UFCWidgetEntry {
        let userDefaults = UserDefaults(suiteName: "group.com.ufcapp.widget")
        
        // Get saved event data
        if let eventData = userDefaults?.dictionary(forKey: "nextEvent"),
           let eventName = eventData["eventName"] as? String,
           let fighter1Name = eventData["fighter1Name"] as? String,
           let fighter2Name = eventData["fighter2Name"] as? String,
           let eventDateTimestamp = eventData["eventDate"] as? TimeInterval {
            print("📦 Widget loaded data: \(eventData)")
            let eventDate = Date(timeIntervalSince1970: eventDateTimestamp)
            let timeRemaining = eventDate.timeIntervalSince(Date())
            let days = Int(timeRemaining / 86400)
            let hours = Int((timeRemaining.truncatingRemainder(dividingBy: 86400)) / 3600)
            let minutes = Int((timeRemaining.truncatingRemainder(dividingBy: 3600)) / 60)
            let location = eventData["location"] as? String ?? ""
            let weightClass = eventData["weightClass"] as? String ?? ""
            let isChampionship = eventData["isChampionship"] as? Bool ?? false
            return UFCWidgetEntry(
                date: Date(),
                eventName: eventName,
                fighter1Name: fighter1Name,
                fighter2Name: fighter2Name,
                eventDate: eventDate,
                daysRemaining: max(0, days),
                hoursRemaining: max(0, hours),
                minutesRemaining: max(0, minutes),
                location: location,
                weightClass: weightClass,
                isChampionship: isChampionship
            )
        }
        // Fallback
        let days: TimeInterval = 86400 * 17
        let hours: TimeInterval = 3600 * 14
        let minutes: TimeInterval = 60 * 34
        let eventDate = Date().addingTimeInterval(days + hours + minutes)
        return UFCWidgetEntry(
            date: Date(),
            eventName: "UFC FIGHT NIGHT",
            fighter1Name: "Ian Garry",
            fighter2Name: "Carlos Prates",
            eventDate: eventDate,
            daysRemaining: 17,
            hoursRemaining: 14,
            minutesRemaining: 34,
            location: "T-Mobile Arena",
            weightClass: "Welterweight",
            isChampionship: true
        )
    }
}

// MARK: - Widget View
struct UFCWidgetEntryView: View {
    let entry: UFCWidgetEntry
    @Environment(\.widgetFamily) var family
    
    private func formatEventDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM dd, HH:mm"
        formatter.locale = Locale(identifier: "en_US")
        // Configure timezone para GMT-3 (horário de Brasília)
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        return formatter.string(from: date)
    }
    
    var body: some View {
        VStack(spacing: 0) {
            if family == .systemSmall {
                smallWidgetLayout
            } else {
                mediumWidgetLayout
            }
        }
        .containerBackground(for: .widget) {
            Color.black
        }
    }
    
    private var smallWidgetLayout: some View {
        VStack(alignment: .leading, spacing: 2) {
            // Event info
            VStack(alignment: .leading, spacing: 0) {
                Text(entry.eventName)
                    .font(.rajdhani(size: 16, weight: .bold))
                    .foregroundColor(entry.isChampionship ? Color(red: 1.0, green: 0.8, blue: 0.0) : Color(red: 0.945, green: 0.235, blue: 0.329)) // Golden for championship, #F13C54 for bout
                    .lineLimit(1)
                
                VStack(alignment: .leading, spacing: -2) {
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text(formatFighterName(entry.fighter1Name))
                            .font(.rajdhani(size: 24, weight: .bold))
                            .foregroundColor(.white)
                            .lineLimit(1)
                        Text("vs")
                            .font(.rajdhani(size: 24, weight: .bold))
                            .foregroundColor(.white)
                    }
                    Text(formatFighterName(entry.fighter2Name))
                        .font(.rajdhani(size: 24, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                }
                
                Text(formatEventDate(entry.eventDate))
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            // Countdown (only days for small widget)
            HStack(alignment: .center, spacing: 4) {
                Text("\(entry.daysRemaining)")
                    .font(.rajdhani(size: 28, weight: .bold))
                    .foregroundColor(.white)
                Text("Days")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.gray)
            }
        }
        .padding(.leading, -20)
        .padding(.vertical, 16)
    }
    
    private var mediumWidgetLayout: some View {
        HStack(spacing: 16) {
            eventInfo
            Spacer()
            countdown
        }
        .padding(16)
    }
    
    private var eventInfo: some View {
        VStack(alignment: .leading, spacing: -2) {
            Text(entry.eventName)
                .font(.rajdhani(size: 20, weight: .bold))
                .foregroundColor(entry.isChampionship ? Color(red: 1.0, green: 0.8, blue: 0.0) : Color(red: 0.945, green: 0.235, blue: 0.329)) // Golden for championship, #F13C54 for bout
                .lineLimit(1)
            VStack(alignment: .leading, spacing: -6) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(formatFighterName(entry.fighter1Name))
                        .font(.rajdhani(size: 32, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    Text("vs")
                        .font(.rajdhani(size: 32, weight: .bold))
                        .foregroundColor(.white)
                }
                Text(formatFighterName(entry.fighter2Name))
                    .font(.rajdhani(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(1)
            }
            .padding(.bottom, 4)
            Text(formatEventDate(entry.eventDate))
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.gray)
        }
        .padding(.leading, -10)
        .padding(.vertical, 16)
    }

    // Função utilitária para exibir apenas o(s) sobrenome(s) com primeira letra maiúscula
    private func formatFighterName(_ fullName: String) -> String {
        let nameParts = fullName.components(separatedBy: " ")
        if nameParts.count > 1 {
            let lastName = nameParts.dropFirst().joined(separator: " ")
            return lastName.capitalized
        } else {
            return fullName.capitalized
        }
    }
    
    private var countdown: some View {
        VStack(alignment: .leading, spacing: -2) {
            HStack(alignment: .center, spacing: 8) {
                Text("\(entry.daysRemaining)")
                    .font(.rajdhani(size: 32, weight: .bold))
                    .foregroundColor(.white)
                Text("Days")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.gray)
            }
            HStack(alignment: .center, spacing: 8) {
                Text("\(entry.hoursRemaining)")
                    .font(.rajdhani(size: 32, weight: .bold))
                    .foregroundColor(.white)
                Text("Hrs")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.gray)
            }
            HStack(alignment: .center, spacing: 8) {
                Text("\(entry.minutesRemaining)")
                    .font(.rajdhani(size: 32, weight: .bold))
                    .foregroundColor(.white)
                Text("Mins")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.gray)
            }
        }
    }
}

// MARK: - Widget Configuration
struct UFCWidget: Widget {
    let kind: String = "UFCWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: UFCWidgetProvider()) { entry in
            UFCWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("UFC Next Event")
        .description("Shows the next UFC event with countdown.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Widget Bundle
@main
struct UFCWidgetBundle: WidgetBundle {
    init() {
        // Register custom fonts for widget
        WidgetFonts.registerFonts()
    }
    
    var body: some Widget {
        UFCWidget()
        Widget_Its_TimeControl()
    }
}

// MARK: - Preview
struct UFCWidget_Previews: PreviewProvider {
    static var previews: some View {
        let days: TimeInterval = 86400 * 17
        let hours: TimeInterval = 3600 * 14
        let minutes: TimeInterval = 60 * 34
        let eventDate = Date().addingTimeInterval(days + hours + minutes)
        let entry = UFCWidgetEntry(
            date: Date(),
            eventName: "UFC FIGHT NIGHT",
            fighter1Name: "Ian Garry",
            fighter2Name: "Carlos Prates",
            eventDate: eventDate,
            daysRemaining: 17,
            hoursRemaining: 14,
            minutesRemaining: 34,
            location: "T-Mobile Arena",
            weightClass: "Welterweight",
            isChampionship: true
        )
        
        Group {
            UFCWidgetEntryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
                .previewDisplayName("Small Widget")
            
            UFCWidgetEntryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))
                .previewDisplayName("Medium Widget")
        }
    }
} 
