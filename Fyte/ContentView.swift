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
    @StateObject private var liveActivityService = LiveActivityService.shared
    @StateObject private var notificationService = NotificationService.shared
    @State private var selectedEventFilter: String = "Upcoming Events"
    
    @State private var lastUpdateTime: Date = Date()
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background color - #111111
                Color(red: 0.067, green: 0.067, blue: 0.067) // #111111
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Scrollable content
                    ScrollView {
                        VStack(spacing: 0) {
                            // Event Filter
                            EventFilterView(selectedFilter: $selectedEventFilter)
                            
                            // Featured Event Section - only show for Upcoming Events
                            if selectedEventFilter == "Upcoming Events", let featuredEvent = getNextUpcomingEvent() {
                                FeaturedEventView(event: featuredEvent)
                            }
                            
                            // Events List
                            EventsListView(filteredEvents: filteredEvents)
                            

                        }
                    }
                    .scrollIndicators(.hidden) // Remove scroll indicators
                    .refreshable {
                        // Refresh data
                        await refreshData()
                    }

                }
                
                // Header - POSICIONADO NO TOPO DA TELA
                VStack {
                    HeaderView(nextEvent: getNextUpcomingEvent())
                        .ignoresSafeArea(.all, edges: .top) // Estende até o topo da tela
                    
                    Spacer()
                }
            }
        }
        .onAppear {
            Task {
                await liveActivityService.checkActiveActivities()
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
        .onChange(of: selectedEventFilter) { oldValue, newValue in
        }
    }
    
    private func refreshData() async {
        await eventService.fetchEvents()
        lastUpdateTime = Date()
        
        // Atualizar notificações para todos os eventos (útil quando horários mudam no banco)
        RemoteNotificationService.shared.updateAllEventNotifications(for: eventService.events)
        
        // Update widget with next event
        updateWidgetWithNextEvent()
        
        // Verificar se algum evento está próximo para iniciar Live Activity
        await checkAndStartLiveActivities()
    }
    
    private func updateWidgetWithNextEvent() {
        print("🟢 updateWidgetWithNextEvent called")
        print("📊 Total de eventos carregados: \(eventService.events.count)")
        
        guard let nextEvent = eventService.events.first(where: { event in
            guard let eventDate = parseEventDate(event.date) else { 
                print("⚠️ Não foi possível fazer parse da data: \(event.date)")
                return false 
            }
            let isFuture = eventDate > Date()
            print("📅 Evento: \(event.name) - Data: \(event.date) - Parseado: \(eventDate) - Futuro: \(isFuture)")
            return isFuture
        }) else {
            print("🔴 Nenhum evento futuro encontrado")
            return
        }
        
        guard let firstFight = nextEvent.firstMainEventFight else {
            print("🔴 Evento sem lutas: \(nextEvent.name)")
            return
        }
        
        
        let userDefaults = UserDefaults(suiteName: "group.com.granemanndigital.dev")
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
        print("🔄 Widget data saved: \(eventData)")
        
        // Verificar se os dados foram salvos
        if let savedData = userDefaults?.dictionary(forKey: "nextEvent") {
            print("✅ Widget data verified: \(savedData)")
        } else {
            print("❌ Widget data not found after saving")
        }
        
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
    
    // Verificar e iniciar Live Activities para eventos próximos
    private func checkAndStartLiveActivities() async {
        // Primeiro, verificar e restaurar Live Activities perdidas
        await liveActivityService.checkAndRestoreLiveActivities(events: eventService.events)
        
        let upcomingEvents = eventService.events.filter { $0.isUpcoming }
        
        for event in upcomingEvents {
            await liveActivityService.startActivityIfNear(event: event)
        }
        
        // Verificar se algum evento já passou para parar Live Activities
        let pastEvents = eventService.events.filter { !$0.isUpcoming }
        for event in pastEvents {
            await liveActivityService.stopActivityIfFinished(event: event)
        }
    }
    
    private var filteredEvents: [UFCEvent] {
        let nextEvent = getNextUpcomingEvent()
        
        switch selectedEventFilter {
        case "Past Events":
            let pastEvents = eventService.events.filter { !$0.isUpcoming }
            // Sort past events by date (most recent first)
            return pastEvents.sorted { event1, event2 in
                let formatter = DateFormatter()
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
                    return event1.date > event2.date // Most recent first
                }
                
                return date1 > date2 // Most recent first
            }
        case "Upcoming Events":
            // Exclude the featured event from the upcoming events list
            let upcomingEvents = eventService.events.filter { $0.isUpcoming }
            if let nextEvent = nextEvent {
                let filteredUpcoming = upcomingEvents.filter { $0.id != nextEvent.id }
                return filteredUpcoming
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
        return nextEvent
    }
}



struct HeaderView: View {
    @StateObject private var liveActivityService = LiveActivityService.shared
    let nextEvent: UFCEvent?
    
    var body: some View {
        ZStack {
            // Background do header - #111111
            Color(red: 0.067, green: 0.067, blue: 0.067) // #111111
                .frame(height: 110) // Altura suficiente para o header
            
            // Conteúdo do header
            HStack {
                // GET ULTRA button
                Button(action: {
                    // Action for GET ULTRA
                }) {
                    Text("GET ULTRA")
                        .font(.rajdhani(size: 14, weight: .bold))
                        .foregroundColor(Color(red: 0.984, green: 1.0, blue: 0.020)) // #FBFF05
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 20) // Fully rounded corners
                                .stroke(Color(red: 0.984, green: 1.0, blue: 0.020), lineWidth: 1) // #FBFF05 border
                                .background(Color.clear) // Background transparente
                        )
                }
                
                Spacer()
                
                // Right side icons
                HStack(spacing: 12) {
                    // Live Activity Button
                    Button(action: {
                        Task {
                            if let nextEvent = nextEvent {
                                await liveActivityService.startEventActivity(for: nextEvent)
                            }
                        }
                    }) {
                        Image(systemName: "play.circle.fill")
                            .foregroundColor(.green)
                            .font(.system(size: 20))
                    }
                    .onLongPressGesture {
                        // Long press para parar Live Activity
                        Task {
                            await liveActivityService.stopCurrentActivity()
                        }
                    }
                    
                    // Test Push Registration Button
                    Button(action: {
                        print("🧪 Testing push notification registration...")
                        
                        // Forçar nova solicitação de push notifications
                        DispatchQueue.main.async {
                            UIApplication.shared.registerForRemoteNotifications()
                        }
                        
                        // Também solicitar permissões
                        RemoteNotificationService.shared.requestNotificationPermissions()
                    }) {
                        Image(systemName: "bell.badge")
                            .foregroundColor(.orange)
                            .font(.system(size: 20))
                    }
                    
                    
                    Button(action: {
                        // Profile action
                    }) {
                        Image(systemName: "person")
                            .foregroundColor(.white)
                            .font(.system(size: 18))
                            .frame(width: 40, height: 40)
                    }
                }
            }
            .padding(.horizontal, 10)
            .padding(.top, 58)
            .padding(.bottom, 8)
        }
    }
}

struct FeaturedEventView: View {
    let event: UFCEvent
    @State private var showingEventDetail = false
    @StateObject private var liveActivityService = LiveActivityService.shared
    
    var body: some View {
        ZStack {
            // Main content button
            Button(action: {
                showingEventDetail = true
            }) {
                ZStack {
                    // Conteúdo do evento
                    VStack(spacing: 4) {
                        // UFC 323 - Top section
                        Text(event.name)
                            .font(.rajdhani(size: 24, weight: .bold))
                            .foregroundColor(hasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // #FBFF05 for championship, #FF0550 for bout
                            .padding(.top, 32)
                            .padding(.horizontal, 20)
                
                // Weight class and championship line
                HStack(spacing: 6) {
                    // Championship belt icon - only show if there's a champion
                    if hasChampion {
                        BeltSvgView(size: 24)
                        .offset(y: -1)
                    }
                    
                    
                    Text(weightClassText)
                        .font(.rajdhani(size: 18, weight: .medium))
                        .foregroundColor(.white)
                    
                    // Always show the text (CHAMPIONSHIP or BOUT)
                    Text(championshipText)
                        .font(.rajdhani(size: 18, weight: .medium))
                        .foregroundColor(hasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // #FBFF05 for championship, #FF0550 for bout
                }
                .padding(.horizontal, 20)

                
                // Fighter names with VS
                VStack(spacing: -2) {
                    // First fighter
                    Text(firstFighterLastName)
                        .font(.rajdhani(size: sharedFontSize, weight: .bold))
                        .foregroundColor(hasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // #FBFF05 for championship, #FF0550 for bout
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                        .frame(maxWidth: .infinity)
                    
                    // VS com bandeiras SVG
                    HStack(spacing: 4) {
                        Rectangle()
                            .fill(Color.white)
                            .frame(height: 1)
                        
                        Spacer()
                        
                        // Primeira bandeira SVG
                        if let firstFight = event.firstMainEventFight {
                            if let flagSvg = firstFight.fighter1.countryFlagSvg {
                                FlagSvgView(svgString: flagSvg, size: 30, countryName: firstFight.fighter1.country)
                            } else {
                                Text(firstFight.fighter1.countryFlag)
                                    .font(.system(size: 30))
                            }
                        }
                        
                        Spacer()
                        
                        Text("VS")
                            .font(.rajdhani(size: 18, weight: .medium))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        // Segunda bandeira SVG
                        if let firstFight = event.firstMainEventFight {
                            if let flagSvg = firstFight.fighter2.countryFlagSvg {
                                FlagSvgView(svgString: flagSvg, size: 30, countryName: firstFight.fighter2.country)
                            } else {
                                Text(firstFight.fighter2.countryFlag)
                                    .font(.system(size: 30))
                            }
                        }
                        
                        Spacer()
                        
                        Rectangle()
                            .fill(Color.white)
                            .frame(height: 1)
                    }
                    .frame(maxWidth: .infinity)
                    
                    // Second fighter
                    Text(secondFighterLastName)
                        .font(.rajdhani(size: sharedFontSize, weight: .bold))
                        .foregroundColor(hasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // #FBFF05 for championship, #FF0550 for bout
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                        .frame(maxWidth: .infinity)
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 20)
                
                        // Location - below fighter names
                        Text("\(event.venue ?? "VENUE TBD") - \(event.location ?? "LOCATION TBD")".uppercased())
                            .font(.rajdhani(size: 18, weight: .medium))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                        
                        Spacer()
                            .frame(height: 20)  

                        // Countdown card
                        CountdownCardView(event: event)

                        Spacer()
                            .frame(height: 20) 


                    }
                }
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color(red: 0.106, green: 0.106, blue: 0.106).opacity(0.9)) // #1b1b1b com opacidade
                )
                .padding(.horizontal, 10)
                .padding(.top, 14)
            }
            .buttonStyle(PlainButtonStyle())
            

        }
        .sheet(isPresented: $showingEventDetail) {
            EventDetailView(event: event)
        }
    }
    
    // Computed properties to get fighter names
    private var firstFighterLastName: String {
        guard let firstFight = event.firstMainEventFight else {
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
        guard let firstFight = event.firstMainEventFight else {
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
    
    private var hasChampion: Bool {
        guard let firstFight = event.firstMainEventFight else {
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
        let vsTextWidth: CGFloat = 30 // Approximate width of "VS" text
        let spacing: CGFloat = 24 // Spacing between lines and VS
        let availableWidth = nameWidth - vsTextWidth - spacing
        return max(10, availableWidth / 2) // Each line gets half the remaining width, minimum 10px
    }
    
    // Gradiente de fundo padrão quando não há imagem
    private var defaultBackgroundGradient: some View {
        LinearGradient(
            gradient: Gradient(colors: [
                Color(red: 0.1, green: 0.1, blue: 0.1),
                Color(red: 0.05, green: 0.05, blue: 0.05)
            ]),
            startPoint: .top,
            endPoint: .bottom
        )
    }
    
    // Calculate font size to fit the longest name in 100% of screen width
    private func calculateFontSize(for name: String) -> CGFloat {
        let screenWidth = UIScreen.main.bounds.width - 60 // Account for all padding (20 from VStack + 20 from HStack + 20 extra margin)
        let maxFontSize: CGFloat = 150 // Increased significantly to allow larger fonts
        let minFontSize: CGFloat = 24
        
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
    @State private var isBlinking = false
    
    private var hasChampion: Bool {
        guard let firstFight = event.firstMainEventFight else {
            return false
        }
        return firstFight.isChampionship
    }
    
    var body: some View {
        HStack(alignment: .center) {
            if event.isLive {
                // LIVE NOW display
                VStack(alignment: .leading, spacing: -2) {
                    HStack(spacing: 8) {
                        Circle()
                            .fill(Color(red: 1.0, green: 0.020, blue: 0.314))
                            .frame(width: 7, height: 7)
                            .opacity(isBlinking ? 0.2 : 1.0)
                            .animation(Animation.easeInOut(duration: 0.7).repeatForever(autoreverses: true), value: isBlinking)
                        Text("LIVE NOW")
                            .font(.rajdhani(size: 24, weight: .bold))
                            .foregroundColor(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                    }
                    HStack(spacing: 8) {
                        Circle()
                            .fill(Color.clear)
                            .frame(width: 7, height: 7)
                        Text("Event in progress")
                            .font(.inter(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                .frame(maxHeight: .infinity, alignment: .top)
                .onAppear {
                    isBlinking = true
                }
                Spacer()
            } else {
                // Date and time
                VStack(alignment: .leading, spacing: -2) {
                    Text(eventDateString)
                        .font(.rajdhani(size: 28, weight: .bold))
                        .foregroundColor(hasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314))
                    HStack(spacing: 2) {
                        Text(eventTimeString)
                            .font(.inter(size: 13, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                        Text(userTimeZoneString)
                            .font(.inter(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                            .padding(.leading, 1)
                            .padding(.top, 1)
                    }
                }
                .frame(maxHeight: .infinity, alignment: .top)
                Spacer()
            }
            // SEE MORE button on the right (sempre visível)
            Text("SEE MORE")
                .font(.rajdhani(size: 14, weight: .bold))
                .foregroundColor(Color(red: 0.133, green: 0.133, blue: 0.133)) // #222222
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(hasChampion ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color(red: 1.0, green: 0.020, blue: 0.314)) // Amarelo para campeão, vermelho para bout
                )
        }
        .padding(12)
        .padding(.horizontal, 32)
        .onAppear {
            // Start timer to update countdown
            Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
                currentTime = Date()
            }
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
                .fill(.white.opacity(0.05)) // #111
                .frame(height: 44)
            
            // Sliding indicator
            RoundedRectangle(cornerRadius: 18)
                .fill(.white.opacity(0.10))
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
        .padding(.top, 60) // Aumentado para compensar o header sobreposto
    }
}

struct EventsListView: View {
    let filteredEvents: [UFCEvent]
    
    var body: some View {
        LazyVStack(spacing: 16) {
            if filteredEvents.isEmpty {
                VStack(spacing: 12) {
                    Text("Carregando eventos...")
                        .font(.rajdhani(size: 16, weight: .medium))
                        .foregroundColor(.gray)
                    
                    // Text("Tente mudar o filtro ou aguarde o carregamento")
                    //     .font(.inter(size: 12, weight: .regular))
                    //     .foregroundColor(.gray.opacity(0.7))
                    //     .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                ForEach(filteredEvents) { event in
                    EventListItemView(event: event)
                }
            }
        }
        .padding(.horizontal, 10)
        .padding(.top, 8)
        .padding(.bottom, 40)
        .onAppear {
        }
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
                        BeltSvgView(size: 24)
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
                    .fill(Color.gray.opacity(0.2))
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
        // Debug: Log all fights for this event
        print("🔍 Debug: Event '\(event.name)' has \(event.fights?.count ?? 0) fights")
        if let fights = event.fights {
            for (index, fight) in fights.enumerated() {
                print("  Fight \(index): \(fight.fighter1.name) vs \(fight.fighter2.name) (Type: \(fight.fightType ?? "nil"), Order: \(fight.fightOrder ?? -1))")
            }
        }
        
        // Use firstMainEventFight instead of first fight from the list
        guard let firstFight = event.firstMainEventFight else {
            print("⚠️ No main event fight found for event '\(event.name)', using fallback")
            // Fallback to first fight if no main event fight is found
            guard let fallbackFight = event.fights?.first else {
                return "Event Details"
            }
            
            let fighter1Name = fallbackFight.fighter1.name
            let fighter2Name = fallbackFight.fighter2.name
            
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
            
            print("📋 Using fallback fight: \(fighter1DisplayName) vs \(fighter2DisplayName)")
            return "\(fighter1DisplayName) vs \(fighter2DisplayName)"
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
        
        print("📋 Using main event fight: \(fighter1DisplayName) vs \(fighter2DisplayName)")
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
