import SwiftUI

struct EventDetailView: View {
    let event: UFCEvent
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Event header
                VStack(alignment: .leading, spacing: 12) {
                    Text(event.name)
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    HStack {
                        Image(systemName: "calendar")
                            .foregroundColor(.red)
                        
                        Text(event.formattedDate)
                            .foregroundColor(.gray)
                        
                        Spacer()
                    }
                    
                    if let location = event.location {
                        HStack {
                            Image(systemName: "location.fill")
                                .foregroundColor(.red)
                            
                            Text(location)
                                .foregroundColor(.gray)
                            
                            Spacer()
                        }
                    }
                    
                    if let venue = event.venue {
                        HStack {
                            Image(systemName: "building.2")
                                .foregroundColor(.red)
                            
                            Text(venue)
                                .foregroundColor(.gray)
                            
                            Spacer()
                        }
                    }
                    
                    StatusBadge(status: event.status)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(red: 0.1, green: 0.1, blue: 0.1))
                )
                
                // Main event
                if let mainEvent = event.mainEvent {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "star.fill")
                                .foregroundColor(.yellow)
                            
                            Text("Evento Principal")
                                .font(.headline)
                                .foregroundColor(.white)
                            
                            Spacer()
                        }
                        
                        Text(mainEvent)
                            .font(.title3)
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 0.1, green: 0.1, blue: 0.1))
                    )
                }
                
                // Fights
                if !event.fights.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "fist.raised.fill")
                                .foregroundColor(.red)
                            
                            Text("Card de Lutas")
                                .font(.headline)
                                .foregroundColor(.white)
                            
                            Spacer()
                        }
                        
                        LazyVStack(spacing: 12) {
                            ForEach(event.fights) { fight in
                                FightCard(fight: fight)
                            }
                        }
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 0.1, green: 0.1, blue: 0.1))
                    )
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "fist.raised")
                            .foregroundColor(.gray)
                            .font(.largeTitle)
                        
                        Text("Nenhuma luta cadastrada")
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        Text("As lutas serão adicionadas através do painel administrativo")
                            .font(.body)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 0.1, green: 0.1, blue: 0.1))
                    )
                }
                
                // Countdown
                let timeRemaining = event.timeRemaining
                if timeRemaining.days > 0 || timeRemaining.hours > 0 || timeRemaining.minutes > 0 {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "clock.fill")
                                .foregroundColor(.blue)
                            
                            Text("Contagem Regressiva")
                                .font(.headline)
                                .foregroundColor(.white)
                            
                            Spacer()
                        }
                        
                        HStack {
                            CountdownItem(value: timeRemaining.days, unit: "Dias")
                            CountdownItem(value: timeRemaining.hours, unit: "Horas")
                            CountdownItem(value: timeRemaining.minutes, unit: "Min")
                            
                            Spacer()
                        }
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 0.1, green: 0.1, blue: 0.1))
                    )
                }
            }
            .padding()
        }
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color.black, Color(red: 0.2, green: 0, blue: 0)]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
        .navigationTitle("Detalhes do Evento")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct FightCard: View {
    let fight: UFCFight
    
    var body: some View {
        VStack(spacing: 12) {
            // Weight class and rounds
            HStack {
                Text(fight.weightClass)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.red)
                
                Spacer()
                
                Text("\(fight.rounds) rounds")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            // Fighters
            HStack(spacing: 16) {
                // Fighter 1
                VStack(spacing: 8) {
                    if let photo = fight.fighter1.photo, let url = URL(string: photo) {
                        AsyncImage(url: url) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Image(systemName: "person.fill")
                                .foregroundColor(.gray)
                        }
                        .frame(width: 60, height: 60)
                        .clipShape(Circle())
                    } else {
                        Image(systemName: "person.fill")
                            .foregroundColor(.gray)
                            .font(.system(size: 30))
                            .frame(width: 60, height: 60)
                            .background(Circle().fill(Color.gray.opacity(0.3)))
                    }
                    
                    VStack(spacing: 2) {
                        Text(fight.fighter1.name)
                            .font(.headline)
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                        
                        if let nickname = fight.fighter1.nickname {
                            Text("\"\(nickname)\"")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        if let record = fight.fighter1.record {
                            Text(record)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                }
                
                // VS
                VStack {
                    Text("VS")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.red)
                    
                    if fight.isLive {
                        Text(fight.roundTime)
                            .font(.headline)
                            .foregroundColor(.green)
                    }
                    
                    StatusBadge(status: fight.status)
                }
                
                // Fighter 2
                VStack(spacing: 8) {
                    if let photo = fight.fighter2.photo, let url = URL(string: photo) {
                        AsyncImage(url: url) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Image(systemName: "person.fill")
                                .foregroundColor(.gray)
                        }
                        .frame(width: 60, height: 60)
                        .clipShape(Circle())
                    } else {
                        Image(systemName: "person.fill")
                            .foregroundColor(.gray)
                            .font(.system(size: 30))
                            .frame(width: 60, height: 60)
                            .background(Circle().fill(Color.gray.opacity(0.3)))
                    }
                    
                    VStack(spacing: 2) {
                        Text(fight.fighter2.name)
                            .font(.headline)
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                        
                        if let nickname = fight.fighter2.nickname {
                            Text("\"\(nickname)\"")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        if let record = fight.fighter2.record {
                            Text(record)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                }
            }
            
            // Winner info
            if fight.isFinished, let winner = fight.winner, let method = fight.method {
                HStack {
                    Image(systemName: "trophy.fill")
                        .foregroundColor(.yellow)
                    
                    Text("Vencedor: \(winner == fight.fighter1.id ? fight.fighter1.name : fight.fighter2.name)")
                        .font(.caption)
                        .foregroundColor(.yellow)
                    
                    Text("(\(method))")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Spacer()
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(red: 0.05, green: 0.05, blue: 0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.red.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

struct CountdownItem: View {
    let value: Int
    let unit: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text("\(value)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            Text(unit)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.blue.opacity(0.1))
        )
    }
}

#Preview {
    NavigationView {
        EventDetailView(event: UFCEvent(
            id: "1",
            name: "UFC 316",
            date: "2024-05-15T20:00:00",
            location: "Newark, NJ - United States",
            venue: "Prudential Center",
            status: "scheduled",
            mainEvent: "Merab Dvalishvili vs Sean O'Malley",
            fights: [],
            createdAt: nil
        ))
    }
} 