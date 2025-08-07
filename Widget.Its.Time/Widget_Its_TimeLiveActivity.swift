//
//  Widget_Its_TimeLiveActivity.swift
//  Widget.Its.Time
//
//  Created by Rafael Granemann on 24/07/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

// Função auxiliar para obter emoji da bandeira do país
func getCountryFlagEmoji(for country: String?) -> String {
    guard let country = country else { return "" }
    
    // Mapeamento de países para emojis de bandeira
    let countryToFlag: [String: String] = [
        "United States": "🇺🇸",
        "Brazil": "🇧🇷",
        "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        "Ireland": "🇮🇪",
        "Canada": "🇨🇦",
        "Australia": "🇦🇺",
        "New Zealand": "🇳🇿",
        "South Africa": "🇿🇦",
        "Nigeria": "🇳🇬",
        "Ghana": "🇬🇭",
        "Cameroon": "🇨🇲",
        "Morocco": "🇲🇦",
        "Tunisia": "🇹🇳",
        "Algeria": "🇩🇿",
        "Egypt": "🇪🇬",
        "Kenya": "🇰🇪",
        "Uganda": "🇺🇬",
        "Tanzania": "🇹🇿",
        "Ethiopia": "🇪🇹",
        "Somalia": "🇸🇴",
        "Sudan": "🇸🇩",
        "South Sudan": "🇸🇸",
        "Eritrea": "🇪🇷",
        "Djibouti": "🇩🇯",
        "Comoros": "🇰🇲",
        "United Arab Emirates": "🇦🇪",
        "Madagascar": "🇲🇬",
        "Mauritius": "🇲🇺",
        "Seychelles": "🇸🇨",
        "Reunion": "🇷🇪",
        "Mayotte": "🇾🇹",
        "France": "🇫🇷",
        "Germany": "🇩🇪",
        "Italy": "🇮🇹",
        "Spain": "🇪🇸",
        "Portugal": "🇵🇹",
        "Netherlands": "🇳🇱",
        "Belgium": "🇧🇪",
        "Switzerland": "🇨🇭",
        "Austria": "🇦🇹",
        "Sweden": "🇸🇪",
        "Norway": "🇳🇴",
        "Denmark": "🇩🇰",
        "Finland": "🇫🇮",
        "Iceland": "🇮🇸",
        "Poland": "🇵🇱",
        "Czech Republic": "🇨🇿",
        "Slovakia": "🇸🇰",
        "Hungary": "🇭🇺",
        "Romania": "🇷🇴",
        "Bulgaria": "🇧🇬",
        "Greece": "🇬🇷",
        "Turkey": "🇹🇷",
        "Cyprus": "🇨🇾",
        "Malta": "🇲🇹",
        "Croatia": "🇭🇷",
        "Slovenia": "🇸🇮",
        "Bosnia and Herzegovina": "🇧🇦",
        "Serbia": "🇷🇸",
        "Montenegro": "🇲🇪",
        "North Macedonia": "🇲🇰",
        "Albania": "🇦🇱",
        "Kosovo": "🇽🇰",
        "Moldova": "🇲🇩",
        "Ukraine": "🇺🇦",
        "Belarus": "🇧🇾",
        "Lithuania": "🇱🇹",
        "Latvia": "🇱🇻",
        "Estonia": "🇪🇪",
        "Russia": "🇷🇺",
        "Kazakhstan": "🇰🇿",
        "Uzbekistan": "🇺🇿",
        "Kyrgyzstan": "🇰🇬",
        "Tajikistan": "🇹🇯",
        "Turkmenistan": "🇹🇲",
        "Azerbaijan": "🇦🇿",
        "Georgia": "🇬🇪",
        "Armenia": "🇦🇲",
        "Iran": "🇮🇷",
        "Iraq": "🇮🇶",
        "Syria": "🇸🇾",
        "Lebanon": "🇱🇧",
        "Jordan": "🇯🇴",
        "Israel": "🇮🇱",
        "Palestine": "🇵🇸",
        "Saudi Arabia": "🇸🇦",
        "Yemen": "🇾🇪",
        "Oman": "🇴🇲",
        "United Arab Emirates": "🇦🇪",
        "Qatar": "🇶🇦",
        "Bahrain": "🇧🇭",
        "Kuwait": "🇰🇼",
        "Afghanistan": "🇦🇫",
        "Pakistan": "🇵🇰",
        "India": "🇮🇳",
        "Nepal": "🇳🇵",
        "Bhutan": "🇧🇹",
        "Bangladesh": "🇧🇩",
        "Sri Lanka": "🇱🇰",
        "Maldives": "🇲🇻",
        "China": "🇨🇳",
        "Japan": "🇯🇵",
        "South Korea": "🇰🇷",
        "North Korea": "🇰🇵",
        "Mongolia": "🇲🇳",
        "Taiwan": "🇹🇼",
        "Hong Kong": "🇭🇰",
        "Macau": "🇲🇴",
        "Vietnam": "🇻🇳",
        "Laos": "🇱🇦",
        "Cambodia": "🇰🇭",
        "Thailand": "🇹🇭",
        "Myanmar": "🇲🇲",
        "Malaysia": "🇲🇾",
        "Singapore": "🇸🇬",
        "Indonesia": "🇮🇩",
        "Philippines": "🇵🇭",
        "Brunei": "🇧🇳",
        "East Timor": "🇹🇱",
        "Papua New Guinea": "🇵🇬",
        "Fiji": "🇫🇯",
        "Vanuatu": "🇻🇺",
        "New Caledonia": "🇳🇨",
        "Solomon Islands": "🇸🇧",
        "Samoa": "🇼🇸",
        "American Samoa": "🇦🇸",
        "Tonga": "🇹🇴",
        "Tuvalu": "🇹🇻",
        "Kiribati": "🇰🇮",
        "Nauru": "🇳🇷",
        "Palau": "🇵🇼",
        "Micronesia": "🇫🇲",
        "Marshall Islands": "🇲🇭",
        "Mexico": "🇲🇽",
        "Guatemala": "🇬🇹",
        "Belize": "🇧🇿",
        "El Salvador": "🇸🇻",
        "Honduras": "🇭🇳",
        "Nicaragua": "🇳🇮",
        "Costa Rica": "🇨🇷",
        "Panama": "🇵🇦",
        "Colombia": "🇨🇴",
        "Venezuela": "🇻🇪",
        "Guyana": "🇬🇾",
        "Suriname": "🇸🇷",
        "French Guiana": "🇬🇫",
        "Ecuador": "🇪🇨",
        "Peru": "🇵🇪",
        "Bolivia": "🇧🇴",
        "Paraguay": "🇵🇾",
        "Uruguay": "🇺🇾",
        "Argentina": "🇦🇷",
        "Chile": "🇨🇱"
    ]
    
    return countryToFlag[country] ?? ""
}

// MARK: - Font Extension for Widget
extension Font {
    static func widgetRajdhani(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        let fontName: String
        switch weight {
        case .bold:
            fontName = "Rajdhani-Bold"
        case .medium:
            fontName = "Rajdhani-Medium"
        default:
            fontName = "Rajdhani-Regular"
        }
        
        print("🔤 Widget: Aplicando fonte \(fontName) com tamanho \(size)")
        return .custom(fontName, size: size)
    }
}

// MARK: - Live Activity Attributes (Duplicated for Widget Target)
struct UFCEventLiveActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var timeRemaining: String
        var eventStatus: String
        var currentFight: String?
        var finishedFights: Int
        var totalFights: Int
        var fighter1LastName: String
        var fighter2LastName: String
        var nextFighter1LastName: String
        var nextFighter2LastName: String
        // Novos campos para ranking e bandeiras
        var fighter1Ranking: String?
        var fighter2Ranking: String?
        var fighter1Country: String?
        var fighter2Country: String?
        var fighter1Record: String?
        var fighter2Record: String?
        var currentFightWeightClass: String?
        // Campos separados para luta principal (sempre fightOrder 1)
        var mainEventFighter1LastName: String
        var mainEventFighter2LastName: String
        var mainEventFighter1Ranking: String?
        var mainEventFighter2Ranking: String?
        var mainEventFighter1Country: String?
        var mainEventFighter2Country: String?
        var mainEventWeightClass: String?
        // Campos específicos para luta ao vivo
        var liveFightFighter1LastName: String
        var liveFightFighter2LastName: String
        var liveFightFighter1Ranking: String?
        var liveFightFighter2Ranking: String?
        var liveFightFighter1Country: String?
        var liveFightFighter2Country: String?
        var liveFightWeightClass: String?
    }
    
    var eventName: String
    var eventDate: String
    var mainEvent: String
    var venue: String?
    var eventId: Int
}

struct UFCEventLiveActivity: Widget {
    let kind: String = "UFCEventLiveActivity"
    
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: UFCEventLiveActivityAttributes.self) { context in
            // Lock screen/banner UI
            VStack(spacing: 0) {
                // Top bar
                HStack {
                    // Event name and fight counter (right)
                    HStack(spacing: 4) {
                        Text(context.attributes.eventName)
                            .font(.widgetRajdhani(size: 16, weight: .bold))
                            .foregroundColor(Color(red: 1.0, green: 0.020, blue: 0.314)) // #FF0550
                        Text("-")
                            .font(.widgetRajdhani(size: 16, weight: .regular))
                            .foregroundColor(.gray)
                        Text("\(context.state.finishedFights)/\(context.state.totalFights)")
                            .font(.widgetRajdhani(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    } 

                    Spacer()

                    // FYTE (right)
                    Text("FYTE")
                        .font(.widgetRajdhani(size: 15, weight: .regular))
                        .foregroundColor(.white)
                        .tracking(5.6) // ou .kerning(5.6)
               
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)
                .padding(.bottom, 8)
                
                // Main content box
                VStack(spacing: 0) {
                    // Main event info in gray box
                    VStack(spacing: 8) {
                        // ===== SEÇÃO 1: LUTA PRINCIPAL (sempre visível) =====
                        VStack(spacing: 6) {
                            HStack(spacing: 4) {
                                Text(context.state.mainEventFighter1LastName)
                                    .font(.widgetRajdhani(size: 24, weight: .bold))
                                    .foregroundColor(.white)
                                
                                Text("vs")
                                    .font(.widgetRajdhani(size: 24, weight: .bold))
                                    .foregroundColor(.white)
                                
                                Text(context.state.mainEventFighter2LastName)
                                    .font(.widgetRajdhani(size: 24, weight: .bold))
                                    .foregroundColor(.white)
                                
                                Text("is live!")
                                    .font(.widgetRajdhani(size: 24, weight: .bold))
                                    .foregroundColor(.white)
                            }
                        }
                        .lineLimit(1)
                        .onAppear {
                            print("🔍 Debug: Live Activity UI - Main Event section")
                            print("🔍 Debug: - mainEventFighter1LastName: '\(context.state.mainEventFighter1LastName)'")
                            print("🔍 Debug: - mainEventFighter2LastName: '\(context.state.mainEventFighter2LastName)'")
                            print("🔍 Debug: - liveFightFighter1Country: '\(context.state.liveFightFighter1Country ?? "nil")'")
                            print("🔍 Debug: - liveFightFighter2Country: '\(context.state.liveFightFighter2Country ?? "nil")'")
                        }
                        
                        // ===== SEÇÃO 2: LUTA AO VIVO (sempre visível) =====
                        VStack(spacing: 6) {
                            // Título "LIVE"
                            HStack {
                                Text("LIVE")
                                    .font(.widgetRajdhani(size: 12, weight: .bold))
                                    .foregroundColor(.gray)
                                Spacer()
                            }
                            
                            // Luta ao vivo
                            HStack(spacing: 8) {
                                // Fighter 1
                                HStack(spacing: 4) {
                                    if let ranking = context.state.liveFightFighter1Ranking {
                                        Text(ranking)
                                            .font(.widgetRajdhani(size: 14, weight: .bold))
                                            .foregroundColor(ranking == "C" ? .black : .white)
                                            .padding(.horizontal, 4)
                                            .padding(.vertical, 1)
                                            .background(
                                                RoundedRectangle(cornerRadius: 3)
                                                    .fill(ranking == "C" ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color.gray.opacity(0.6))
                                            )
                                    }
                                    
                                    Text(context.state.liveFightFighter1LastName)
                                        .font(.widgetRajdhani(size: 24, weight: .bold))
                                        .foregroundColor(.white)
                                    
                                    if let country = context.state.liveFightFighter1Country {
                                        FlagSvgView(countryCode: country, size: 16)
                                    } else {
                                        Text("❌")
                                            .font(.system(size: 16))
                                    }
                                }
                                
                                Text("vs")
                                    .font(.widgetRajdhani(size: 20, weight: .regular))
                                    .foregroundColor(.gray)
                                
                                // Fighter 2
                                HStack(spacing: 4) {
                                if let country = context.state.liveFightFighter2Country {
                                    FlagSvgView(countryCode: country, size: 16)
                                } else {
                                    Text("❌")
                                        .font(.system(size: 16))
                                }
                                    
                                    Text(context.state.liveFightFighter2LastName)
                                        .font(.widgetRajdhani(size: 24, weight: .bold))
                                        .foregroundColor(.white)
                                    
                                    if let ranking = context.state.liveFightFighter2Ranking {
                                        Text(ranking)
                                            .font(.widgetRajdhani(size: 14, weight: .bold))
                                            .foregroundColor(ranking == "C" ? .black : .white)
                                            .padding(.horizontal, 4)
                                            .padding(.vertical, 1)
                                            .background(
                                                RoundedRectangle(cornerRadius: 3)
                                                    .fill(ranking == "C" ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color.gray.opacity(0.6))
                                            )
                                    }
                                }
                            }
                        }
                        .lineLimit(1)
                        .onAppear {
                            print("🔍 Debug: Live Activity UI - Live Fight section")
                            print("🔍 Debug: - liveFightFighter1LastName: '\(context.state.liveFightFighter1LastName)'")
                            print("🔍 Debug: - liveFightFighter2LastName: '\(context.state.liveFightFighter2LastName)'")
                            print("🔍 Debug: - liveFightFighter1Ranking: '\(context.state.liveFightFighter1Ranking ?? "nil")'")
                            print("🔍 Debug: - liveFightFighter2Ranking: '\(context.state.liveFightFighter2Ranking ?? "nil")'")
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color(red: 0.067, green: 0.067, blue: 0.067)) // #111
                    .cornerRadius(12)
                    .padding(.horizontal, 16)
                    .onAppear {
                        print("🔍 Debug: Widget Status Check:")
                        print("🔍 Debug: - eventStatus: '\(context.state.eventStatus)'")
                        print("🔍 Debug: - fighter1LastName: '\(context.state.fighter1LastName)'")
                        print("🔍 Debug: - fighter2LastName: '\(context.state.fighter2LastName)'")
                        print("🔍 Debug: - nextFighter1LastName: '\(context.state.nextFighter1LastName)'")
                        print("🔍 Debug: - nextFighter2LastName: '\(context.state.nextFighter2LastName)'")
                        print("🔍 Debug: - fighter1Ranking: '\(context.state.fighter1Ranking ?? "nil")'")
                        print("🔍 Debug: - fighter2Ranking: '\(context.state.fighter2Ranking ?? "nil")'")
                    }
                    
                    // Next fight info
                    HStack {
                        if context.state.eventStatus == "live" {
                            // Se está ao vivo, mostrar a próxima luta
                            Text("\(context.state.nextFighter1LastName) vs \(context.state.nextFighter2LastName)")
                                .font(.widgetRajdhani(size: 14, weight: .regular))
                                .foregroundColor(.white)
                        } else {
                            // Se não está ao vivo, mostrar a próxima luta
                            Text("\(context.state.nextFighter1LastName) vs \(context.state.nextFighter2LastName)")
                                .font(.widgetRajdhani(size: 14, weight: .regular))
                                .foregroundColor(.white)
                        }
                        
                        Image(systemName: "arrow.right")
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)
                    .padding(.bottom, 16)
                }
            }
            .background(Color.black)
            .activityBackgroundTint(Color.black)
            .activitySystemActionForegroundColor(Color.white)
            .padding(.top, 30)


        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("FYTE")
                            .font(.widgetRajdhani(size: 12, weight: .regular))
                            .foregroundColor(.white) 
                    }
                }
                
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("\(context.state.finishedFights)/\(context.state.totalFights)")
                            .font(.widgetRajdhani(size: 14, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("LIVE")
                            .font(.widgetRajdhani(size: 10, weight: .bold))
                            .foregroundColor(Color(red: 1.0, green: 0.020, blue: 0.314)) // #FF0550
                    }
                }
                
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        if context.state.eventStatus == "live" {
                            // Se o evento está ao vivo, mostrar a luta atual
                            Text("\(context.state.fighter1LastName) vs \(context.state.fighter2LastName)")
                                .font(.widgetRajdhani(size: 12, weight: .regular))
                                .foregroundColor(.gray)
                                .lineLimit(1)
                        } else {
                            // Se o evento ainda não começou, mostrar a luta de destaque
                            Text("\(context.state.fighter1LastName) vs \(context.state.fighter2LastName)")
                                .font(.widgetRajdhani(size: 12, weight: .bold))
                                .foregroundColor(Color(red: 1.0, green: 0.020, blue: 0.314)) // #FF0550
                                .lineLimit(1)
                        }
                        
                        Spacer()
                        
                        Text("•")
                            .font(.widgetRajdhani(size: 12, weight: .bold))
                            .foregroundColor(Color(red: 1.0, green: 0.020, blue: 0.314)) // #FF0550
                    }
                }
            } compactLeading: {
                Text("FYTE")
                    .font(.widgetRajdhani(size: 10, weight: .regular))
                    .foregroundColor(.white)
            } compactTrailing: {
                Text("\(context.state.finishedFights)/\(context.state.totalFights)")
                    .font(.widgetRajdhani(size: 12, weight: .bold))
                    .foregroundColor(.white)
            } minimal: {
                Circle()
                    .fill(Color(red: 1.0, green: 0.020, blue: 0.314)) // #FF0550
                    .frame(width: 8, height: 8)
            }
            .widgetURL(URL(string: "ufcapp://event/\(context.attributes.eventId)"))
            .keylineTint(Color(red: 1.0, green: 0.020, blue: 0.314)) // #FF0550
        }
    }
}

extension UFCEventLiveActivityAttributes {
    fileprivate static var preview: UFCEventLiveActivityAttributes {
        UFCEventLiveActivityAttributes(
            eventName: "UFC 300: Pereira vs Hill",
            eventDate: "2024-04-13 22:00:00",
            mainEvent: "Alex Pereira vs Jamahal Hill",
            venue: "T-Mobile Arena, Las Vegas",
            eventId: 300
        )
    }
}

extension UFCEventLiveActivityAttributes.ContentState {
    fileprivate static var starting: UFCEventLiveActivityAttributes.ContentState {
        UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: "00:15:30",
            eventStatus: "starting",
            currentFight: nil,
            finishedFights: 0,
            totalFights: 10,
            fighter1LastName: "Taira",
            fighter2LastName: "Park",
            nextFighter1LastName: "Brener",
            nextFighter2LastName: "Ribovics",
            fighter1Ranking: nil,
            fighter2Ranking: nil,
            fighter1Country: nil,
            fighter2Country: nil,
            fighter1Record: nil,
            fighter2Record: nil,
            currentFightWeightClass: nil,
            mainEventFighter1LastName: "Pereira",
            mainEventFighter2LastName: "Hill",
            mainEventFighter1Ranking: "C",
            mainEventFighter2Ranking: "#1",
            mainEventFighter1Country: "Brazil",
            mainEventFighter2Country: "United States",
            mainEventWeightClass: "Light Heavyweight",
            liveFightFighter1LastName: "",
            liveFightFighter2LastName: "",
            liveFightFighter1Ranking: nil,
            liveFightFighter2Ranking: nil,
            liveFightFighter1Country: nil,
            liveFightFighter2Country: nil,
            liveFightWeightClass: nil
        )
    }
    
    fileprivate static var live: UFCEventLiveActivityAttributes.ContentState {
        UFCEventLiveActivityAttributes.ContentState(
            timeRemaining: "LIVE",
            eventStatus: "live",
            currentFight: "Pereira vs Hill - Round 2",
            finishedFights: 3,
            totalFights: 10,
            fighter1LastName: "Taira",
            fighter2LastName: "Park",
            nextFighter1LastName: "Brener",
            nextFighter2LastName: "Ribovics",
            fighter1Ranking: "#12",
            fighter2Ranking: "#15",
            fighter1Country: "Japan",
            fighter2Country: "South Korea",
            fighter1Record: "15-0-0",
            fighter2Record: "17-5-0",
            currentFightWeightClass: "Flyweight",
            mainEventFighter1LastName: "Pereira",
            mainEventFighter2LastName: "Hill",
            mainEventFighter1Ranking: "C",
            mainEventFighter2Ranking: "#1",
            mainEventFighter1Country: "Brazil",
            mainEventFighter2Country: "United States",
            mainEventWeightClass: "Light Heavyweight",
            liveFightFighter1LastName: "Taira",
            liveFightFighter2LastName: "Park",
            liveFightFighter1Ranking: "#12",
            liveFightFighter2Ranking: "#15",
            liveFightFighter1Country: "Japan",
            liveFightFighter2Country: "South Korea",
            liveFightWeightClass: "Flyweight"
        )
    }
}

#Preview("Notification", as: .content, using: UFCEventLiveActivityAttributes.preview) {
   UFCEventLiveActivity()
} contentStates: {
    UFCEventLiveActivityAttributes.ContentState.starting
    UFCEventLiveActivityAttributes.ContentState.live
}


