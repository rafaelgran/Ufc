import UIKit
import UserNotifications
import ActivityKit

class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Configurar notificações
        UNUserNotificationCenter.current().delegate = self
        
        // Solicitar permissão
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    application.registerForRemoteNotifications()
                }
            }
        }
        
        return true
    }
    
    // MARK: - Remote Notifications
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        print("🚀 didRegisterForRemoteNotificationsWithDeviceToken CALLED!")
        
        // Converter o token para string hexadecimal
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        
        print("📱 APNs Device Token: \(token)")
        
        // Enviar APNs Device Token direto para o servidor
        self.sendAPNsTokenToServer(token)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for remote notifications: \(error.localizedDescription)")
    }
    
    // MARK: - APNs Token Server
    
    private func sendAPNsTokenToServer(_ apnsToken: String) {
        print("🚀 sendAPNsTokenToServer called with APNs token: \(apnsToken)")
        
        // URL da Edge Function register-device
        guard let url = URL(string: "https://igxztpjrojdmyzzhqxsv.supabase.co/functions/v1/register-device") else {
            print("❌ Invalid Supabase URL")
            return
        }
        
        print("📤 Sending APNs token to URL: \(url)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwMTkyNSwiZXhwIjoyMDY4ODc3OTI1fQ.vKFJ5j2SlMonBypOQzZXywKl7UaA19LeroBnqj1Qnw0", forHTTPHeaderField: "Authorization")
        
        let body: [String: Any] = [
            "device_token": apnsToken,
            "platform": "iOS",
            "token_type": "apns"
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
                    print("❌ Error sending APNs token to Supabase: \(error)")
                } else if let httpResponse = response as? HTTPURLResponse {
                    print("📊 HTTP Status: \(httpResponse.statusCode)")
                    
                    if let data = data, let responseString = String(data: data, encoding: .utf8) {
                        print("📄 Response data: \(responseString)")
                    }
                    
                    if httpResponse.statusCode == 200 {
                        print("✅ APNs token registered successfully with Supabase")
                        print("🎯 Token registered: \(apnsToken)")
                    } else {
                        print("❌ Supabase error: \(httpResponse.statusCode)")
                        if let data = data, let errorMessage = String(data: data, encoding: .utf8) {
                            print("❌ Error details: \(errorMessage)")
                        }
                    }
                } else {
                    print("❌ No HTTP response received")
                }
            }
        }.resume()
        
        print("📤 URLSession request started")
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
        
        completionHandler()
    }
    
    // MARK: - Remote Notification Handling
    
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        print("📱 Received remote notification: \(userInfo)")
        
        // Processar notificação para acordar Live Activity
        if let type = userInfo["type"] as? String,
           type == "wake_live_activity" {
            print("🔔 Wake Live Activity notification received in background")
            
            // Processar a notificação de acordar Live Activity
            Task {
                await LiveActivityService.shared.handlePushNotificationForLiveActivity(userInfo)
                completionHandler(.newData)
            }
        } else {
            // Processar outras notificações normalmente
            RemoteNotificationService.shared.handleServerPushNotification(userInfo)
            completionHandler(.newData)
        }
    }
    
    // MARK: - Live Activity Push Token Handling
    
    /// Obtém o push token da Live Activity ativa para enviar ao servidor
    func getLiveActivityPushToken() -> String? {
        // Verificar se há uma Live Activity ativa
        let activities = Activity<UFCEventLiveActivityAttributes>.activities
        
        guard let activeActivity = activities.first else {
            print("❌ No active Live Activity found")
            return nil
        }
        
        // Obter o push token da Live Activity
        let pushToken = activeActivity.pushToken
        print("🔔 Live Activity push token: \(pushToken?.description ?? "nil")")
        
        return pushToken?.description
    }
    
    /// Envia o push token da Live Activity para o servidor
    func sendLiveActivityPushTokenToServer() {
        guard let pushToken = getLiveActivityPushToken() else {
            print("❌ No Live Activity push token available")
            return
        }
        
        print("🚀 Sending Live Activity push token to server: \(pushToken)")
        
        // URL da Edge Function para registrar push token da Live Activity
        guard let url = URL(string: "https://igxztpjrojdmyzzhqxsv.supabase.co/functions/v1/register-live-activity") else {
            print("❌ Invalid Supabase URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwMTkyNSwiZXhwIjoyMDY4ODc3OTI1fQ.vKFJ5j2SlMonBypOQzZXywKl7UaA19LeroBnqj1Qnw0", forHTTPHeaderField: "Authorization")
        
        let body: [String: Any] = [
            "live_activity_push_token": pushToken,
            "platform": "iOS",
            "token_type": "live_activity"
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            print("❌ Error serializing request body: \(error)")
            return
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("❌ Error sending Live Activity push token: \(error)")
                } else if let httpResponse = response as? HTTPURLResponse {
                    print("📊 Live Activity push token registration status: \(httpResponse.statusCode)")
                    
                    if let data = data, let responseString = String(data: data, encoding: .utf8) {
                        print("📄 Response: \(responseString)")
                    }
                    
                    if httpResponse.statusCode == 200 {
                        print("✅ Live Activity push token registered successfully")
                    } else {
                        print("❌ Live Activity push token registration failed")
                    }
                }
            }
        }.resume()
    }
}
