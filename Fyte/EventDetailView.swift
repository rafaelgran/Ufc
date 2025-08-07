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
                // Background color - #1b1b1b
                Color(red: 0.106, green: 0.106, blue: 0.106) // #1b1b1b
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Fixed Header with Back Button
                    HStack {
                        Button(action: {
                            presentationMode.wrappedValue.dismiss()
                        }) {
                            HStack(spacing: 8) {
                                Text("BACK")
                                    .font(.rajdhani(size: 14, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 8)
                                    .background(
                                        RoundedRectangle(cornerRadius: 20)
                                            .stroke(.white, lineWidth: 1)
                                            .background(Color.clear)
                                    )
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 10)
                    .padding(.top, 8)
                    .padding(.bottom, 8)
                    .background(Color(red: 0.106, green: 0.106, blue: 0.106)) // #1b1b1b
                    
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
        return event.mainEventFights
    }
    
    private func getPrelimFights() -> [UFCFight]? {
        guard let fights = event.fights else { return nil }
        // Filter prelim fights and sort by fightOrder
        let prelimFights = fights.filter { $0.isPrelim }
        return prelimFights.sorted { fight1, fight2 in
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
    
    // Check if the event has any championship fights
    private var hasChampionshipFights: Bool {
        return event.fights?.contains { $0.isChampionship } ?? false
    }
    
    // Get the main main event (prioritize championship fights)
    private func getMainMainEvent(_ mainEventFights: [UFCFight]) -> UFCFight? {
        return event.firstMainEventFight
    }
}

struct EventDetailHeaderView: View {
    let event: UFCEvent
    let currentTime: Date
    
    var body: some View {
        VStack(spacing: 4) {
            Text(event.name)
                .font(.rajdhani(size: 24, weight: .bold))
                                        .foregroundColor(hasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // #FBFF05 for championship, #FF0550 for bout
            
            HStack(spacing: 6) {
                if mainEventHasChampion {
                    BeltSvgView(size: 24)
                }
                
                Text(mainEventWeightClassText)
                    .font(.rajdhani(size: 18, weight: .medium))
                    .foregroundColor(.white)
                
                // Always show the text (CHAMPIONSHIP or BOUT)
                Text(mainEventChampionshipText)
                    .font(.rajdhani(size: 18, weight: .medium))
                                            .foregroundColor(mainEventHasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // #FBFF05 for championship, #FF0550 for bout
            }
            
            // Show main event info if available - prioritize championship fights
            if let mainEventFights = getMainEventFights(), let mainEvent = getMainMainEvent(mainEventFights) {
                VStack(spacing: -2) {
                    Text(mainEventFirstFighterLastName(mainEvent))
                        .font(.rajdhani(size: sharedFontSize, weight: .bold))
                        .foregroundColor(mainEventHasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // #FBFF05 for championship, #FF0550 for bout
                        .lineLimit(1)
                        .frame(maxWidth: .infinity)
                    
                    // VS com bandeiras SVG - Evento principal
                    HStack(spacing: 4) {
                        Rectangle()
                            .fill(Color.white)
                            .frame(height: 1)
                        
                        Spacer()

                        // Primeira bandeira SVG
                        if let flagSvg = mainEvent.fighter1.countryFlagSvg {
                            FlagSvgView(svgString: flagSvg, size: 30, countryName: mainEvent.fighter1.country)
                        } else {
                            Text(mainEvent.fighter1.countryFlag)
                                .font(.system(size: 30))
                        }
                        
                        Spacer()
                        
                        Text("VS")
                            .font(.rajdhani(size: 18, weight: .medium))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        // Segunda bandeira SVG
                        if let flagSvg = mainEvent.fighter2.countryFlagSvg {
                            FlagSvgView(svgString: flagSvg, size: 30, countryName: mainEvent.fighter2.country)
                        } else {
                            Text(mainEvent.fighter2.countryFlag)
                                .font(.system(size: 30))
                        }
                        
                        Spacer()
                        
                        Rectangle()
                            .fill(Color.white)
                            .frame(height: 1)
                    }
                    .padding(.horizontal, 20)
                    .frame(maxWidth: .infinity)
                    
                    Text(mainEventSecondFighterLastName(mainEvent))
                        .font(.rajdhani(size: sharedFontSize, weight: .bold))
                        .foregroundColor(mainEventHasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // #FBFF05 for championship, #FF0550 for bout
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
                .frame(height: 40)
            
            EventDetailCountdownCardView(event: event, currentTime: currentTime)
            
            Spacer()
                .frame(height: 20)
        }
        .padding(.horizontal, 10)
        .padding(.top, 12)
    }
    
    private var hasChampion: Bool {
        guard let firstFight = event.firstMainEventFight else {
            return false
        }
        return firstFight.isChampionship
    }
    
    private var weightClassText: String {
        guard let firstFight = event.firstMainEventFight else {
            return "WEIGHT CLASS"
        }
        return firstFight.weightClass.uppercased()
    }
    
    private var championshipText: String {
        guard let firstFight = event.firstMainEventFight else {
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
        return event.mainEventFights
    }
    
    private func getMainMainEvent(_ mainEventFights: [UFCFight]) -> UFCFight? {
        return event.firstMainEventFight
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
        guard let firstFight = event.firstMainEventFight else {
            return "FIGHTER 1"
        }
        return mainEventFirstFighterLastName(firstFight)
    }
    
    private var mainFightSecondFighterLastName: String {
        guard let firstFight = event.firstMainEventFight else {
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
    @StateObject private var liveActivityService = LiveActivityService.shared
    @State private var isBlinking = false
    
    private var hasChampion: Bool {
        guard let firstFight = event.firstMainEventFight else {
            return false
        }
        return firstFight.isChampionship
    }
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center) {
                if event.isLive {
                    // LIVE NOW display
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(Color(red: 1.0, green: 0.020, blue: 0.314))
                                .frame(width: 7, height: 7)
                                .opacity(isBlinking ? 0.2 : 1.0)
                                .animation(Animation.easeInOut(duration: 0.7).repeatForever(autoreverses: true), value: isBlinking)
                            Text("LIVE NOW")
                                .font(.rajdhani(size: 24, weight: .bold))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                        }
                        HStack(spacing: 8) {
                            Circle()
                                .fill(Color.clear)
                                .frame(width: 7, height: 7)
                            Text("In progress")
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133).opacity(0.5)) // #222222
                        }
                    }
                    .frame(maxHeight: .infinity, alignment: .top)
                    .onAppear {
                        isBlinking = true
                    }
                    Spacer()
                } else {
                    // Normal countdown display
                    VStack(alignment: .leading, spacing: 0) {
                        Text(eventDateString)
                            .font(.rajdhani(size: 28, weight: .bold))
                            .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                        
                        HStack(spacing: 2) {
                            Text(eventTimeString)
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                            Text(userTimeZoneString)
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                                .padding(.leading, 1)
                                .padding(.top, 1)
                        }
                    }
                    .frame(maxHeight: .infinity, alignment: .top)
                    
                    Spacer()
                    
                    HStack(spacing: 20) {
                        VStack(spacing: 0) {
                            Text(String(format: "%02d", timeRemaining.days))
                                .font(.rajdhani(size: 28, weight: .bold))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                            Text("Days")
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                        }
                        
                        VStack(spacing: 0) {
                            Text(String(format: "%02d", timeRemaining.hours))
                                .font(.rajdhani(size: 28, weight: .bold))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                            Text("Hours")
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                        }
                        
                        VStack(spacing: 0) {
                            Text(String(format: "%02d", timeRemaining.minutes))
                                .font(.rajdhani(size: 28, weight: .bold))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                            Text("Minutes")
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                        }
                    }
                }
                
                // JOIN LIVE button (only show if event is live)
                if event.isLive {
                    Spacer()
                        .frame(height: 20)
                    
                    Button(action: {
                        Task {
                            await liveActivityService.startEventActivity(for: event)
                        }
                    }) {
                        Text("JOIN LIVE")
                            .font(.rajdhani(size: 14, weight: .bold))
                            .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                            .padding(.horizontal, 10)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(Color(red: 0.133, green: 0.133, blue: 0.133), lineWidth: 1) // #222222
                                    .background(Color.clear)
                            )
                    }
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(hasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // Amarelo para campeão, vermelho para bout
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
    
    private var userTimeZoneString: String {
        let timeZone = TimeZone.current
        let offset = timeZone.secondsFromGMT()
        let hours = offset / 3600
        
        if hours >= 0 {
            return String(format: "GMT+%d", hours)
        } else {
            return String(format: "GMT-%d", abs(hours))
        }
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
        createdAt: "2025-01-01T00:00:00Z",
        image: nil // Adicionando o campo image como nil para o evento de exemplo
    )
    
    EventDetailView(event: sampleEvent)
}

struct FightSectionView: View {
    let title: String
    let fights: [UFCFight]
    
    var body: some View {
        VStack(alignment: .center, spacing: 16) {
            // Section title
            Text(title)
                .font(.rajdhani(size: 20, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .center)
            
            // Fights list
            VStack(spacing: 12) {
                ForEach(Array(fights.enumerated()), id: \.element.id) { index, fight in
                    FightCardView(
                        fight: fight,
                        isLastFight: index == fights.count - 1
                    )
                }
            }
        }
    }
}

struct FightCardView: View {
    let fight: UFCFight
    let isLastFight: Bool
    
    // Computed properties for winner detection
    private var fighter1IsWinner: Bool {
        guard fight.isFinished, let winner = fight.winner else { return false }
        let fighter1IdString = String(fight.fighter1.id)
        return winner == fighter1IdString || winner.trimmingCharacters(in: .whitespaces) == fighter1IdString
    }
    
    private var fighter2IsWinner: Bool {
        guard fight.isFinished, let winner = fight.winner else { return false }
        let fighter2IdString = String(fight.fighter2.id)
        return winner == fighter2IdString || winner.trimmingCharacters(in: .whitespaces) == fighter2IdString
    }
    
    // Format victory info (round and method)
    private var victoryInfo: String? {
        guard fight.isFinished, let _ = fight.winner else { return nil }
        
        // Use dynamic data from database
        let round = fight.finalRound ?? 3 // fallback to 3 if not available
        let result = fight.resultType ?? "DEC" // fallback to DEC if not available
        
        // Debug: Log victory info for finished fights
        print("🏆 Victory Info for Fight \(fight.id): Round=\(round), Result=\(result), FinalRound=\(fight.finalRound ?? -1), ResultType=\(fight.resultType ?? "nil")")
        
        return "R\(round) - \(result)"
    }
    
    var body: some View {
        VStack(alignment: .center, spacing: 4) {

            // Weight class, championship indicator, and rounds
            HStack(spacing: 4) {
                Text(fight.weightClass.uppercased())
                    .font(.inter(size: 11, weight: .medium))
                    .foregroundColor(.gray.opacity(0.75))
                
                // Championship indicator
                if fight.isChampionship {
                    Text("CHAMPIONSHIP")
                        .font(.inter(size: 11, weight: .medium))
                        .foregroundColor(Color(red: 0.984, green: 1.0, blue: 0.020)) // #FBFF05
                } else {
                    Text("BOUT")
                        .font(.inter(size: 11, weight: .medium))
                        .foregroundColor(.gray.opacity(0.75))
                }
                
                Text("-")
                    .font(.inter(size: 11, weight: .medium))
                    .foregroundColor(.gray.opacity(0.75))
                
                Text("\(fight.rounds) ROUNDS")
                    .font(.inter(size: 11, weight: .medium))
                    .foregroundColor(.gray.opacity(0.75))
            }

            // Fighters
            HStack(spacing: 8) {
                // Fighter 1
                VStack(alignment: .trailing, spacing: 2) {
                    // Top row: Ranking + Name
                    HStack(alignment: .top, spacing: 4) {
                        // Ranking badge
                        if let ranking = fight.fighter1.ranking {
                            Text(ranking)
                                .font(.rajdhani(size: 12, weight: .bold))
                                .foregroundColor(ranking == "C" ? .black : .white)
                                .padding(.horizontal, 5)
                                .padding(.vertical, 1)
                                .background(
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(ranking == "C" ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color.gray.opacity(0.6)) // #FBFF05
                                )
                                .offset(y: 2)
                        }
                        
                        Text(fight.fighter1.name)
                            .font(.rajdhani(size: 18, weight: .bold))
                            .foregroundColor(fighter1IsWinner ? Color(red: 0.608, green: 1.0, blue: 0.020) : .white) // #9BFF05 for winner
                            .lineLimit(1)
                            .onAppear {
                                // Debug apenas para lutas finalizadas
                                if fight.isFinished {
                                    print("🔍 Debug: Fighter1 - ID: \(fight.fighter1.id), Winner: '\(fight.winner ?? "nil")', IsFinished: \(fight.isFinished), IsWinner: \(fighter1IsWinner)")
                                }
                        }
                    }
                    
                    // Bottom row: Victory indicator + Record
                    HStack(alignment: .top, spacing: 4) {
                        // Victory indicator for winner (left side for fighter 1)
                        if fighter1IsWinner, let victoryInfo = victoryInfo {
                            Text(victoryInfo)
                                .font(.inter(size: 10, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Color(red: 0.608, green: 1.0, blue: 0.020)) // Same green as winner name
                                )
                                .offset(y: -1)
                        }
                        
                        if let record = fight.fighter1.record, !record.isEmpty {
                            Text(record)
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(.gray)
                        } else {
                            Text("No record")
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(.gray.opacity(0.5))
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .trailing)
                
                // VS com bandeiras SVG - Lista de lutas
                HStack(spacing: 8) {
                    if let flagSvg = fight.fighter1.countryFlagSvg {
                        FlagSvgView(svgString: flagSvg, size: 16, countryName: fight.fighter1.country)
                    } else {
                        Text(fight.fighter1.countryFlag)
                            .font(.system(size: 16))
                    }
                   
                    Text("VS")
                        .font(.inter(size: 12, weight: .medium))
                        .foregroundColor(.gray)
                  
                    if let flagSvg = fight.fighter2.countryFlagSvg {
                        FlagSvgView(svgString: flagSvg, size: 16, countryName: fight.fighter2.country)
                    } else {
                        Text(fight.fighter2.countryFlag)
                            .font(.system(size: 16))
                    }
                }
                .offset(y: -8)
                .frame(width: 66)
                .frame(maxHeight: .infinity, alignment: .center)

                
                // Fighter 2
                VStack(alignment: .leading, spacing: 2) {
                    // Top row: Ranking + Name
                    HStack(alignment: .top, spacing: 4) {
                        Text(fight.fighter2.name)
                            .font(.rajdhani(size: 18, weight: .bold))
                            .foregroundColor(fighter2IsWinner ? Color(red: 0.608, green: 1.0, blue: 0.020) : .white) // #9BFF05 for winner
                            .lineLimit(1)
                            .onAppear {
                                // Debug apenas para lutas finalizadas
                                if fight.isFinished {
                                    print("🔍 Debug: Fighter2 - ID: \(fight.fighter2.id), Winner: '\(fight.winner ?? "nil")', IsFinished: \(fight.isFinished), IsWinner: \(fighter2IsWinner)")
                                }
                        }

                        // Ranking badge
                        if let ranking = fight.fighter2.ranking {
                            Text(ranking)
                                .font(.rajdhani(size: 12, weight: .bold))
                                .foregroundColor(ranking == "C" ? .black : .white)
                                .padding(.horizontal, 5)
                                .padding(.vertical, 1)
                                .background(
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(ranking == "C" ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color.gray.opacity(0.6)) // #FBFF05
                                )
                                .offset(y: 2)
                        }
                        
                        
                    }
                    
                    // Bottom row: Record + Victory indicator
                    HStack(alignment: .top, spacing: 4) {
                        if let record = fight.fighter2.record, !record.isEmpty {
                            Text(record)
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(.gray)
                        } else {
                            Text("No record")
                                .font(.inter(size: 12, weight: .medium))
                                .foregroundColor(.gray.opacity(0.5))
                        }
                        
                        // Victory indicator for winner (right side for fighter 2)
                        if fighter2IsWinner, let victoryInfo = victoryInfo {
                            Text(victoryInfo)
                                .font(.inter(size: 10, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Color(red: 0.608, green: 1.0, blue: 0.020)) // Same green as winner name
                                )
                                .offset(y: -1)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            
          
        }
        .padding(8)
        .overlay(
            Group {
                if !isLastFight {
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 1)
                        .offset(y: 4) // Posiciona a borda na parte inferior
                }
            },
            alignment: .bottom
        )
    }
}

 