//
//  Widget_Its_TimeLiveActivity.swift
//  Widget.Its.Time
//
//  Created by Rafael Granemann on 24/07/25.
//

import ActivityKit
import WidgetKit
import SwiftUI
import SVGKit

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
        // NOVOS CAMPOS: SVGs das bandeiras
        var mainEventFighter1FlagSvg: String?
        var mainEventFighter2FlagSvg: String?
        var liveFightFighter1FlagSvg: String?
        var liveFightFighter2FlagSvg: String?
        // Campos para animação do retângulo
        var roundStartTime: String?
        var totalRounds: Int?
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
                .padding(.bottom, 6)
                
                // Main content box
                VStack(spacing: -4) {
                    // Main event info in gray box
                    VStack(spacing: 8) {
                        // Verificar se há luta ao vivo
                        let hasLiveFight = !context.state.liveFightFighter1LastName.isEmpty && !context.state.liveFightFighter2LastName.isEmpty
                        
                        if hasLiveFight {
                            // ===== SEÇÃO 2: LUTA AO VIVO (quando há luta ao vivo) =====
                            VStack(spacing: 6) {
                                // Título "LIVE"
                                HStack {
                                    Text("LIVE")
                                        .font(.widgetRajdhani(size: 12, weight: .bold))
                                        .foregroundColor(.gray)
                                    Spacer()
                                }
                                
                                // Luta ao vivo
                                HStack(spacing: 10) {
                                    // Fighter 1
                                    HStack(spacing: 8) {
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
                                        
                                        // Usar apenas SVG
                                        if let flagSvg = context.state.liveFightFighter1FlagSvg, !flagSvg.isEmpty {
                                            FlagSvgView(svgString: flagSvg, size: 16, countryName: context.state.liveFightFighter1Country)
                                        }
                                    }
                                    
                                    Text("vs")
                                        .font(.widgetRajdhani(size: 20, weight: .regular))
                                        .foregroundColor(.gray)
                                    
                                    // Fighter 2
                                    HStack(spacing: 8) {
                                        // Usar apenas SVG
                                        if let flagSvg = context.state.liveFightFighter2FlagSvg, !flagSvg.isEmpty {
                                            FlagSvgView(svgString: flagSvg, size: 16, countryName: context.state.liveFightFighter2Country)
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
                                
                                // Barra de progresso da luta ao vivo
                                GeometryReader { geometry in
                                    ZStack(alignment: .leading) {
                                        // Background
                                        Rectangle()
                                            .fill(Color(red: 0.133, green: 0.133, blue: 0.133))
                                            .frame(height: 5)
                                            .frame(maxWidth: .infinity)
                                            .cornerRadius(10)
                                        
                                        // Progress (17:20 = 1040 segundos)
                                        Rectangle()
                                            .fill(
                                                // Lógica do haschampion: amarelo se tem campeão, vermelho se não tem
                                                context.state.mainEventFighter1Ranking == "C" || context.state.mainEventFighter2Ranking == "C" || 
                                                context.state.liveFightFighter1Ranking == "C" || context.state.liveFightFighter2Ranking == "C" ?
                                                Color(red: 0.984, green: 1.0, blue: 0.020) : // Amarelo se tem campeão
                                                Color(red: 1.0, green: 0.020, blue: 0.314)   // Vermelho se não tem campeão
                                            )
                                            .frame(width: geometry.size.width * calculateProgress(context: context), height: 5)
                                            .onAppear {
                                                print("🔍 Debug: Barra de progresso renderizada - width: \(geometry.size.width * calculateProgress(context: context))")
                                            }
                                            .cornerRadius(10)
                                    }
                                }
                                .frame(height: 4)
                                .padding(.top, 8)
                                
                                // Retângulos baseados no número de rounds
                                let totalRounds = context.state.totalRounds ?? 3
                                let _ = print("🔍 Debug: totalRounds = \(totalRounds), liveFightFighter1LastName = '\(context.state.liveFightFighter1LastName)', liveFightFighter2LastName = '\(context.state.liveFightFighter2LastName)', eventStatus = '\(context.state.eventStatus)'")
                                
                                HStack {
                                    Spacer()
                                    Rectangle()
                                        .fill(Color(red: 0.067, green: 0.067, blue: 0.067))
                                        .frame(width: 8, height: 8)
                                        .cornerRadius(2)
                                    Spacer()
                                    Rectangle()
                                        .fill(Color(red: 0.067, green: 0.067, blue: 0.067))
                                        .frame(width: 8, height: 8)
                                        .cornerRadius(2)
                                    Spacer()
                                    
                                    // Retângulos adicionais para 5 rounds
                                    if totalRounds == 5 {
                                        Rectangle()
                                            .fill(Color(red: 0.067, green: 0.067, blue: 0.067))
                                            .frame(width: 8, height: 8)
                                            .cornerRadius(2)
                                        Spacer()
                                        Rectangle()
                                            .fill(Color(red: 0.067, green: 0.067, blue: 0.067))
                                            .frame(width: 8, height: 8)
                                            .cornerRadius(2)
                                        Spacer()
                                    }
                                    

                                }
                                .padding(.top, -12)
                            }
                            .lineLimit(1)
                            .onAppear {
                                print("🔍 Debug: Live Activity UI - Live Fight section (ACTIVE)")
                                print("🔍 Debug: - liveFightFighter1LastName: '\(context.state.liveFightFighter1LastName)'")
                                print("🔍 Debug: - liveFightFighter2LastName: '\(context.state.liveFightFighter2LastName)'")
                                print("🔍 Debug: - liveFightFighter1Ranking: '\(context.state.liveFightFighter1Ranking ?? "nil")'")
                                print("🔍 Debug: - liveFightFighter2Ranking: '\(context.state.liveFightFighter2Ranking ?? "nil")'")
                                print("🔍 Debug: - liveFightFighter1FlagSvg: '\(context.state.liveFightFighter1FlagSvg?.prefix(50) ?? "nil")...'")
                                print("🔍 Debug: - liveFightFighter2FlagSvg: '\(context.state.liveFightFighter2FlagSvg?.prefix(50) ?? "nil")...'")
                            }
                            

                        } else {
                            // ===== SEÇÃO 1: LUTA PRINCIPAL (quando não há luta ao vivo) =====
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
                                print("🔍 Debug: Live Activity UI - Main Event section (ACTIVE)")
                                print("🔍 Debug: - mainEventFighter1LastName: '\(context.state.mainEventFighter1LastName)'")
                                print("🔍 Debug: - mainEventFighter2LastName: '\(context.state.mainEventFighter2LastName)'")
                                print("🔍 Debug: - liveFightFighter1Country: '\(context.state.liveFightFighter1Country ?? "nil")'")
                                print("🔍 Debug: - liveFightFighter2Country: '\(context.state.liveFightFighter2Country ?? "nil")'")
                            }
                            

                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity) // Ocupar todo o espaço disponível
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .frame(height: 90) // Tamanho fixo para o box
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
                    .padding(.bottom, 8)
                }
            }
            .background(Color.black)
            .activityBackgroundTint(Color.black)
            .activitySystemActionForegroundColor(Color.white)
            .padding(.top, 2)
            .padding(.bottom, 8)
            .onAppear {
                let hasLiveFight = !context.state.liveFightFighter1LastName.isEmpty && !context.state.liveFightFighter2LastName.isEmpty
                print("🔍 Debug: hasLiveFight = \(hasLiveFight)")
                print("🔍 Debug: liveFightFighter1LastName = '\(context.state.liveFightFighter1LastName)'")
                print("🔍 Debug: liveFightFighter2LastName = '\(context.state.liveFightFighter2LastName)'")
                print("🔍 Debug: eventStatus = '\(context.state.eventStatus)'")
            }
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

// MARK: - Progress Calculation
    func calculateProgress(context: ActivityViewContext<UFCEventLiveActivityAttributes>) -> CGFloat {
        print("🔍 Debug: calculateProgress - FUNÇÃO CHAMADA")
        // Determinar duração baseada no número de rounds
        let totalRounds = context.state.totalRounds ?? 3 // Padrão é 3 rounds
        let totalDuration: TimeInterval = totalRounds == 5 ? 1820 : 1040 // 30:20 para 5 rounds, 17:20 para 3 rounds
        print("🔍 Debug: calculateProgress - totalRounds = \(totalRounds), totalDuration = \(totalDuration) segundos (\(totalDuration/60) minutos)")
        
        // Verificar se o evento está ao vivo
        let isEventLive = context.state.eventStatus == "live"
        let hasLiveFight = !context.state.liveFightFighter1LastName.isEmpty && !context.state.liveFightFighter2LastName.isEmpty
        
        print("🔍 Debug: calculateProgress - isEventLive = \(isEventLive), hasLiveFight = \(hasLiveFight), eventStatus = '\(context.state.eventStatus)', liveFightFighter1LastName = '\(context.state.liveFightFighter1LastName)', liveFightFighter2LastName = '\(context.state.liveFightFighter2LastName)'")
        
        // Se não está ao vivo, retornar 1% (barra vazia)
        if !isEventLive || !hasLiveFight {
            print("🔍 Debug: calculateProgress - Evento não está ao vivo, retornando 1%")
            return 0.01
        }
        
        // Se está ao vivo, calcular progresso baseado no roundStartTime
        let currentTime = Date()
        
        // Verificar se temos o roundStartTime
        guard let roundStartTimeString = context.state.roundStartTime,
              !roundStartTimeString.isEmpty else {
            print("🔍 Debug: calculateProgress - roundStartTime não disponível, usando tempo absoluto")
            // Fallback: usar tempo absoluto se roundStartTime não estiver disponível
            let calendar = Calendar.current
            let totalSeconds = calendar.component(.second, from: currentTime) + 
                              calendar.component(.minute, from: currentTime) * 60 +
                              calendar.component(.hour, from: currentTime) * 3600
            
            let progress = CGFloat(totalSeconds % Int(totalDuration)) / CGFloat(totalDuration)
            let finalProgress = min(max(progress, 0.01), 1.0)
            print("🔍 Debug: calculateProgress - Fallback, progresso: \(finalProgress * 100)%")
            return finalProgress
        }
        
        // Converter roundStartTime para Date
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        dateFormatter.timeZone = TimeZone.current
        
        guard let roundStartTime = dateFormatter.date(from: roundStartTimeString) else {
            print("🔍 Debug: calculateProgress - Erro ao converter roundStartTime: \(roundStartTimeString)")
            return 0.01
        }
        
        // Calcular tempo decorrido desde o início da luta
        let timeElapsed = currentTime.timeIntervalSince(roundStartTime)
        print("🔍 Debug: calculateProgress - roundStartTime: \(roundStartTimeString)")
        print("🔍 Debug: calculateProgress - currentTime: \(dateFormatter.string(from: currentTime))")
        print("🔍 Debug: calculateProgress - timeElapsed: \(timeElapsed) segundos")
        
        // Se o tempo decorrido é negativo (luta ainda não começou), retornar 1%
        if timeElapsed < 0 {
            print("🔍 Debug: calculateProgress - Luta ainda não começou, retornando 1%")
            return 0.01
        }
        
        // Calcular progresso baseado no tempo decorrido
        let progress = CGFloat(timeElapsed) / CGFloat(totalDuration)
        
        // Garantir que sempre comece em 1% (0.01) e pare em 100% (1.0)
        let finalProgress = min(max(progress, 0.01), 1.0)
        
        print("🔍 Debug: calculateProgress - Evento ao vivo, progresso: \(finalProgress * 100)%")
        return finalProgress
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
            liveFightWeightClass: nil,
            mainEventFighter1FlagSvg: nil,
            mainEventFighter2FlagSvg: nil,
            liveFightFighter1FlagSvg: nil,
            liveFightFighter2FlagSvg: nil,
            roundStartTime: nil,
            totalRounds: 5
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
            liveFightWeightClass: "Flyweight",
            mainEventFighter1FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#009b3a\" d=\"M0 0h640v480H0z\"/><path fill=\"#fedf00\" d=\"M320 240L240 120l80-60 80 60z\"/><circle fill=\"#002776\" cx=\"320\" cy=\"240\" r=\"40\"/><path fill=\"#fff\" d=\"M320 220c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 32c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z\"/></svg>",
            mainEventFighter2FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#bd3d44\" d=\"M0 0h640v480H0\"/><path stroke=\"#fff\" stroke-width=\"37\" d=\"M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640\"/><rect fill=\"#192f5d\" width=\"247\" height=\"259\"/><g fill=\"#fff\"><g id=\"d\"><g id=\"c\"><g id=\"e\"><g id=\"b\"><path id=\"a\" d=\"M24.8 25l3.2 9.8h10.3l-8.4 6.1 3.2 9.8-8.3-6-8.3 6 3.2-9.8-8.4-6.1h10.3z\"/><use href=\"#a\" y=\"19.5\"/><use href=\"#a\" y=\"39\"/></g><use href=\"#b\" y=\"78\"/></g><use href=\"#c\" y=\"156\"/></g><use href=\"#d\" y=\"312\"/></g></svg>",
            liveFightFighter1FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><circle fill=\"#bc002d\" cx=\"320\" cy=\"240\" r=\"120\"/></svg>",
            liveFightFighter2FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><path fill=\"#cd2e3a\" d=\"M0 0h640v480H0z\"/><path fill=\"#0047a0\" d=\"M0 0h640v240H0z\"/><path fill=\"#fff\" d=\"M0 0h640v160H0z\"/><path fill=\"#cd2e3a\" d=\"M0 0h640v80H0z\"/></svg>",
            roundStartTime: nil,
            totalRounds: 5
        )
    }
}

#Preview("Notification", as: .content, using: UFCEventLiveActivityAttributes.preview) {
   UFCEventLiveActivity()
} contentStates: {
    UFCEventLiveActivityAttributes.ContentState.starting
    UFCEventLiveActivityAttributes.ContentState.live
}


