//
//  It_s_timeApp.swift
//  It's time
//
//  Created by Rafael Granemann on 23/04/25.
//

import SwiftUI

@main
struct Its_timeApp: App {
    var body: some Scene {
        WindowGroup {
            EventListView()
                .preferredColorScheme(.dark)
        }
    }
}
