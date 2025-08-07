//
//  NotificationService.swift
//  It's time
//
//  Created by Rafael Granemann on 24/07/25.
//

import Foundation
import UserNotifications

class NotificationService: ObservableObject {
    static let shared = NotificationService()
    
    private init() {
        requestPermission()
    }
    
    // Solicitar permissão para notificações
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                print("✅ Notificações permitidas")
            } else {
                print("❌ Notificações negadas")
            }
        }
    }
    
    // Simular Live Activity com notificação local
    func simulateLiveActivity(for event: UFCEvent) {
        let content = UNMutableNotificationContent()
        content.title = "🥊 UFC Event Starting"
        content.body = "\(event.name) - \(event.mainEvent ?? "Main Event")"
        content.sound = .default
        
        // Notificação imediata
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "ufc-event-\(event.id)", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Erro ao agendar notificação: \(error)")
            } else {
                print("✅ Notificação agendada para: \(event.name)")
            }
        }
    }
    
    // Notificação de countdown
    func scheduleCountdownNotification(for event: UFCEvent, minutesBefore: Int) {
        let content = UNMutableNotificationContent()
        content.title = "⏰ UFC Event in \(minutesBefore) minutes"
        content.body = "\(event.name) - Get ready for the main event!"
        content.sound = .default
        
        // Calcular tempo para a notificação
        let eventDate = parseEventDate(event.date)
        let notificationDate = eventDate?.addingTimeInterval(-TimeInterval(minutesBefore * 60)) ?? Date()
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: notificationDate), repeats: false)
        let request = UNNotificationRequest(identifier: "ufc-countdown-\(event.id)", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Erro ao agendar countdown: \(error)")
            } else {
                print("✅ Countdown agendado para: \(event.name) em \(minutesBefore) minutos")
            }
        }
    }
    
    // Notificação de evento ao vivo
    func scheduleLiveNotification(for event: UFCEvent) {
        let content = UNMutableNotificationContent()
        content.title = "🔴 UFC Event LIVE"
        content.body = "\(event.name) - The event is now live!"
        content.sound = .default
        
        let eventDate = parseEventDate(event.date)
        let trigger = UNCalendarNotificationTrigger(dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: eventDate ?? Date()), repeats: false)
        let request = UNNotificationRequest(identifier: "ufc-live-\(event.id)", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Erro ao agendar notificação live: \(error)")
            } else {
                print("✅ Notificação live agendada para: \(event.name)")
            }
        }
    }
    
    // Cancelar todas as notificações
    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        print("🗑️ Todas as notificações canceladas")
    }
    
    // Listar notificações agendadas
    func listScheduledNotifications() {
        UNUserNotificationCenter.current().getPendingNotificationRequests { requests in
            print("📋 Notificações agendadas: \(requests.count)")
            for request in requests {
                print("📋 - \(request.identifier): \(request.content.title)")
            }
        }
    }
    
    // Parse de data
    private func parseEventDate(_ dateString: String) -> Date? {
        let formatter = DateFormatter()
        formatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
        
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
            if let date = formatter.date(from: dateString) {
                return date
            }
        }
        return nil
    }
} 