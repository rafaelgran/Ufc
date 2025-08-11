import Foundation
import UserNotifications

// MARK: - Remote Notification Service

class RemoteNotificationService: ObservableObject {
    static let shared = RemoteNotificationService()
    
    @Published var deviceToken: String?
    @Published var isRegistered = false
    
    private init() {}
    
    // MARK: - Device Registration
    
    func registerDevice(with token: String) {
        self.deviceToken = token
        self.isRegistered = true
        
        // Salvar token localmente
        UserDefaults.standard.set(token, forKey: "device_token")
        
        // Enviar token para o servidor
        sendTokenToServer(token)
    }
    
    // MARK: - Server Communication
    
    private func sendTokenToServer(_ token: String) {
        print("🚀 sendTokenToServer called with token: \(token)")
        
        // URL do Supabase Edge Function
        guard let url = URL(string: "https://igxztpjrojdmyzzhqxsv.supabase.co/functions/v1/register-device") else {
            print("❌ Invalid Supabase URL")
            return
        }
        
        print("🌐 Sending token to URL: \(url)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Adicionar header de autorização com JWT
        if let jwt = getCurrentUserJWT() {
            request.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
            print("🔑 Service Role Key header added: Bearer \(jwt.prefix(50))...")
        } else {
            print("❌ No Service Role Key available, cannot register device")
            return
        }
        
        let body: [String: Any] = [
            "device_token": token,
            "platform": "iOS"
        ]
        
        print("📦 Request body: \(body)")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
            print("✅ Request body serialized successfully")
        } catch {
            print("❌ Error serializing request body: \(error)")
            return
        }
        
        print("📤 Starting URLSession request...")
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                print("📥 Response received!")
                
                if let error = error {
                    print("❌ Error sending token to Supabase: \(error)")
                    self?.isRegistered = false
                } else if let httpResponse = response as? HTTPURLResponse {
                    print("📊 HTTP Status: \(httpResponse.statusCode)")
                    
                    if let data = data, let responseString = String(data: data, encoding: .utf8) {
                        print("📄 Response data: \(responseString)")
                    }
                    
                    if httpResponse.statusCode == 200 {
                        print("✅ Device registered successfully with Supabase")
                        self?.isRegistered = true
                    } else {
                        print("❌ Supabase error: \(httpResponse.statusCode)")
                        if let data = data, let errorMessage = String(data: data, encoding: .utf8) {
                            print("❌ Error details: \(errorMessage)")
                        }
                        self?.isRegistered = false
                    }
                } else {
                    print("❌ No HTTP response received")
                    self?.isRegistered = false
                }
            }
        }.resume()
        
        print("📤 URLSession request started")
    }
    
    // MARK: - Notification Handling
    
    func handleRemoteNotification(_ userInfo: [AnyHashable: Any]) {
        print("📱 Handling remote notification: \(userInfo)")
        
        // Processar diferentes tipos de notificação
        if let type = userInfo["type"] as? String {
            switch type {
            case "event_start":
                handleEventStartNotification(userInfo)
            case "event_reminder":
                handleEventReminderNotification(userInfo)
            case "fight_result":
                handleFightResultNotification(userInfo)
            case "general":
                handleGeneralNotification(userInfo)
            default:
                print("⚠️ Unknown notification type: \(type)")
            }
        }
    }
    
    /// Processa notificações locais (quando o usuário toca nelas)
    func handleLocalNotification(_ userInfo: [AnyHashable: Any]) {
        print("📱 Handling local notification: \(userInfo)")
        
        if let type = userInfo["type"] as? String {
            switch type {
            case "event_start":
                handleEventStartNotification(userInfo)
            default:
                print("⚠️ Unknown local notification type: \(type)")
            }
        }
    }
    
    /// Processa push notifications do servidor
    func handleServerPushNotification(_ userInfo: [AnyHashable: Any]) {
        print("📱 Handling server push notification: \(userInfo)")
        
        if let type = userInfo["type"] as? String {
            switch type {
            case "event_start":
                handleEventStartNotification(userInfo)
            case "event_reminder":
                handleEventReminderNotification(userInfo)
            case "fight_result":
                handleFightResultNotification(userInfo)
            case "general":
                handleGeneralNotification(userInfo)
            default:
                print("⚠️ Unknown server notification type: \(type)")
            }
        }
    }
    
    private func handleEventStartNotification(_ userInfo: [AnyHashable: Any]) {
        if let eventName = userInfo["event_name"] as? String,
           let eventId = userInfo["event_id"] as? Int {
            print("🎯 Event starting: \(eventName) (ID: \(eventId))")
            
            // Iniciar Live Activity automaticamente
            Task {
                await startLiveActivityForEvent(eventId: eventId, eventName: eventName)
            }
            
            // Notificar outros componentes do app
            NotificationCenter.default.post(name: .navigateToEvent, object: eventName)
        }
    }
    
    private func handleEventReminderNotification(_ userInfo: [AnyHashable: Any]) {
        if let eventName = userInfo["event_name"] as? String,
           let minutesLeft = userInfo["minutes_left"] as? Int {
            print("⏰ Event reminder: \(eventName) in \(minutesLeft) minutes")
        }
    }
    
    private func handleFightResultNotification(_ userInfo: [AnyHashable: Any]) {
        if let fighterName = userInfo["fighter_name"] as? String,
           let result = userInfo["result"] as? String {
            print("🥊 Fight result: \(fighterName) - \(result)")
        }
    }
    
    private func handleGeneralNotification(_ userInfo: [AnyHashable: Any]) {
        if let message = userInfo["message"] as? String {
            print("📢 General notification: \(message)")
        }
    }
    
    // MARK: - Live Activity Integration
    
    /// Inicia a Live Activity para um evento específico
    private func startLiveActivityForEvent(eventId: Int, eventName: String) async {
        print("🎯 Starting Live Activity for event: \(eventName) (ID: \(eventId))")
        
        // Aqui você precisará buscar o evento completo do seu sistema
        // Por enquanto, vamos apenas imprimir uma mensagem
        print("📱 Live Activity should start for event: \(eventName)")
        
        // TODO: Implementar busca do evento e início da Live Activity
        // Exemplo de como seria:
        // if let event = await fetchEvent(by: eventId) {
        //     await LiveActivityService.shared.startEventActivity(for: event)
        // }
    }
    
    // MARK: - Utility Methods
    
    func getStoredToken() -> String? {
        return UserDefaults.standard.string(forKey: "device_token")
    }
    
    func clearStoredToken() {
        UserDefaults.standard.removeObject(forKey: "device_token")
        deviceToken = nil
        isRegistered = false
    }
    
    // MARK: - Test Methods
    
    func sendTestNotification() {
        // Método para testar notificações locais
        let content = UNMutableNotificationContent()
        content.title = "🧪 Test Notification"
        content.body = "This is a test notification from the app"
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
        let request = UNNotificationRequest(identifier: "test-notification", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Error scheduling test notification: \(error)")
            } else {
                print("✅ Test notification scheduled successfully")
            }
        }
    }
    
    /// Verifica e solicita permissões de notificação
    func checkNotificationPermissions() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                print("📱 Notification Settings:")
                print("   - Authorization Status: \(settings.authorizationStatus.rawValue)")
                print("   - Alert: \(settings.alertSetting.rawValue)")
                print("   - Badge: \(settings.badgeSetting.rawValue)")
                print("   - Sound: \(settings.soundSetting.rawValue)")
                
                if settings.authorizationStatus == .notDetermined {
                    self.requestNotificationPermissions()
                } else if settings.authorizationStatus == .denied {
                    print("❌ Notifications are denied. User needs to enable in Settings.")
                }
            }
        }
    }
    
    /// Solicita permissões de notificação
    func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                if granted {
                    print("✅ Notification permissions granted")
                } else {
                    print("❌ Notification permissions denied: \(error?.localizedDescription ?? "Unknown error")")
                }
            }
        }
    }
    
    /// Lista todas as notificações agendadas
    func listScheduledNotifications() {
        UNUserNotificationCenter.current().getPendingNotificationRequests { requests in
            DispatchQueue.main.async {
                print("📅 Scheduled Notifications (\(requests.count) total):")
                for request in requests {
                    if let trigger = request.trigger as? UNCalendarNotificationTrigger {
                        let nextTriggerDate = trigger.nextTriggerDate()
                        print("   - ID: \(request.identifier)")
                        print("     Title: \(request.content.title)")
                        print("     Body: \(request.content.body)")
                        print("     Next Trigger: \(nextTriggerDate?.description ?? "Unknown")")
                        print("     UserInfo: \(request.content.userInfo)")
                        print("   ---")
                    }
                }
            }
        }
    }
    
    // MARK: - Event Scheduling Methods
    
    /// Agenda notificações para um evento
    func scheduleEventNotifications(for event: UFCEvent) {
        print("📅 Scheduling notification for event: \(event.name)")
        print("   - Event ID: \(event.id)")
        print("   - Event Date String: \(event.date)")
        
        // Remover notificações antigas para este evento
        removeEventNotifications(for: event)
        
        // Converter data do evento para Date
        guard let eventDate = parseEventDate(event.date) else {
            print("❌ Could not parse event date: \(event.date)")
            return
        }
        
        print("   - Parsed Event Date: \(eventDate)")
        print("   - Current Date: \(Date())")
        print("   - Time Until Event: \(eventDate.timeIntervalSince(Date())) seconds")
        
        // Verificar se o evento já passou
        if eventDate <= Date() {
            print("❌ Event has already passed, not scheduling notification")
            return
        }
        
        // Agendar notificação para o início exato do evento
        scheduleEventStartNotification(for: event, at: eventDate)
        
        print("✅ Notification scheduled for event: \(event.name) at \(eventDate)")
        
        // Listar notificações agendadas para debug
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.listScheduledNotifications()
        }
    }
    
    /// Remove notificações de um evento
    func removeEventNotifications(for event: UFCEvent) {
        let identifiers = [
            "event-start-\(event.id)"
        ]
        
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: identifiers)
        print("🗑️ Removed notification for event: \(event.name)")
    }
    
    /// Remove todas as notificações (útil para limpeza)
    func removeAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        print("🗑️ Removed all scheduled notifications")
    }
    
    /// Remove notificações de teste específicas
    func removeTestNotifications() {
        let identifiers = [
            "event-start-999",  // Notificação de teste
            "test-notification" // Outras notificações de teste
        ]
        
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: identifiers)
        print("🧹 Removed test notifications")
    }
    
    /// Agenda lembretes para todos os eventos
    func scheduleAllEventNotifications() {
        // Aqui você pode buscar todos os eventos do seu sistema
        // Por enquanto, vamos apenas imprimir uma mensagem
        print("📅 Scheduling start notifications for all events...")
        
        // Exemplo de como seria:
        // for event in events {
        //     scheduleEventNotifications(for: event)
        // }
    }
    
    /// Verifica e atualiza notificações para todos os eventos
    /// Útil para reagendar quando horários mudam no banco
    func updateAllEventNotifications(for events: [UFCEvent]) {
        print("🔄 Updating notifications for \(events.count) events...")
        
        for event in events {
            // Só agendar para eventos futuros
            if let eventDate = parseEventDate(event.date), eventDate > Date() {
                print("📅 Updating notification for event: \(event.name)")
                scheduleEventNotifications(for: event)
            }
        }
        
        // Listar notificações agendadas para debug
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.listScheduledNotifications()
        }
    }
    
    // MARK: - Private Helper Methods
    
    private func parseEventDate(_ dateString: String) -> Date? {
        let formatter = DateFormatter()
        
        // Configurar timezone para GMT-3 (horário de Brasília)
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        
        // Lista de formatos de data para tentar (incluindo ISO 8601)
        let dateFormats = [
            "yyyy-MM-dd'T'HH:mm:ss.SSSZ",  // 2025-08-11T16:30:00.000+00:00
            "yyyy-MM-dd'T'HH:mm:ssZ",      // 2025-08-11T16:30:00+00:00
            "yyyy-MM-dd'T'HH:mm:ss",       // 2025-08-11T16:30:00
            "yyyy-MM-dd'T'HH:mm",          // 2025-08-11T16:30
            "yyyy-MM-dd HH:mm:ss",         // 2025-08-11 16:30:00
            "yyyy-MM-dd HH:mm"             // 2025-08-11 16:30
        ]
        
        for format in dateFormats {
            formatter.dateFormat = format
            if let date = formatter.date(from: dateString) {
                print("✅ Date parsed successfully with format: \(format)")
                return date
            }
        }
        
        // Se nenhum formato funcionou, tentar com ISO8601DateFormatter
        let isoFormatter = ISO8601DateFormatter()
        if let date = isoFormatter.date(from: dateString) {
            print("✅ Date parsed successfully with ISO8601DateFormatter")
            return date
        }
        
        print("❌ All date parsing attempts failed for: \(dateString)")
        return nil
    }
    
    private func scheduleEventStartNotification(for event: UFCEvent, at eventDate: Date) {
        // Só agendar se ainda não passou
        guard eventDate > Date() else { return }
        
        // Obter a luta principal (main event) - luta com fightOrder = 1 ou fightType = "main"
        let mainEventText = getMainEventText(for: event)
        
        let content = UNMutableNotificationContent()
        content.title = "🎯 \(event.name) is LIVE!"
        content.body = "\(event.name) - \(mainEventText) is live! Join live now!"
        content.sound = .default
        content.userInfo = [
            "type": "event_start",
            "event_id": event.id,
            "event_name": event.name
        ]
        
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: eventDate),
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: "event-start-\(event.id)",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Error scheduling start notification for \(event.name): \(error)")
            } else {
                print("✅ Start notification scheduled for \(event.name) at \(eventDate)")
            }
        }
    }
    
    /// Obtém o texto da luta principal
    private func getMainEventText(for event: UFCEvent) -> String {
        guard let fights = event.fights, !fights.isEmpty else {
            return "Main Event"
        }
        
        // Procurar pela luta principal (fightOrder = 1 ou fightType = "main")
        let mainEventFight = fights.first { fight in
            fight.fightOrder == 1 || fight.fightType == "main"
        }
        
        if let mainFight = mainEventFight {
            let fighter1Name = mainFight.fighter1.name
            let fighter2Name = mainFight.fighter2.name
            let weightClass = mainFight.weightClass
            
            return "\(fighter1Name) vs \(fighter2Name) (\(weightClass))"
        }
        
        // Fallback: usar a primeira luta se não encontrar a principal
        let firstFight = fights.first!
        let fighter1Name = firstFight.fighter1.name
        let fighter2Name = firstFight.fighter2.name
        let weightClass = firstFight.weightClass
        
        return "\(fighter1Name) vs \(fighter2Name) (\(weightClass))"
    }
    
    // MARK: - JWT Management
    
    /// Obtém o JWT do usuário atual
    private func getCurrentUserJWT() -> String? {
        // Por enquanto, vamos usar uma abordagem simples
        // Em produção, você deve integrar com o sistema de autenticação do Supabase
        return UserDefaults.standard.string(forKey: "user_jwt")
    }
    
    /// Define o JWT do usuário atual
    func setCurrentUserJWT(_ jwt: String) {
        UserDefaults.standard.set(jwt, forKey: "user_jwt")
        print("✅ JWT stored for user")
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let navigateToEvent = Notification.Name("navigateToEvent")
}
