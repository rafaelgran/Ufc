//
//  Widget_Its_TimeLiveActivity.swift
//  Widget.Its.Time
//
//  Created by Rafael Granemann on 24/07/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct Widget_Its_TimeAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct Widget_Its_TimeLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: Widget_Its_TimeAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension Widget_Its_TimeAttributes {
    fileprivate static var preview: Widget_Its_TimeAttributes {
        Widget_Its_TimeAttributes(name: "World")
    }
}

extension Widget_Its_TimeAttributes.ContentState {
    fileprivate static var smiley: Widget_Its_TimeAttributes.ContentState {
        Widget_Its_TimeAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: Widget_Its_TimeAttributes.ContentState {
         Widget_Its_TimeAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: Widget_Its_TimeAttributes.preview) {
   Widget_Its_TimeLiveActivity()
} contentStates: {
    Widget_Its_TimeAttributes.ContentState.smiley
    Widget_Its_TimeAttributes.ContentState.starEyes
}
