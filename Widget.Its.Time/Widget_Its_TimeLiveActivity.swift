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

// MARK: - Fighter Data Service
class FighterDataService {
    static let shared = FighterDataService()
    
    private let baseURL = "https://igxztpjrojdmyzzhqxsv.supabase.co/rest/v1"
    private let apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwMTkyNSwiZXhwIjoyMDY4ODc3OTI1fQ.vKFJ5j2SlMonBypOQzZXywKl7UaA19LeroBnqj1Qnw0"
    
    struct Fighter: Codable {
        let id: Int
        let name: String
        let nickname: String?
        let wins: Int?
        let losses: Int?
        let draws: Int?
        let ranking: String?
        let country: String?
    }
    
    struct Fight: Codable {
        let id: Int
        let eventid: Int
        let fighter1id: Int
        let fighter2id: Int
        let weightclass: String?
        let fighttype: String?
        let rounds: Int?
        let timeremaining: String?
        let status: String?
        let is_finished: Bool?
        let winner_id: Int?
        let fightorder: Int?
    }
    
    /// Busca os dados completos dos lutadores da luta ao vivo
    func fetchLiveFightFighters() async -> (fighter1: Fighter?, fighter2: Fighter?) {
        print("🔍 Live Activity: Buscando lutadores da luta ao vivo...")
        
        do {
            // 1. Buscar TODAS as lutas do evento para análise completa
            let allFightsURL = "\(baseURL)/fights?select=*&order=fightorder.asc"
            print("🔍 Live Activity: URL de busca: \(allFightsURL)")
            
            guard let url = URL(string: allFightsURL) else {
                print("❌ Live Activity: URL inválida para lutas")
                return (nil, nil)
            }
            
            var request = URLRequest(url: url)
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
            request.setValue(apiKey, forHTTPHeaderField: "apikey")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let (fightsData, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                print("❌ Live Activity: Erro ao buscar lutas")
                return (nil, nil)
            }
            
            let allFights = try JSONDecoder().decode([Fight].self, from: fightsData)
            
            print("🔍 Live Activity: Total de lutas encontradas: \(allFights.count)")
            for (index, fight) in allFights.enumerated() {
                print("   Luta \(index + 1): ID=\(fight.id), Status='\(fight.status ?? "nil")', Fighter1=\(fight.fighter1id), Fighter2=\(fight.fighter2id), isFinished=\(fight.is_finished ?? false), Order=\(fight.fightorder ?? 0)")
            }
            
            // 2. Priorizar lutas com status ao vivo
            let liveStatusFights = allFights.filter { fight in
                let status = fight.status ?? ""
                return status == "live" || status == "in_progress" || status == "active" || status == "started"
            }
            
            if let liveFight = liveStatusFights.first {
                print("✅ Live Activity: Luta ao vivo encontrada - ID: \(liveFight.id), Status: '\(liveFight.status ?? "nil")'")
                return await fetchFightersForFight(liveFight)
            }
            
            // 3. Se não há lutas ao vivo, buscar a próxima luta não finalizada
            let unfinishedFights = allFights.filter { fight in
                let isFinished = fight.is_finished ?? false
                let status = fight.status ?? ""
                return !isFinished && status != "finished"
            }
            
            if let nextFight = unfinishedFights.first {
                print("✅ Live Activity: Próxima luta não finalizada encontrada - ID: \(nextFight.id), Status: '\(nextFight.status ?? "nil")', Order: \(nextFight.fightorder ?? 0)")
                return await fetchFightersForFight(nextFight)
            }
            
            print("⚠️ Live Activity: Nenhuma luta adequada encontrada")
            return (nil, nil)
            
        } catch {
            print("❌ Live Activity: Erro ao buscar lutadores da luta ao vivo: \(error)")
            return (nil, nil)
        }
    }
    
    /// Busca dados dos lutadores para uma luta específica
    private func fetchFightersForFight(_ fight: Fight) async -> (fighter1: Fighter?, fighter2: Fighter?) {
        print("🔍 Live Activity: Buscando lutadores para luta ID: \(fight.id)")
        
        // Buscar dados dos lutadores em paralelo para melhor performance
        async let fighter1Task = fetchFighter(id: fight.fighter1id)
        async let fighter2Task = fetchFighter(id: fight.fighter2id)
        
        let fighter1 = await fighter1Task
        let fighter2 = await fighter2Task
        
        if let fighter1 = fighter1, let fighter2 = fighter2 {
            print("✅ Live Activity: Ambos os lutadores encontrados:")
            print("   🥊 Lutador 1: '\(fighter1.name)' (ID: \(fighter1.id))")
            print("   🥊 Lutador 2: '\(fighter2.name)' (ID: \(fighter2.id))")
        } else {
            print("⚠️ Live Activity: Problema ao buscar lutadores:")
            print("   Lutador 1: \(fighter1?.name ?? "NÃO ENCONTRADO")")
            print("   Lutador 2: \(fighter2?.name ?? "NÃO ENCONTRADO")")
        }
        
        return (fighter1, fighter2)
    }
    
    /// Busca dados de um lutador específico
    private func fetchFighter(id: Int) async -> Fighter? {
        let fighterURL = "\(baseURL)/fighters?select=*&id=eq.\(id)&limit=1"
        
        guard let url = URL(string: fighterURL) else {
            print("❌ Live Activity: URL inválida para lutador \(id)")
            return nil
        }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                print("❌ Live Activity: Erro ao buscar lutador \(id)")
                return nil
            }
            
            let fighters = try JSONDecoder().decode([Fighter].self, from: data)
            
            if let fighter = fighters.first {
                print("✅ Live Activity: Lutador \(id) encontrado - Nome: '\(fighter.name)'")
                return fighter
            } else {
                print("⚠️ Live Activity: Lutador \(id) não encontrado")
                return nil
            }
            
        } catch {
            print("❌ Live Activity: Erro ao buscar lutador \(id): \(error)")
            return nil
        }
    }
    
    /// Atualiza a Live Activity com os nomes completos dos lutadores
    func updateLiveActivityWithFighterNames() async {
        print("🔄 Live Activity: Atualizando com nomes completos dos lutadores...")
        
        let (fighter1, fighter2) = await fetchLiveFightFighters()
        
        guard let fighter1 = fighter1, let fighter2 = fighter2 else {
            print("⚠️ Live Activity: Não foi possível obter dados dos lutadores")
            return
        }
        
        print("✅ Live Activity: Lutadores obtidos - \(fighter1.name) vs \(fighter2.name)")
        
        // Atualizar a Live Activity ativa
        if let activity = Activity<UFCEventLiveActivityAttributes>.activities.first {
            let updatedState = UFCEventLiveActivityAttributes.ContentState(
                timeRemaining: "LIVE",
                eventStatus: "live",
                currentFight: "\(fighter1.name) vs \(fighter2.name)",
                finishedFights: 0,
                totalFights: 10,
                fighter1LastName: fighter1.name,
                fighter2LastName: fighter2.name,
                nextFighter1LastName: "",
                nextFighter2LastName: "",
                fighter1Ranking: fighter1.ranking,
                fighter2Ranking: fighter2.ranking,
                fighter1Country: fighter1.country,
                fighter2Country: fighter2.country,
                fighter1Record: "\(fighter1.wins ?? 0)-\(fighter1.losses ?? 0)-\(fighter1.draws ?? 0)",
                fighter2Record: "\(fighter2.wins ?? 0)-\(fighter2.losses ?? 0)-\(fighter2.draws ?? 0)",
                currentFightWeightClass: nil,
                mainEventFighter1LastName: fighter1.name,
                mainEventFighter2LastName: fighter2.name,
                mainEventFighter1Ranking: fighter1.ranking,
                mainEventFighter2Ranking: fighter2.ranking,
                mainEventFighter1Country: fighter1.country,
                mainEventFighter2Country: fighter2.country,
                mainEventWeightClass: nil,
                liveFightFighter1LastName: fighter1.name,
                liveFightFighter2LastName: fighter2.name,
                liveFightFighter1Ranking: fighter1.ranking,
                liveFightFighter2Ranking: fighter2.ranking,
                liveFightFighter1Country: fighter1.country,
                liveFightFighter2Country: fighter2.country,
                liveFightWeightClass: nil,
                mainEventFighter1FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#009b3a\" d=\"M0 0h640v480H0z\"/><path fill=\"#fedf00\" d=\"M320 240L240 120l80-60 80 60z\"/><circle fill=\"#002776\" cx=\"320\" cy=\"240\" r=\"40\"/><path fill=\"#fff\" d=\"M320 220c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 32c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z\"/></svg>",
                mainEventFighter2FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#bd3d44\" d=\"M0 0h640v480H0\"/><path stroke=\"#fff\" stroke-width=\"37\" d=\"M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640\"/><rect fill=\"#192f5d\" width=\"247\" height=\"259\"/><g fill=\"#fff\"><g id=\"d\"><g id=\"c\"><g id=\"e\"><g id=\"b\"><path id=\"a\" d=\"M24.8 25l3.2 9.8h10.3l-8.4 6.1 3.2 9.8-8.3-6-8.3 6 3.2-9.8-8.4-6.1h10.3z\"/><use href=\"#a\" y=\"19.5\"/><use href=\"#a\" y=\"39\"/></g><use href=\"#b\" y=\"78\"/></g><use href=\"#c\" y=\"156\"/></g><use href=\"#d\" y=\"312\"/></g></svg>",
                liveFightFighter1FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><circle fill=\"#bc002d\" cx=\"320\" cy=\"240\" r=\"120\"/></svg>",
                liveFightFighter2FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><path fill=\"#cd2e3a\" d=\"M0 0h640v480H0z\"/><path fill=\"#0047a0\" d=\"M0 0h640v240H0z\"/><path fill=\"#fff\" d=\"M0 0h640v160H0z\"/><path fill=\"#cd2e3a\" d=\"M0 0h640v80H0z\"/></svg>",
                roundStartTime: "2024-04-13 22:15:00",
                totalRounds: 5
            )
            
            await activity.update(using: updatedState)
            print("✅ Live Activity: Atualizada com nomes completos dos lutadores")
        } else {
            print("⚠️ Live Activity: Nenhuma Live Activity ativa encontrada")
        }
    }
    
    /// Função de teste para verificar os dados retornados pela API
    func testAPIData() async {
        print("🧪 Live Activity: Testando dados da API...")
        
        let (fighter1, fighter2) = await fetchLiveFightFighters()
        
        if let fighter1 = fighter1 {
            print("✅ Lutador 1 encontrado:")
            print("   ID: \(fighter1.id)")
            print("   Nome: '\(fighter1.name)'")
            print("   Apelido: '\(fighter1.nickname ?? "N/A")'")
            print("   Record: \(fighter1.wins ?? 0)-\(fighter1.losses ?? 0)-\(fighter1.draws ?? 0)")
            print("   Ranking: '\(fighter1.ranking ?? "N/A")'")
            print("   País: '\(fighter1.country ?? "N/A")'")
        } else {
            print("❌ Lutador 1 não encontrado")
        }
        
        if let fighter2 = fighter2 {
            print("✅ Lutador 2 encontrado:")
            print("   ID: \(fighter2.id)")
            print("   Nome: '\(fighter2.name)'")
            print("   Apelido: '\(fighter2.nickname ?? "N/A")'")
            print("   Record: \(fighter2.wins ?? 0)-\(fighter2.losses ?? 0)-\(fighter2.draws ?? 0)")
            print("   Ranking: '\(fighter2.ranking ?? "N/A")'")
            print("   País: '\(fighter2.country ?? "N/A")'")
        } else {
            print("❌ Lutador 2 não encontrado")
        }
    }
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
        // NOVOS CAMPOS: SVGs das bandeiras
        var mainEventFighter1FlagSvg: String?
        var mainEventFighter2FlagSvg: String?
        var liveFightFighter1FlagSvg: String?
        var liveFightFighter2FlagSvg: String?
        // Campos para imagens pré-renderizadas das bandeiras (otimização)
        var liveFightFighter1FlagImage: Data?
        var liveFightFighter2FlagImage: Data?
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
                            .foregroundColor(
                                // Lógica do haschampion: amarelo se tem campeão, vermelho se não tem
                                context.state.mainEventFighter1Ranking == "C" || context.state.mainEventFighter2Ranking == "C" || 
                                context.state.liveFightFighter1Ranking == "C" || context.state.liveFightFighter2Ranking == "C" ?
                                Color(red: 0.984, green: 1.0, blue: 0.020) : // Amarelo se tem campeão
                                Color(red: 1.0, green: 0.020, blue: 0.314)   // Vermelho se não tem campeão
                            )
                        Text("-")
                            .font(.widgetRajdhani(size: 16, weight: .regular))
                            .foregroundColor(.gray)
                        Text("\(context.state.finishedFights)/\(context.state.totalFights)")
                            .font(.widgetRajdhani(size: 16, weight: .regular))
                            .foregroundColor(.white)
                    } 

                    Spacer()

                    // FYTE (right)
                    Text("FYTE")
                        .font(.widgetRajdhani(size: 13, weight: .regular))
                        .foregroundColor(.gray)
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
                        let hasLiveFight = !context.state.liveFightFighter1LastName.isEmpty && 
                                          !context.state.liveFightFighter2LastName.isEmpty && 
                                          context.state.eventStatus == "live"
                        
                        print("🔍 Debug: hasLiveFight = \(hasLiveFight)")
                        print("🔍 Debug: liveFightFighter1LastName = '\(context.state.liveFightFighter1LastName)'")
                        print("🔍 Debug: liveFightFighter2LastName = '\(context.state.liveFightFighter2LastName)'")
                        print("🔍 Debug: eventStatus = '\(context.state.eventStatus)'")
                        
                        // ✅ DEBUG: Logs detalhados para rastrear o problema na interface
                        let _ = print("🔍 Debug: Interface - liveFightFighter1LastName: '\(context.state.liveFightFighter1LastName)'")
                        let _ = print("🔍 Debug: Interface - liveFightFighter2LastName: '\(context.state.liveFightFighter2LastName)'")
                        let _ = print("🔍 Debug: Interface - HasLiveFight: \(hasLiveFight)")
                        let _ = print("🔍 Debug: Interface - EventStatus: '\(context.state.eventStatus)'")
                        
                        if hasLiveFight {
                            // ===== SEÇÃO 2: LUTA AO VIVO (quando há luta ao vivo) =====
                            VStack(spacing: 4) {
                                // Título "LIVE NOW" com bolinha piscante (centralizado)
                                HStack {
                                    Spacer()
                                    HStack(spacing: 6) {
                                        // Bolinha piscante vermelha
                                        Circle()
                                            .fill(Color(red: 1.0, green: 0.020, blue: 0.314)) // #FF0550
                                            .frame(width: 4, height: 4)
                                            .opacity(1.0)
                                        Text("LIVE NOW")
                                            .font(.widgetRajdhani(size: 12, weight: .regular))
                                            .foregroundColor(Color(red: 1.0, green: 0.020, blue: 0.314)) // #FF0550
                                    }
                                    .padding(.top, -10)
                                    Spacer()
                                }
                                
                                // Luta ao vivo
                                HStack(spacing: 10) {
                                    // Fighter 1
                                    HStack(spacing: 8) {
                                        if let ranking = context.state.liveFightFighter1Ranking {
                                            Text(ranking)
                                                .font(.widgetRajdhani(size: 13, weight: .bold))
                                                .foregroundColor(ranking == "C" ? .black : .white)
                                                .padding(.horizontal, 4)
                                                .padding(.vertical, 0)
                                                .background(
                                                    RoundedRectangle(cornerRadius: 3)
                                                        .fill(ranking == "C" ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color.gray.opacity(0.6))
                                                )
                                        }
                                        
                                        Text(context.state.liveFightFighter1LastName)
                                            .font(.widgetRajdhani(size: 19, weight: .bold))
                                            .foregroundColor(.white)
                                        
                                        // Usar apenas SVG
                                        if let flagSvg = context.state.liveFightFighter1FlagSvg, !flagSvg.isEmpty {
                                            FlagSvgView(svgString: flagSvg, size: 16, countryName: context.state.liveFightFighter1Country)
                                        }
                                    }
                                    
                                    Text("vs")
                                        .font(.widgetRajdhani(size: 17, weight: .regular))
                                        .foregroundColor(.gray)
                                    
                                    // Fighter 2
                                    HStack(spacing: 8) {
                                        // Usar apenas SVG
                                        if let flagSvg = context.state.liveFightFighter2FlagSvg, !flagSvg.isEmpty {
                                            FlagSvgView(svgString: flagSvg, size: 16, countryName: context.state.liveFightFighter2Country)
                                        }
                                        
                                        Text(context.state.liveFightFighter2LastName)
                                            .font(.widgetRajdhani(size: 19, weight: .bold))
                                            .foregroundColor(.white)
                                        
                                        if let ranking = context.state.liveFightFighter2Ranking {
                                            Text(ranking)
                                                .font(.widgetRajdhani(size: 13, weight: .bold))
                                                .foregroundColor(ranking == "C" ? .black : .white)
                                                .padding(.horizontal, 4)
                                                .padding(.vertical, 0)
                                                .background(
                                                    RoundedRectangle(cornerRadius: 3)
                                                        .fill(ranking == "C" ? Color(red: 0.984, green: 1.0, blue: 0.020) : Color.gray.opacity(0.6))
                                                )
                                        }
                                    }
                                }
                                
                                // Barra de progresso da luta ao vivo (restaurada com timer)
                                ProgressBarRestored(context: context)
                                    .frame(height: 5)
                                    .padding(.top, 8)
                                
                                // Retângulos baseados no número de rounds
                                let totalRounds = context.state.totalRounds ?? 3
                                let _ = print("🔍 Debug: totalRounds = \(totalRounds), liveFightFighter1LastName = '\(context.state.liveFightFighter1LastName)', liveFightFighter2LastName = '\(context.state.liveFightFighter2LastName)', eventStatus = '\(context.state.eventStatus)'")
                                
                                HStack {
                                    Spacer()
                                    Rectangle()
                                        .fill(Color(red: 0.067, green: 0.067, blue: 0.067))
                                        .frame(width: 10, height: 10)
                                        .cornerRadius(2)
                                    Spacer()
                                    Rectangle()
                                        .fill(Color(red: 0.067, green: 0.067, blue: 0.067))
                                        .frame(width: 10, height: 10)
                                        .cornerRadius(2)
                                    Spacer()
                                    
                                    // Retângulos adicionais para 5 rounds
                                    if totalRounds == 5 {
                                        Rectangle()
                                            .fill(Color(red: 0.067, green: 0.067, blue: 0.067))
                                            .frame(width: 10, height: 10)
                                            .cornerRadius(2)
                                        Spacer()
                                        Rectangle()
                                            .fill(Color(red: 0.067, green: 0.067, blue: 0.067))
                                            .frame(width: 10, height: 10)
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
                
                // PRÉ-CARREGAR BANDEIRAS para evitar placeholder cinza
                FlagSvgView.preloadFlags()
                
                // Debug: Verificar estado atual da Live Activity
                debugLiveActivityState()
                
                // Forçar atualização imediata dos nomes dos lutadores
                Task {
                    print("🚀 Live Activity: Forçando atualização imediata...")
                    
                    // Debug da criação da Live Activity
                    debugLiveActivityCreation()
                    
                    // Verificar estado atual antes de qualquer atualização
                    debugLiveActivityState()
                    
                    // Forçar atualização imediata dos nomes dos lutadores
                    await forceUpdateLiveActivityForLiveFight()
                    
                    // Verificar estado após a atualização
                    debugLiveActivityState()
                    
                    // Depois iniciar as atualizações automáticas
                    await startLiveFightMonitoring()
                    
                    // Verificar estado final
                    debugLiveActivityState()
                }
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

// MARK: - Função calculateProgressWidth (Implementação Original que Funcionava)
func calculateProgressWidth(context: ActivityViewContext<UFCEventLiveActivityAttributes>) -> CGFloat {
    // Determinar duração baseada no número de rounds
    let totalRounds = context.state.totalRounds ?? 3 // Padrão é 3 rounds
    let totalDuration: TimeInterval = totalRounds == 5 ? 1820 : 1040 // 30:20 para 5 rounds, 17:20 para 3 rounds
    
    // Verificar se o evento está ao vivo
    let isEventLive = context.state.eventStatus == "live"
    let hasLiveFight = !context.state.liveFightFighter1LastName.isEmpty && 
                       !context.state.liveFightFighter2LastName.isEmpty && 
                       context.state.eventStatus == "live"
    
    print("🔍 Debug: calculateProgressWidth - isEventLive: \(isEventLive), hasLiveFight: \(hasLiveFight)")
    print("🔍 Debug: calculateProgressWidth - liveFightFighter1LastName: '\(context.state.liveFightFighter1LastName)'")
    print("🔍 Debug: calculateProgressWidth - liveFightFighter2LastName: '\(context.state.liveFightFighter2LastName)'")
    print("🔍 Debug: calculateProgressWidth - eventStatus: '\(context.state.eventStatus)'")
    
    // Se não está ao vivo, retornar 1% (barra vazia)
    if !hasLiveFight {
        return 0.01
    }
    
    // Se está ao vivo, calcular progresso baseado no tempo atual para movimento contínuo
    let currentTime = Date()
    
    // Verificar se temos o roundStartTime para calcular o progresso real
    if let roundStartTimeString = context.state.roundStartTime,
       !roundStartTimeString.isEmpty {
        // Converter roundStartTime para Date
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        dateFormatter.timeZone = TimeZone.current
        
        if let roundStartTime = dateFormatter.date(from: roundStartTimeString) {
            let elapsed = currentTime.timeIntervalSince(roundStartTime)
            let progress = CGFloat(elapsed / totalDuration)
            return max(0.01, min(progress, 1.0))
        }
    }
    
    // Se não há roundStartTime válido, usar um progresso contínuo baseado no tempo atual
    let totalSeconds = Int(currentTime.timeIntervalSince1970)
    let progress = CGFloat(totalSeconds % Int(totalDuration)) / CGFloat(totalDuration)
    return max(0.01, min(progress, 1.0))
}

// MARK: - Função para forçar atualização da Live Activity quando há mudanças na luta ao vivo
func forceUpdateLiveActivityForLiveFight() async {
    print("🚨 Live Activity: Forçando atualização para nova luta ao vivo...")
    
    // Debug: Verificar estado atual antes da atualização
    debugLiveActivityState()
    
    // Buscar dados mais recentes da luta ao vivo
    let (fighter1, fighter2) = await FighterDataService.shared.fetchLiveFightFighters()
    
    guard let fighter1 = fighter1, let fighter2 = fighter2 else {
        print("⚠️ Live Activity: Não foi possível obter dados dos lutadores da nova luta ao vivo")
        return
    }
    
    print("✅ Live Activity: Nova luta ao vivo detectada - \(fighter1.name) vs \(fighter2.name)")
    
    // Atualizar a Live Activity ativa
    if let activity = Activity<UFCEventLiveActivityAttributes>.activities.first {
    let currentState = activity.content.state
        
    print("🔍 Debug: Estado atual antes da atualização:")
        print("   - eventStatus: '\(currentState.eventStatus)'")
    print("   - liveFightFighter1LastName: '\(currentState.liveFightFighter1LastName)'")
    print("   - liveFightFighter2LastName: '\(currentState.liveFightFighter2LastName)'")
    
    let updatedState = UFCEventLiveActivityAttributes.ContentState(
        timeRemaining: "LIVE",
            eventStatus: "live", // IMPORTANTE: Sempre "live" quando há luta ao vivo
            currentFight: "\(fighter1.name) vs \(fighter2.name)",
        finishedFights: currentState.finishedFights,
        totalFights: currentState.totalFights,
        fighter1LastName: currentState.fighter1LastName,
        fighter2LastName: currentState.fighter2LastName,
        nextFighter1LastName: currentState.nextFighter1LastName,
        nextFighter2LastName: currentState.nextFighter2LastName,
        fighter1Ranking: currentState.fighter1Ranking,
        fighter2Ranking: currentState.fighter2Ranking,
        fighter1Country: currentState.fighter1Country,
        fighter2Country: currentState.fighter2Country,
        fighter1Record: currentState.fighter1Record,
        fighter2Record: currentState.fighter2Record,
        currentFightWeightClass: currentState.currentFightWeightClass,
        mainEventFighter1LastName: currentState.mainEventFighter1LastName,
        mainEventFighter2LastName: currentState.mainEventFighter2LastName,
        mainEventFighter1Ranking: currentState.mainEventFighter1Ranking,
        mainEventFighter2Ranking: currentState.mainEventFighter2Ranking,
        mainEventFighter1Country: currentState.mainEventFighter1Country,
        mainEventFighter2Country: currentState.mainEventFighter2Country,
        mainEventWeightClass: currentState.mainEventWeightClass,
            // ATUALIZAR APENAS OS CAMPOS DA LUTA AO VIVO COM NOMES COMPLETOS
            liveFightFighter1LastName: fighter1.name, // Nome completo do lutador 1
            liveFightFighter2LastName: fighter2.name, // Nome completo do lutador 2
            liveFightFighter1Ranking: fighter1.ranking,
            liveFightFighter2Ranking: fighter2.ranking,
            liveFightFighter1Country: fighter1.country,
            liveFightFighter2Country: fighter2.country,
            liveFightWeightClass: nil,
        mainEventFighter1FlagSvg: currentState.mainEventFighter1FlagSvg,
        mainEventFighter2FlagSvg: currentState.mainEventFighter2FlagSvg,
        liveFightFighter1FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><circle fill=\"#bc002d\" cx=\"320\" cy=\"240\" r=\"120\"/></svg>",
        liveFightFighter2FlagSvg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><path fill=\"#cd2e3a\" d=\"M0 0h640v480H0z\"/><path fill=\"#0047a0\" d=\"M0 0h640v240H0z\"/><path fill=\"#fff\" d=\"M0 0h640v160H0z\"/><path fill=\"#cd2e3a\" d=\"M0 0h640v80H0z\"/></svg>",
            roundStartTime: "2024-04-13 22:15:00",
            totalRounds: 5
    )
    
    print("🔍 Debug: Estado que será aplicado:")
        print("   - eventStatus: '\(updatedState.eventStatus)'")
    print("   - liveFightFighter1LastName: '\(updatedState.liveFightFighter1LastName)'")
    print("   - liveFightFighter2LastName: '\(updatedState.liveFightFighter2LastName)'")
    print("   - currentFight: '\(updatedState.currentFight ?? "N/A")'")
    
    await activity.update(using: updatedState)
        print("✅ Live Activity: Atualizada com nova luta ao vivo!")
        print("🎯 Nova luta: \(fighter1.name) vs \(fighter2.name)")
    
        // Debug: Verificar estado após a atualização
        print("🔍 Debug: Estado após a atualização:")
    let newState = activity.content.state
        print("   - eventStatus: '\(newState.eventStatus)'")
    print("   - liveFightFighter1LastName: '\(newState.liveFightFighter1LastName)'")
    print("   - liveFightFighter2LastName: '\(newState.liveFightFighter2LastName)'")
    print("   - currentFight: '\(newState.currentFight ?? "N/A")'")
    
    } else {
        print("⚠️ Live Activity: Nenhuma Live Activity ativa encontrada")
    }
}

// MARK: - Função de debug para verificar o estado atual da Live Activity
func debugLiveActivityState() {
    print("🔍 Debug: Verificando estado atual da Live Activity...")
    
    let activities = Activity<UFCEventLiveActivityAttributes>.activities
    print("🔍 Debug: Total de Live Activities: \(activities.count)")
    
    for (index, activity) in activities.enumerated() {
        let state = activity.content.state
        print("🔍 Debug: Live Activity \(index + 1):")
        print("   - Evento: \(activity.attributes.eventName)")
        print("   - ID: \(activity.attributes.eventId)")
        print("   - eventStatus: '\(state.eventStatus)'")
        print("   - timeRemaining: '\(state.timeRemaining)'")
        print("   - liveFightFighter1LastName: '\(state.liveFightFighter1LastName)'")
        print("   - liveFightFighter2LastName: '\(state.liveFightFighter2LastName)'")
        print("   - mainEventFighter1LastName: '\(state.mainEventFighter1LastName)'")
        print("   - mainEventFighter2LastName: '\(state.mainEventFighter2LastName)'")
        print("   - currentFight: '\(state.currentFight ?? "N/A")'")
        print("   - hasLiveFight: \(!state.liveFightFighter1LastName.isEmpty && !state.liveFightFighter2LastName.isEmpty && state.eventStatus == "live")")
    }
}

// MARK: - Timer para verificar mudanças na luta ao vivo
func startLiveFightMonitoring() async {
    print("🔍 Live Activity: Iniciando monitoramento da luta ao vivo...")
    
    // Verificar a cada 5 segundos se há mudanças na luta ao vivo
    let checkInterval: TimeInterval = 5
    
    while true {
        do {
            try await Task.sleep(nanoseconds: UInt64(checkInterval * 1_000_000_000))
            
            // Verificar se ainda há uma Live Activity ativa
            guard !Activity<UFCEventLiveActivityAttributes>.activities.isEmpty else {
                print("⚠️ Live Activity: Nenhuma atividade ativa, parando monitoramento")
                break
            }
            
            // Verificar se há mudanças na luta ao vivo
            await checkAndUpdateLiveFight()
            
        } catch {
            print("❌ Live Activity: Erro no monitoramento da luta ao vivo: \(error)")
            break
        }
    }
}

// MARK: - Função para verificar e atualizar a luta ao vivo
func checkAndUpdateLiveFight() async {
    print("🔍 Live Activity: Verificando mudanças na luta ao vivo...")
    
    // Buscar dados mais recentes da luta ao vivo
    let (fighter1, fighter2) = await FighterDataService.shared.fetchLiveFightFighters()
    
    guard let fighter1 = fighter1, let fighter2 = fighter2 else {
        print("⚠️ Live Activity: Nenhuma luta ao vivo encontrada")
        return
    }
    
    // Verificar se a Live Activity atual tem os mesmos lutadores
    if let activity = Activity<UFCEventLiveActivityAttributes>.activities.first {
        let currentState = activity.content.state
        let currentLiveFighters = "\(currentState.liveFightFighter1LastName) vs \(currentState.liveFightFighter2LastName)"
        let newLiveFighters = "\(fighter1.name) vs \(fighter2.name)"
        
        print("🔍 Live Activity: Comparando lutadores:")
        print("   - Atual: '\(currentLiveFighters)'")
        print("   - Novo: '\(newLiveFighters)'")
        
        // Se os lutadores mudaram, forçar atualização
        if currentLiveFighters != newLiveFighters {
            print("🚨 Live Activity: Mudança detectada na luta ao vivo! Forçando atualização...")
            await forceUpdateLiveActivityForLiveFight()
        } else {
            print("ℹ️ Live Activity: Nenhuma mudança na luta ao vivo")
        }
    }
}



