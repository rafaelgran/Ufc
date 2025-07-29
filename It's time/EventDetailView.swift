//
//  EventDetailView.swift
//  It's time
//
//  Created by Rafael Granemann on 23/07/25.
//

import SwiftUI

struct EventDetailView: View {
    let event: UFCEvent
    @State private var currentTime = Date()
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient based on championship fights
                ZStack {
                    // Base black background
                    Color.black
                        .ignoresSafeArea()
                    
                    if hasChampionshipFights {
                        // Golden gradient for events with championship fights
                        RadialGradient(
                            gradient: Gradient(colors: [
                                Color(red: 1.0, green: 0.8, blue: 0.0).opacity(0.15), // Golden glow
                                Color.clear
                            ]),
                            center: .topLeading,
                            startRadius: 50,
                            endRadius: 400
                        )
                        .ignoresSafeArea()
                        
                        RadialGradient(
                            gradient: Gradient(colors: [
                                Color(red: 1.0, green: 0.8, blue: 0.0).opacity(0.1), // Golden glow
                                Color.clear
                            ]),
                            center: .topTrailing,
                            startRadius: 50,
                            endRadius: 400
                        )
                        .ignoresSafeArea()
                    } else {
                        // Red gradient for events without championship fights
                        RadialGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.945, green: 0.235, blue: 0.329).opacity(0.15), // Red glow (#F13C54)
                                Color.clear
                            ]),
                            center: .topLeading,
                            startRadius: 50,
                            endRadius: 400
                        )
                        .ignoresSafeArea()
                        
                        RadialGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.945, green: 0.235, blue: 0.329).opacity(0.1), // Red glow (#F13C54)
                                Color.clear
                            ]),
                            center: .topTrailing,
                            startRadius: 50,
                            endRadius: 400
                        )
                        .ignoresSafeArea()
                    }
                }
                
                VStack(spacing: 0) {
                    // Fixed Header with Back Button
                    HStack {
                        Button(action: {
                            presentationMode.wrappedValue.dismiss()
                        }) {
                            HStack(spacing: 8) {
                                Text("BACK")
                                    .font(.rajdhani(size: 14, weight: .bold))
                                    .foregroundColor(Color(.white))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 8)
                                    .background(
                                        RoundedRectangle(cornerRadius: 20)
                                            .fill(Color(.white).opacity(0.10))
                                    )
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 10)
                    .padding(.top, 8)
                    .padding(.bottom, 8)
                    
                    // Scrollable content
                    ScrollView {
                        VStack(spacing: 0) {
                            // Featured Event Section (similar to home)
                            EventDetailHeaderView(event: event, currentTime: currentTime)
                            
                            // Fights sections
                            VStack(spacing: 24) {
                                // Main Event
                                if let mainEventFights = getMainEventFights() {
                                    FightSectionView(
                                        title: "Main Event",
                                        fights: mainEventFights
                                    )
                                }
                                
                                // Prelims
                                if let prelimFights = getPrelimFights() {
                                    FightSectionView(
                                        title: "Prelims",
                                        fights: prelimFights
                                    )
                                }
                            }
                            .padding(.horizontal, 10)
                            .padding(.top, 20)
                            .padding(.bottom, 40)
                        }
                    }
                    .scrollIndicators(.hidden) // Remove scroll indicators
                }
            }
        }
        .onAppear {
            // Start timer to update countdown
            Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
                currentTime = Date()
            }
        }
    }
    
    private func getMainEventFights() -> [UFCFight]? {
        guard let fights = event.fights else { return nil }
        // Use the fightType field from the database
        return fights.filter { $0.isMainEvent }
    }
    
    private func getPrelimFights() -> [UFCFight]? {
        guard let fights = event.fights else { return nil }
        // Use the fightType field from the database
        return fights.filter { $0.isPrelim }
    }
    
    // Check if the event has any championship fights
    private var hasChampionshipFights: Bool {
        return event.fights?.contains { $0.isChampionship } ?? false
    }
    
    // Get the main main event (prioritize championship fights)
    private func getMainMainEvent(_ mainEventFights: [UFCFight]) -> UFCFight? {
        // First, try to find a championship fight
        if let championshipFight = mainEventFights.first(where: { $0.isChampionship }) {
            return championshipFight
        }
        
        // If no championship fight, return the first main event fight
        return mainEventFights.first
    }
}

struct EventDetailHeaderView: View {
    let event: UFCEvent
    let currentTime: Date
    
    var body: some View {
        VStack(spacing: 4) {
            Text(event.name)
                .font(.rajdhani(size: 24, weight: .bold))
                .foregroundColor(hasChampion ? Color(red: 1.0, green: 0.8, blue: 0.0) : Color(red: 0.945, green: 0.235, blue: 0.329)) // Golden for championship, #F13C54 for bout
            
            HStack(spacing: 6) {
                if mainEventHasChampion {
                    HStack(spacing: 2) {
                        Rectangle()
                            .fill(Color.gray)
                            .frame(width: 6, height: 8)
                        
                        Image(systemName: "octagon.fill")
                            .foregroundColor(Color(red: 1.0, green: 0.8, blue: 0.0))
                            .font(.system(size: 15))
                        
                        Rectangle()
                            .fill(Color.gray)
                            .frame(width: 6, height: 8)
                    }
                }
                
                Text(mainEventWeightClassText)
                    .font(.rajdhani(size: 18, weight: .medium))
                    .foregroundColor(.white)
                
                // Always show the text (CHAMPIONSHIP or BOUT)
                Text(mainEventChampionshipText)
                    .font(.rajdhani(size: 18, weight: .medium))
                    .foregroundColor(mainEventHasChampion ? Color(red: 1.0, green: 0.8, blue: 0.0) : Color(red: 0.945, green: 0.235, blue: 0.329))
            }
            
            // Show main event info if available - prioritize championship fights
            if let mainEventFights = getMainEventFights(), let mainEvent = getMainMainEvent(mainEventFights) {
                VStack(spacing: -8) {
                    Text(mainEventFirstFighterLastName(mainEvent))
                        .font(.rajdhani(size: sharedFontSize, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .frame(maxWidth: .infinity)
                    
                    HStack(spacing: 10) {
                        Rectangle()
                            .fill(Color.gray)
                            .frame(width: vsLineWidth, height: 1)
                        
                        Text("VS")
                            .font(.inter(size: 16, weight: .medium))
                            .foregroundColor(.gray)
                        
                        Rectangle()
                            .fill(Color.gray)
                            .frame(width: vsLineWidth, height: 1)
                    }
                    .frame(maxWidth: .infinity)
                    
                    Text(mainEventSecondFighterLastName(mainEvent))
                        .font(.rajdhani(size: sharedFontSize, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .frame(maxWidth: .infinity)
                }
                .frame(maxWidth: .infinity)
            }
            
            Text("\(event.venue ?? "VENUE TBD") - \(event.location ?? "LOCATION TBD")".uppercased())
                .font(.rajdhani(size: 18, weight: .medium))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
            
            Spacer()
                .frame(height: 20)
            
            EventDetailCountdownCardView(event: event, currentTime: currentTime)
            
            Spacer()
                .frame(height: 20)
        }
        .padding(.horizontal, 10)
        .padding(.top, 20)
    }
    
    private var hasChampion: Bool {
        guard let firstFight = event.fights?.first else {
            return false
        }
        return firstFight.isChampionship
    }
    
    private var weightClassText: String {
        guard let firstFight = event.fights?.first else {
            return "WEIGHT CLASS"
        }
        return firstFight.weightClass.uppercased()
    }
    
    private var championshipText: String {
        guard let firstFight = event.fights?.first else {
            return "CHAMPIONSHIP"
        }
        return firstFight.isChampionship ? "CHAMPIONSHIP" : "BOUT"
    }
    
    // Main event specific properties
    private var mainEventHasChampion: Bool {
        guard let mainEventFights = getMainEventFights(),
              let mainEvent = getMainMainEvent(mainEventFights) else {
            return hasChampion
        }
        return mainEvent.isChampionship
    }
    
    private var mainEventWeightClassText: String {
        guard let mainEventFights = getMainEventFights(),
              let mainEvent = getMainMainEvent(mainEventFights) else {
            return weightClassText
        }
        return mainEvent.weightClass.uppercased()
    }
    
    private var mainEventChampionshipText: String {
        guard let mainEventFights = getMainEventFights(),
              let mainEvent = getMainMainEvent(mainEventFights) else {
            return championshipText
        }
        return mainEvent.isChampionship ? "CHAMPIONSHIP" : "BOUT"
    }
    
    // Helper functions for main event logic
    private func getMainEventFights() -> [UFCFight]? {
        guard let fights = event.fights else { return nil }
        // Use the fightType field from the database
        return fights.filter { $0.isMainEvent }
    }
    
    private func getMainMainEvent(_ mainEventFights: [UFCFight]) -> UFCFight? {
        // First, try to find a championship fight
        if let championshipFight = mainEventFights.first(where: { $0.isChampionship }) {
            return championshipFight
        }
        
        // If no championship fight, return the first main event fight
        return mainEventFights.first
    }
    
    private func mainEventFirstFighterLastName(_ fight: UFCFight) -> String {
        let fullName = fight.fighter1.name
        let nameParts = fullName.components(separatedBy: " ")
        
        if nameParts.count > 1 {
            let remainingNames = Array(nameParts.dropFirst())
            return remainingNames.joined(separator: " ").uppercased()
        } else {
            return fullName.uppercased()
        }
    }
    
    private func mainEventSecondFighterLastName(_ fight: UFCFight) -> String {
        let fullName = fight.fighter2.name
        let nameParts = fullName.components(separatedBy: " ")
        
        if nameParts.count > 1 {
            let remainingNames = Array(nameParts.dropFirst())
            return remainingNames.joined(separator: " ").uppercased()
        } else {
            return fullName.uppercased()
        }
    }
    
    // Fallback properties for when main event is not available
    private var mainFightFirstFighterLastName: String {
        guard let firstFight = event.fights?.first else {
            return "FIGHTER 1"
        }
        return mainEventFirstFighterLastName(firstFight)
    }
    
    private var mainFightSecondFighterLastName: String {
        guard let firstFight = event.fights?.first else {
            return "FIGHTER 2"
        }
        return mainEventSecondFighterLastName(firstFight)
    }
    
    // Calculate shared font size based on the longest name
    private var sharedFontSize: CGFloat {
        let longestName = mainFightFirstFighterLastName.count > mainFightSecondFighterLastName.count ? mainFightFirstFighterLastName : mainFightSecondFighterLastName
        return calculateFontSize(for: longestName)
    }
    
    // Calculate VS line width to match the longest name width
    private var vsLineWidth: CGFloat {
        let longestName = mainFightFirstFighterLastName.count > mainFightSecondFighterLastName.count ? mainFightFirstFighterLastName : mainFightSecondFighterLastName
        let font = UIFont(name: "Rajdhani-Bold", size: sharedFontSize) ?? UIFont.systemFont(ofSize: sharedFontSize, weight: .bold)
        let nameWidth = (longestName as NSString).size(withAttributes: [.font: font]).width
        
        // Calculate the width for each line (total width minus VS text width, divided by 2)
        let vsTextWidth: CGFloat = 20 // Approximate width of "VS" text
        let totalLineWidth = nameWidth - vsTextWidth - 20 // 20 for spacing
        return max(0, totalLineWidth / 2) // Each line gets half the remaining width
    }
    
    // Calculate font size to fit the longest name in 100% of screen width
    private func calculateFontSize(for name: String) -> CGFloat {
        let screenWidth = UIScreen.main.bounds.width - 40 // Account for all padding (20 from function + 20 from VStack)
        let maxFontSize: CGFloat = 120 // Increased significantly to allow larger fonts
        let minFontSize: CGFloat = 20
        
        // Binary search to find the optimal font size
        var low = minFontSize
        var high = maxFontSize
        var optimalSize = maxFontSize
        
        while low <= high {
            let mid = (low + high) / 2
            let font = UIFont(name: "Rajdhani-Bold", size: mid) ?? UIFont.systemFont(ofSize: mid, weight: .bold)
            let nameWidth = (name as NSString).size(withAttributes: [.font: font]).width
            
            if nameWidth <= screenWidth {
                optimalSize = mid
                low = mid + 1
            } else {
                high = mid - 1
            }
        }
        
        return optimalSize
    }
}

struct EventDetailCountdownCardView: View {
    let event: UFCEvent
    let currentTime: Date
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 0) {
                    Text(eventDateString)
                        .font(.rajdhani(size: 27, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(eventTimeString)
                        .font(.inter(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
                .frame(maxHeight: .infinity, alignment: .top)
                
                Spacer()
                
                HStack(spacing: 16) {
                    VStack(spacing: 0) {
                        Text("\(timeRemaining.days)")
                            .font(.rajdhani(size: 27, weight: .bold))
                            .foregroundColor(.white)
                        Text("Days")
                            .font(.inter(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    
                    VStack(spacing: 0) {
                        Text("\(timeRemaining.hours)")
                            .font(.rajdhani(size: 27, weight: .bold))
                            .foregroundColor(.white)
                        Text("Hours")
                            .font(.inter(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    
                    VStack(spacing: 0) {
                        Text("\(timeRemaining.minutes)")
                            .font(.rajdhani(size: 27, weight: .bold))
                            .foregroundColor(.white)
                        Text("Minutes")
                            .font(.inter(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                
              
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(red: 0.2, green: 0.2, blue: 0.2).opacity(0.3))
        )
    }
    
    private var timeRemaining: (days: Int, hours: Int, minutes: Int) {
        guard let eventDate = parseEventDate() else {
            return (0, 0, 0)
        }
        
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day, .hour, .minute], from: currentTime, to: eventDate)
        
        return (
            days: max(0, components.day ?? 0),
            hours: max(0, components.hour ?? 0),
            minutes: max(0, components.minute ?? 0)
        )
    }
    
    private var eventDateString: String {
        guard let eventDate = parseEventDate() else {
            return "TBD"
        }
        
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        formatter.locale = Locale(identifier: "en_US")
        return formatter.string(from: eventDate).uppercased()
    }
    
    private var eventTimeString: String {
        guard let eventDate = parseEventDate() else {
            return "TBD"
        }
        
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: eventDate)
    }
    
    private func parseEventDate() -> Date? {
        let formatter = DateFormatter()
        
        // Configure timezone para GMT-3 (horário de Brasília)
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        
        let dateFormats = [
            "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
            "yyyy-MM-dd'T'HH:mm:ssZ",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm",
            "yyyy-MM-dd HH:mm:ss"
        ]
        
        for format in dateFormats {
            formatter.dateFormat = format
            if let date = formatter.date(from: event.date) {
                return date
            }
        }
        
        return nil
    }
}

#Preview {
    let sampleEvent = UFCEvent(
        id: 1,
        name: "UFC 323",
        date: "2025-01-25T20:00:00Z",
        location: "T-Mobile Arena",
        venue: "T-Mobile Arena",
        status: "scheduled",
        mainEvent: "Lightweight Championship",
        fights: [
            UFCFight(
                id: 1,
                fighter1: UFCFighter(id: 1, name: "John Smith", nickname: nil, record: nil, photo: nil, ranking: "C"),
                fighter2: UFCFighter(id: 2, name: "Mike Johnson", nickname: nil, record: nil, photo: nil, ranking: nil),
                weightClass: "Lightweight",
                fightType: "main",
                rounds: 5,
                status: "scheduled",
                roundTime: 300,
                winner: nil,
                method: nil
            ),
            UFCFight(
                id: 2,
                fighter1: UFCFighter(id: 3, name: "Alex Brown", nickname: nil, record: nil, photo: nil, ranking: nil),
                fighter2: UFCFighter(id: 4, name: "Chris Davis", nickname: nil, record: nil, photo: nil, ranking: nil),
                weightClass: "Welterweight",
                fightType: "prelim",
                rounds: 3,
                status: "scheduled",
                roundTime: 300,
                winner: nil,
                method: nil
            )
        ],
        createdAt: "2025-01-01T00:00:00Z"
    )
    
    EventDetailView(event: sampleEvent)
}

struct FightSectionView: View {
    let title: String
    let fights: [UFCFight]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section title
            Text(title)
                .font(.rajdhani(size: 20, weight: .bold))
                .foregroundColor(.white)
            
            // Fights list
            VStack(spacing: 12) {
                ForEach(fights) { fight in
                    FightCardView(fight: fight)
                }
            }
        }
    }
}

struct FightCardView: View {
    let fight: UFCFight
    
    var body: some View {
        VStack(alignment: .center, spacing: 4) {
            // Fighters
            HStack(spacing: 4) {
                // Fighter 1
                HStack(spacing: 8) {
                    // Ranking badge
                    if let ranking = fight.fighter1.ranking {
                        Text(ranking)
                            .font(.inter(size: 10, weight: .bold))
                            .foregroundColor(ranking == "C" ? .black : .white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(ranking == "C" ? Color(red: 1.0, green: 0.8, blue: 0.0) : Color.gray.opacity(0.6))
                            )
                    }
                    
                    Text(fight.fighter1.name)
                        .font(.rajdhani(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, alignment: .trailing)
                
                // VS - Centralizado
                Text("VS")
                    .font(.rajdhani(size: 14, weight: .medium))
                    .foregroundColor(.gray)
                    .frame(width: 40)
                
                // Fighter 2
                HStack(spacing: 8) {
                    // Ranking badge
                    if let ranking = fight.fighter2.ranking {
                        Text(ranking)
                            .font(.inter(size: 10, weight: .bold))
                            .foregroundColor(ranking == "C" ? .black : .white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(ranking == "C" ? Color(red: 1.0, green: 0.8, blue: 0.0) : Color.gray.opacity(0.6))
                            )
                    }

                    Text(fight.fighter2.name)
                        .font(.rajdhani(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            
            // Weight class, championship indicator, and rounds
            HStack(spacing: 4) {
                Text(fight.weightClass.uppercased())
                    .font(.rajdhani(size: 14, weight: .medium))
                    .foregroundColor(.gray)
                
                // Championship indicator
                if fight.isChampionship {
                    Text("CHAMPIONSHIP")
                        .font(.rajdhani(size: 14, weight: .medium))
                        .foregroundColor(Color(red: 1.0, green: 0.8, blue: 0.0))
                } else {
                    Text("BOUT")
                        .font(.rajdhani(size: 15, weight: .medium))
                        .foregroundColor(.gray)
                }
                
                Text("-")
                    .font(.rajdhani(size: 14, weight: .medium))
                    .foregroundColor(.gray)
                
                Text("\(fight.rounds) Rounds")
                    .font(.rajdhani(size: 14, weight: .medium))
                    .foregroundColor(.gray)
            }
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(red: 0.2, green: 0.2, blue: 0.2).opacity(0.3))
        )
    }
} 