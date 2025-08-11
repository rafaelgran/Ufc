import UIKit
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        
        // Configurar delegate para notificações
        UNUserNotificationCenter.current().delegate = self
        
        // Verificar permissões de notificação
        RemoteNotificationService.shared.checkNotificationPermissions()
        
        // Registrar para notificações remotas
        application.registerForRemoteNotifications()
        
        return true
    }
    
    // MARK: - Remote Notifications
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Converter o token para string hexadecimal
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        
        print("📱 Device Token: \(token)")
        
        // Registrar dispositivo usando o serviço
        RemoteNotificationService.shared.registerDevice(with: token)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for remote notifications: \(error)")
    }
    
    // MARK: - Notification Handling
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Mostrar notificação mesmo quando o app está em primeiro plano
        completionHandler([.alert, .badge, .sound])
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        // Lidar com toque na notificação
        let userInfo = response.notification.request.content.userInfo
        print("📱 Notification tapped: \(userInfo)")
        
        // Verificar se é uma notificação local ou remota
        if response.notification.request.trigger is UNCalendarNotificationTrigger {
            // Notificação local (agendada)
            print("📱 Processing local notification")
            RemoteNotificationService.shared.handleLocalNotification(userInfo)
        } else {
            // Notificação remota (push do servidor)
            print("📱 Processing server push notification")
            RemoteNotificationService.shared.handleServerPushNotification(userInfo)
        }
        
        completionHandler()
    }
    
    // MARK: - Remote Notification Handling
    
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        print("📱 Received remote notification: \(userInfo)")
        
        // Processar notificação usando o serviço
        RemoteNotificationService.shared.handleRemoteNotification(userInfo)
        
        // Indicar que a notificação foi processada
        completionHandler(.newData)
    }
}
