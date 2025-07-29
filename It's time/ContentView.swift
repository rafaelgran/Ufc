//
//  ContentView.swift
//  It's time
//
//  Created by Rafael Granemann on 23/04/25.
//

import SwiftUI
import WidgetKit

struct ContentView: View {
    @StateObject private var eventService = UFCEventService()
    @State private var selectedEventFilter: String = "Upcoming Events"
    @State private var lastUpdateTime: Date = Date()
    @State private var isHeaderVisible = true
    @State private var lastScrollOffset: CGFloat = 0
    @State private var octagonOffsetAdjustment: CGFloat = -140
    @State private var showDebugMessage: String = ""
    @State private var widgetDebug: String = ""
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient similar to the image
                ZStack {
                    // Base #111111 background
                    Color(red: 0.067, green: 0.067, blue: 0.067) // #111111
                        .ignoresSafeArea()
                    
                    // Top-left golden glow
                    RadialGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.9, green: 0.7, blue: 0.3).opacity(0.15), // Golden glow - increased strength
                            Color.clear
                        ]),
                        center: .topLeading,
                        startRadius: 50,
                        endRadius: 400
                    )
                    .ignoresSafeArea()
                    
                    // Top-right reddish-purple glow
                    RadialGradient(
                        gradient: Gradient(colors: [
                            Color(red: 0.7, green: 0.3, blue: 0.5).opacity(0.15), // Reddish-purple glow - increased strength
                            Color.clear
                        ]),
                        center: .topTrailing,
                        startRadius: 50,
                        endRadius: 400
                    )
                    .ignoresSafeArea()
                }
                
                VStack(spacing: 0) {
                    // Header - Fixed at top with animation
                    HeaderView()
                        .offset(y: isHeaderVisible ? 0 : -100)
                        .animation(.easeInOut(duration: 0.3), value: isHeaderVisible)
                    
                    // Debug message (oculto)
                    if !showDebugMessage.isEmpty {
                        Text(showDebugMessage)
                            .font(.caption)
                            .foregroundColor(.green)
                            .padding(.horizontal)
                            .padding(.vertical, 4)
                            .background(Color.black.opacity(0.8))
                            .onAppear {
                                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                    showDebugMessage = ""
                                }
                            }
                    }
                    // Debug visual de eventos carregados (oculto)
                    // Text("Eventos carregados: \(eventService.events.count)")
                    //     .foregroundColor(.yellow)
                    //     .font(.caption)
                    //     .padding(.bottom, 4)
                    // Debug visual do widget (oculto)
                    // if !widgetDebug.isEmpty {
                    //     Text(widgetDebug)
                    //         .foregroundColor(.red)
                    //         .font(.caption)
                    //         .padding(.bottom, 4)
                    // }
                    // Debug visual de datas dos eventos (oculto)
                    // VStack(alignment: .leading, spacing: 2) {
                    //     ForEach(eventService.events, id: \.id) { event in
                    //         let parsedDate = parseEventDate(event.date)
                    //         let isFuture = parsedDate.map { $0 > Date() } ?? false
                    //         Text("\(event.name) | \(event.date) | \(parsedDate?.description ?? "parse FAIL") | Futuro: \(isFuture ? "SIM" : "NÃO")")
                    //             .font(.caption2)
                    //             .foregroundColor(isFuture ? .green : .orange)
                    //     }
                    // }
                    // .padding(.bottom, 4)
                    
                    // Scrollable content
                    ScrollView {
                        VStack(spacing: 0) {
                            // Featured Event Section
                            if let featuredEvent = getNextUpcomingEvent() {
                                FeaturedEventView(event: featuredEvent)
                            }
                            
                            // Event Filter
                            EventFilterView(selectedFilter: $selectedEventFilter)
                            
                            // Events List
                            EventsListView(filteredEvents: filteredEvents)
                        }
                        // .background(
                        //     // Large octagon background decoration - fixed position
                        //     HStack {
                        //         Spacer()
                        //         Image(systemName: "octagon.fill")
                        //             .foregroundColor(Color(red: 0.067, green: 0.067, blue: 0.067)) // #111111
                        //             .font(.system(size: UIScreen.main.bounds.width * 1.35)) // 20% maior que a largura da tela
                        //             .overlay(
                        //                 // Rectangle that starts from the middle of the octagon and goes to the bottom
                        //                 Rectangle()
                        //                     .fill(Color(red: 0.067, green: 0.067, blue: 0.067)) // #111111
                        //                     .frame(width: UIScreen.main.bounds.width * 1.2, height: backgroundRectangleHeight)
                        //                     .offset(y: backgroundRectangleOffset)
                        //             )
                        //         Spacer()
                        //     }
                        //     .offset(y: backgroundElementInitialOffset + octagonOffsetAdjustment)
                        //     .allowsHitTesting(false) // Não interfere com interações
                        // )
                        .background(
                            GeometryReader { geometry in
                                Color.clear
                                    .preference(key: ScrollOffsetPreferenceKey.self, value: geometry.frame(in: .named("scroll")).minY)
                            }
                        )
                    }
                    .scrollIndicators(.hidden) // Remove scroll indicators
                    .coordinateSpace(name: "scroll")
                    .refreshable {
                        // Refresh data
                        await refreshData()
                    }
                    .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
                        let currentOffset = value
                        let scrollDirection = currentOffset > lastScrollOffset ? "up" : "down"
                        
                        // Show header when scrolling up, hide when scrolling down
                        if scrollDirection == "up" && !isHeaderVisible {
                            isHeaderVisible = true
                        } else if scrollDirection == "down" && isHeaderVisible && currentOffset < -50 {
                            isHeaderVisible = false
                        }
                        
                        lastScrollOffset = currentOffset
                    }
                }
            }
        }
        .onAppear {
            Task {
                await refreshData()
            }
        }
        .onReceive(Timer.publish(every: 30, on: .main, in: .common).autoconnect()) { _ in
            Task {
                await refreshData()
            }
        }
    }
    
    private func refreshData() async {
        await eventService.fetchEvents()
        lastUpdateTime = Date()
        
        // Update widget with next event
        updateWidgetWithNextEvent()
    }
    
    private func updateWidgetWithNextEvent() {
        // widgetDebug = "Método chamado"
        // print("🟢 updateWidgetWithNextEvent called")
        guard let nextEvent = eventService.events.first(where: { event in
            guard let eventDate = parseEventDate(event.date) else { return false }
            return eventDate > Date()
        }) else {
            // widgetDebug = "Nenhum evento futuro encontrado"
            // print("🔴 Nenhum evento futuro encontrado")
            return
        }
        
        guard let firstFight = nextEvent.fights?.first else {
            // widgetDebug = "Evento sem lutas"
            // print("🔴 Evento sem lutas")
            return
        }
        
        
        let userDefaults = UserDefaults(suiteName: "group.com.ufcapp.widget")
        let eventData: [String: Any] = [
            "eventName": nextEvent.name,
            "fighter1Name": firstFight.fighter1.name,
            "fighter2Name": firstFight.fighter2.name,
            "eventDate": parseEventDate(nextEvent.date)?.timeIntervalSince1970 ?? Date().timeIntervalSince1970,
            "location": nextEvent.location ?? "",
            "weightClass": firstFight.weightClass,
            "isChampionship": firstFight.isChampionship
        ]
        
        userDefaults?.set(eventData, forKey: "nextEvent")
        // print("🔄 Widget data saved: \(eventData)")
        
        WidgetCenter.shared.reloadAllTimelines()
    }
    
    private func parseEventDate(_ dateString: String) -> Date? {
        let formatter = DateFormatter()
        
        // Configure timezone para GMT-3 (horário de Brasília)
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        
        let dateFormats = [
            "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
            "yyyy-MM-dd'T'HH:mm:ssZ",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm" // NOVO formato para datas como '2024-08-15 17:00'
        ]
        for format in dateFormats {
            formatter.dateFormat = format
            if let date = formatter.date(from: dateString) {
                return date
            }
        }
        return nil
    }
    
    // Dynamic background element calculations
    private var backgroundRectangleHeight: CGFloat {
        return UIScreen.main.bounds.height * 3 // 3x screen height for large scroll coverage
    }
    
    private var backgroundRectangleOffset: CGFloat {
        return UIScreen.main.bounds.height * 1.5 // Adjustable: 1.5x screen height for initial position
    }
    
    private var backgroundElementInitialOffset: CGFloat {
        return -60 // Adjustable: initial Y offset for the entire background element
    }
    
    private var filteredEvents: [UFCEvent] {
        let nextEvent = getNextUpcomingEvent()
        
        switch selectedEventFilter {
        case "Past Events":
            return eventService.events.filter { !$0.isUpcoming }
        case "Upcoming Events":
            // Exclude the featured event from the upcoming events list
            let upcomingEvents = eventService.events.filter { $0.isUpcoming }
            if let nextEvent = nextEvent {
                return upcomingEvents.filter { $0.id != nextEvent.id }
            }
            return upcomingEvents
        default:
            return eventService.events
        }
    }
    
    private func getNextUpcomingEvent() -> UFCEvent? {
        let upcomingEvents = eventService.events.filter { $0.isUpcoming }
        
        // print("🔍 Debug: Total upcoming events: \(upcomingEvents.count)")
        // for event in upcomingEvents {
        //     print("🔍 Debug: Event: \(event.name), Date: \(event.date), IsUpcoming: \(event.isUpcoming)")
        // }
        
        // Sort by parsed date, not string date
        let sortedEvents = upcomingEvents.sorted { event1, event2 in
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
            
            var date1: Date?
            var date2: Date?
            
            for format in dateFormats {
                formatter.dateFormat = format
                if date1 == nil, let parsed1 = formatter.date(from: event1.date) {
                    date1 = parsed1
                }
                if date2 == nil, let parsed2 = formatter.date(from: event2.date) {
                    date2 = parsed2
                }
                if date1 != nil && date2 != nil {
                    break
                }
            }
            
            // If we can't parse dates, fall back to string comparison
            guard let date1 = date1, let date2 = date2 else {
                return event1.date < event2.date
            }
            
            return date1 < date2
        }
        
        // print("🔍 Debug: Sorted events:")
        // for event in sortedEvents {
        //     print("🔍 Debug: - \(event.name)")
        // }
        
        let nextEvent = sortedEvents.first
        // print("🔍 Debug: Selected next event: \(nextEvent?.name ?? "None")")
        
        return nextEvent
    }
}

// Preference key to track scroll offset
struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

struct HeaderView: View {
    var body: some View {
        ZStack {
            // Conteúdo do header
            HStack {
                // GET ULTRA button
                Button(action: {
                    // Action for GET ULTRA
                }) {
                    Text("GET ULTRA")
                        .font(.rajdhani(size: 14, weight: .bold))
                        .foregroundColor(Color(red: 1.0, green: 0.8, blue: 0.25)) // #FFCC40
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 20) // Fully rounded corners
                                .fill(Color(red: 1.0, green: 0.8, blue: 0.25).opacity(0.10)) // #FFCC40 with 5% opacity
                        )
                }
                
                Spacer()
                
                // Right side icons
                HStack(spacing: 12) {
                    Button(action: {
                        // Notification action
                    }) {
                        Image(systemName: "bell")
                            .foregroundColor(.white)
                            .font(.system(size: 18))
                            .frame(width: 40, height: 40)
                            .background(
                                Circle()
                                    .fill(Color(red: 0.15, green: 0.15, blue: 0.15).opacity(0.60))
                            )
                    }
                    
                    Button(action: {
                        // Profile action
                    }) {
                        Image(systemName: "person")
                            .foregroundColor(.white)
                            .font(.system(size: 18))
                            .frame(width: 40, height: 40)
                            .background(
                                Circle()
                                    .fill(Color(red: 0.15, green: 0.15, blue: 0.15).opacity(0.60))
                            )
                    }
                }
            }
            .padding(.horizontal, 10)
            .padding(.bottom, 8)
        }
    }
}

struct FeaturedEventView: View {
    let event: UFCEvent
    
    var body: some View {
        VStack(spacing: 4) {
            // UFC 323 - Top section
            Text(event.name)
                .font(.rajdhani(size: 24, weight: .bold))
                .foregroundColor(hasChampion ? Color(red: 1.0, green: 0.8, blue: 0.0) : Color(red: 0.945, green: 0.235, blue: 0.329)) // Golden for championship, #F13C54 for bout
            
            // Weight class and championship line
            HStack(spacing: 6) {
                // Championship belt icon - only show if there's a champion
                if hasChampion {
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
                
                Text(weightClassText)
                    .font(.rajdhani(size: 18, weight: .medium))
                    .foregroundColor(.white)
                
                // Always show the text (CHAMPIONSHIP or BOUT)
                Text(championshipText)
                    .font(.rajdhani(size: 18, weight: .medium))
                    .foregroundColor(hasChampion ? Color(red: 1.0, green: 0.8, blue: 0.0) : Color(red: 0.945, green: 0.235, blue: 0.329)) // Golden for championship, #F13C54 for bout
            }
            
            // Fighter names with VS
            VStack(spacing: -8) {
                // First fighter
                Text(firstFighterLastName)
                    .font(.rajdhani(size: sharedFontSize, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity)
                
                // VS with lines
                HStack(spacing: 12) {
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
                
                // Second fighter
                Text(secondFighterLastName)
                    .font(.rajdhani(size: sharedFontSize, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity)
            }
            .frame(maxWidth: .infinity)
            
            // Location - below fighter names
            Text("\(event.venue ?? "VENUE TBD") - \(event.location ?? "LOCATION TBD")".uppercased())
                .font(.rajdhani(size: 18, weight: .medium))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
            
            Spacer()
                .frame(height: 20)  


            // Countdown card
            CountdownCardView(event: event)

            Spacer()
                .frame(height: 20) 

        }
        .padding(.horizontal, 10)
        .padding(.top, 24)
    }
    
    // Computed properties to get fighter names
    private var firstFighterLastName: String {
        guard let firstFight = event.fights?.first else {
            return "FIGHTER 1"
        }
        
        let fullName = firstFight.fighter1.name
        let nameParts = fullName.components(separatedBy: " ")
        
        // Return all names except the first one
        if nameParts.count > 1 {
            let remainingNames = Array(nameParts.dropFirst())
            return remainingNames.joined(separator: " ").uppercased()
        } else {
            return fullName.uppercased()
        }
    }
    
    private var secondFighterLastName: String {
        guard let firstFight = event.fights?.first else {
            return "FIGHTER 2"
        }
        
        let fullName = firstFight.fighter2.name
        let nameParts = fullName.components(separatedBy: " ")
        
        // Return all names except the first one
        if nameParts.count > 1 {
            let remainingNames = Array(nameParts.dropFirst())
            return remainingNames.joined(separator: " ").uppercased()
        } else {
            return fullName.uppercased()
        }
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
    
    private var hasChampion: Bool {
        guard let firstFight = event.fights?.first else {
            return false
        }
        return firstFight.isChampionship
    }
    
    // Calculate shared font size based on the longest name
    private var sharedFontSize: CGFloat {
        let longestName = firstFighterLastName.count > secondFighterLastName.count ? firstFighterLastName : secondFighterLastName
        return calculateFontSize(for: longestName)
    }
    
    // Calculate VS line width to match the longest name width
    private var vsLineWidth: CGFloat {
        let longestName = firstFighterLastName.count > secondFighterLastName.count ? firstFighterLastName : secondFighterLastName
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

struct CountdownCardView: View {
    let event: UFCEvent
    @State private var currentTime = Date()
    @State private var showingEventDetail = false
    
    var body: some View {
        Button(action: {
            showingEventDetail = true
        }) {
            VStack(spacing: 16) {
                HStack(alignment: .center) {  // Voltando para .top para alinhar com os eventos upcoming
                    // Date and time
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
                    
                    Image(systemName: "chevron.right")
                        .foregroundColor(.gray)
                        .font(.system(size: 14))
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(red: 0.2, green: 0.2, blue: 0.2).opacity(0.3))
            )
        }
        .buttonStyle(PlainButtonStyle())
        .sheet(isPresented: $showingEventDetail) {
            EventDetailView(event: event)
        }
        .onAppear {
            // Start timer to update countdown
            Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
                currentTime = Date()
            }
        }
    }
    
    // Computed property to calculate time remaining based on current time
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
            if let date = formatter.date(from: event.date) {
                return date
            }
        }
        
        return nil
    }
}

struct EventFilterView: View {
    @Binding var selectedFilter: String
    
    var body: some View {
        ZStack {
            // Background container
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white.opacity(0.025))
                .frame(height: 44)
            
            // Sliding indicator
            RoundedRectangle(cornerRadius: 18)
                .fill(Color.white.opacity(0.05))
                .frame(width: (UIScreen.main.bounds.width - 20) * 0.5 - 4, height: 36)
                .offset(x: selectedFilter == "Past Events" ? 
                    -(UIScreen.main.bounds.width - 20) * 0.25 + 2 : 
                    (UIScreen.main.bounds.width - 20) * 0.25 - 2)
                .animation(.easeInOut(duration: 0.3), value: selectedFilter)
            
            // Buttons overlay
            HStack(spacing: 0) {
                // Past Events button
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        selectedFilter = "Past Events"
                    }
                }) {
                    Text("Past Events")
                        .font(.rajdhani(size: 14, weight: .bold))
                        .foregroundColor(.white)
                        .opacity(selectedFilter == "Past Events" ? 1.0 : 0.5)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                }
                
                // Upcoming Events button
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        selectedFilter = "Upcoming Events"
                    }
                }) {
                    Text("Upcoming Events")
                        .font(.rajdhani(size: 14, weight: .bold))
                        .foregroundColor(.white)
                        .opacity(selectedFilter == "Upcoming Events" ? 1.0 : 0.5)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                }
            }
        }
        .padding(.horizontal, 10)
        .padding(.top, 20)
    }
}

struct EventsListView: View {
    let filteredEvents: [UFCEvent]
    
    var body: some View {
        LazyVStack(spacing: 16) {
            ForEach(filteredEvents) { event in
                EventListItemView(event: event)
            }
        }
        .padding(.horizontal, 10)
        .padding(.top, 20)
        .padding(.bottom, 40)
    }
}

struct EventListItemView: View {
    let event: UFCEvent
    @State private var showingEventDetail = false
    
    var body: some View {
        Button(action: {
            showingEventDetail = true
        }) {
            HStack(spacing: 16) {
                // Date
                VStack(spacing: 2) {
                    Text(eventDayString)
                        .font(.rajdhani(size: 22, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(eventMonthString)
                        .font(.inter(size: 12, weight: .bold))
                        .foregroundColor(.gray)
                }
                .frame(width: 40)
                
                // Event details
                VStack(alignment: .leading, spacing: 4) {
                    Text(mainFightTitle)
                        .font(.rajdhani(size: 20, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    
                    Text(event.name)
                        .font(.inter(size: 12, weight: .bold))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }
                
                Spacer()
                
                // Championship belt and arrow
                HStack(spacing: 8) {
                    // Championship belt - only show if event has championship fights
                    if eventHasChampionship {
                        HStack(spacing: 2) {
                            Rectangle()
                                .fill(Color.gray)
                                .frame(width: 4, height: 6)
                            
                            Image(systemName: "octagon.fill")
                                .foregroundColor(Color(red: 1.0, green: 0.8, blue: 0.0))
                                .font(.system(size: 12))
                            
                            Rectangle()
                                .fill(Color.gray)
                                .frame(width: 4, height: 6)
                        }
                    }
                    
                    // Arrow
                    Image(systemName: "chevron.right")
                        .foregroundColor(.gray)
                        .font(.system(size: 14))
                }
            }
            .padding(.horizontal, 0)
            .padding(.top, 10)
            .padding(.bottom, 10)
            .overlay(
                Rectangle()
                    .fill(Color.gray.opacity(0.1))
                    .frame(height: 1)
                    .offset(y: 10), // Posiciona a borda na parte inferior
                alignment: .bottom
            )
        }
        .buttonStyle(PlainButtonStyle())
        .sheet(isPresented: $showingEventDetail) {
            EventDetailView(event: event)
        }
    }
    
    private var eventDayString: String {
        guard let eventDate = parseEventDate() else {
            return "TBD"
        }
        
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: eventDate)
    }
    
    private var eventMonthString: String {
        guard let eventDate = parseEventDate() else {
            return "TBD"
        }
        
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM"
        formatter.locale = Locale(identifier: "en_US")
        return formatter.string(from: eventDate)
    }
    
    private func parseEventDate() -> Date? {
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
            if let date = formatter.date(from: event.date) {
                return date
            }
        }
        
        return nil
    }
    
    private var mainFightTitle: String {
        guard let firstFight = event.fights?.first else {
            return "Event Details"
        }
        
        let fighter1Name = firstFight.fighter1.name
        let fighter2Name = firstFight.fighter2.name
        
        // Get all names except the first one
        let fighter1NameParts = fighter1Name.components(separatedBy: " ")
        let fighter2NameParts = fighter2Name.components(separatedBy: " ")
        
        let fighter1DisplayName: String
        let fighter2DisplayName: String
        
        if fighter1NameParts.count > 1 {
            let remainingNames = Array(fighter1NameParts.dropFirst())
            fighter1DisplayName = remainingNames.joined(separator: " ")
        } else {
            fighter1DisplayName = fighter1Name
        }
        
        if fighter2NameParts.count > 1 {
            let remainingNames = Array(fighter2NameParts.dropFirst())
            fighter2DisplayName = remainingNames.joined(separator: " ")
        } else {
            fighter2DisplayName = fighter2Name
        }
        
        return "\(fighter1DisplayName) vs \(fighter2DisplayName)"
    }
    
    private var eventHasChampionship: Bool {
        guard let fights = event.fights else { return false }
        return fights.contains { $0.isChampionship }
    }
}

#Preview {
    ContentView()
}
