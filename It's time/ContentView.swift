//
//  ContentView.swift
//  It's time
//
//  Created by Rafael Granemann on 23/04/25.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var eventService = UFCEventService()
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    gradient: Gradient(colors: [Color.black, Color(red: 0.2, green: 0, blue: 0)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                VStack {
                    // Header
                    VStack(spacing: 8) {
                        HStack {
                            Image(systemName: "fist.raised.fill")
                                .foregroundColor(.red)
                                .font(.title2)
                            
                            Text("UFC Events")
                                .font(.largeTitle)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            
                            Spacer()
                        }
                        .padding(.horizontal)
                        
                        Text("Próximos Eventos")
                            .font(.headline)
                            .foregroundColor(.gray)
                    }
                    .padding(.top)
                    
                    // Content
                    if eventService.isLoading {
                        Spacer()
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .red))
                            .scaleEffect(1.5)
                        Spacer()
                    } else if let errorMessage = eventService.errorMessage {
                        Spacer()
                        VStack(spacing: 16) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                                .font(.largeTitle)
                            
                            Text("Aviso")
                                .font(.headline)
                                .foregroundColor(.white)
                            
                            Text(errorMessage)
                                .font(.body)
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        Spacer()
                    } else if eventService.events.isEmpty {
                        Spacer()
                        VStack(spacing: 16) {
                            Image(systemName: "calendar.badge.plus")
                                .foregroundColor(.gray)
                                .font(.largeTitle)
                            
                            Text("Nenhum evento encontrado")
                                .font(.headline)
                                .foregroundColor(.white)
                            
                            Text("Adicione eventos através do painel administrativo")
                                .font(.body)
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        Spacer()
                    } else {
                        ScrollView {
                            LazyVStack(spacing: 16) {
                                ForEach(eventService.events) { event in
                                    NavigationLink(destination: EventDetailView(event: event)) {
                                        EventCard(event: event)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
        }
        .onAppear {
            Task {
                await eventService.fetchUpcomingEvents()
            }
        }
        .refreshable {
            Task {
                await eventService.fetchUpcomingEvents()
            }
        }
    }
}

struct EventCard: View {
    let event: UFCEvent
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Event header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(event.name)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(event.formattedDate)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                // Status badge
                StatusBadge(status: event.status)
            }
            
            // Location info
            if let location = event.location {
                HStack {
                    Image(systemName: "location.fill")
                        .foregroundColor(.red)
                        .font(.caption)
                    
                    Text(location)
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Spacer()
                }
            }
            
            // Main event
            if let mainEvent = event.mainEvent {
                HStack {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                        .font(.caption)
                    
                    Text("Evento Principal: \(mainEvent)")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Spacer()
                }
            }
            
            // Fights count
            if !event.fights.isEmpty {
                HStack {
                    Image(systemName: "fist.raised.fill")
                        .foregroundColor(.red)
                        .font(.caption)
                    
                    Text("\(event.fights.count) luta\(event.fights.count == 1 ? "" : "s")")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Spacer()
                }
            }
            
            // Countdown
            let timeRemaining = event.timeRemaining
            if timeRemaining.days > 0 || timeRemaining.hours > 0 || timeRemaining.minutes > 0 {
                HStack {
                    Image(systemName: "clock.fill")
                        .foregroundColor(.blue)
                        .font(.caption)
                    
                    Text("Faltam \(timeRemaining.days)d \(timeRemaining.hours)h \(timeRemaining.minutes)m")
                        .font(.caption)
                        .foregroundColor(.blue)
                    
                    Spacer()
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(red: 0.1, green: 0.1, blue: 0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.red.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

struct StatusBadge: View {
    let status: String
    
    var body: some View {
        Text(statusText)
            .font(.caption)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(statusColor)
            )
            .foregroundColor(.white)
    }
    
    private var statusText: String {
        switch status {
        case "scheduled": return "Agendado"
        case "live": return "Ao Vivo"
        case "finished": return "Finalizado"
        default: return status.capitalized
        }
    }
    
    private var statusColor: Color {
        switch status {
        case "scheduled": return .gray
        case "live": return .red
        case "finished": return .green
        default: return .gray
        }
    }
}

#Preview {
    ContentView()
}
