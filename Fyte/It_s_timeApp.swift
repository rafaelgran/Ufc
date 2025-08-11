//
//  It_s_timeApp.swift
//  It's time
//
//  Created by Rafael Granemann on 23/04/25.
//

import SwiftUI

@main
struct It_s_timeApp: App {
    
    // Registrar o AppDelegate para notificações remotas
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    init() {
        // Register custom fonts
        CustomFonts.registerFonts()
    }
    
    var body: some Scene {
        WindowGroup {
            SplashScreenView()
        }
    }
}
