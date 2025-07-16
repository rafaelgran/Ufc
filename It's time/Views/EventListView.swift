import SwiftUI

struct EventListView: View {
    @StateObject private var viewModel = EventListViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Top bar
                    HStack {
                        Button(action: {}) {
                            Text("GET ULTRA")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.gray)
                        }
                        
                        Spacer()
                        
                        HStack(spacing: 16) {
                            Button(action: {}) {
                                Image(systemName: "bell")
                                    .foregroundColor(.white)
                            }
                            
                            Button(action: {}) {
                                Image(systemName: "person.circle")
                                    .foregroundColor(.white)
                            }
                        }
                    }
                    .padding(.horizontal)
                    
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .padding(.top, 100)
                    } else if let error = viewModel.error {
                        VStack(spacing: 16) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 50))
                                .foregroundColor(.yellow)
                            Text(error)
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                            Button("Try Again") {
                                Task {
                                    await viewModel.fetchEvents()
                                }
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.blue)
                            .cornerRadius(8)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding(.top, 100)
                    } else {
                        if let nextEvent = viewModel.events.first {
                            FeaturedEventCard(event: nextEvent)
                        }
                        
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Upcoming Events")
                                .font(.title2)
                                .fontWeight(.bold)
                                .padding(.horizontal)
                            
                            if viewModel.events.count > 1 {
                                LazyVStack(spacing: 12) {
                                    ForEach(viewModel.events.dropFirst()) { event in
                                        EventRow(event: event)
                                    }
                                }
                            } else {
                                Text("No upcoming events")
                                    .foregroundColor(.gray)
                                    .padding()
                            }
                        }
                    }
                }
                .padding(.top)
            }
            .navigationBarHidden(true)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color(red: 0.1, green: 0.1, blue: 0.1), Color.black]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
        }
        .task {
            await viewModel.fetchEvents()
        }
    }
}

class EventListViewModel: ObservableObject {
    @Published var events: [UFCEvent] = []
    @Published var isLoading = false
    @Published var error: String?
    private let service = UFCEventService(apiKey: Config.apiSportsKey)
    
    @MainActor
    func fetchEvents() async {
        isLoading = true
        error = nil
        print("Starting to fetch events...")
        do {
            print("Making API call...")
            events = try await service.fetchUpcomingEvents()
            print("Fetched \(events.count) events successfully")
        } catch let fetchError {
            print("Error fetching events: \(fetchError)")
            if let urlError = fetchError as? URLError {
                self.error = "Network error: \(urlError.localizedDescription)"
            } else {
                self.error = "Failed to load events. Please try again."
            }
        }
        isLoading = false
    }
}

struct FeaturedEventCard: View {
    let event: UFCEvent
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Event type (PPV or Fight Night)
            Text(event.eventType.rawValue)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(Color(red: 0.8, green: 0.7, blue: 0.3)) // Golden yellow color
            
            // Main event title
            Text(event.mainEvent)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(2)
            
            // Venue and location
            Text("\(event.venue) - \(event.location)")
                .font(.system(size: 14))
                .foregroundColor(.gray)
            
            // Countdown timer
            HStack(spacing: 24) {
                CountdownBox(value: event.timeRemaining.days, label: "Days")
                CountdownBox(value: event.timeRemaining.hours, label: "Hours")
                CountdownBox(value: event.timeRemaining.minutes, label: "Minutes")
            }
            .padding(.top, 8)
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.black.opacity(0.3))
        .cornerRadius(16)
        .padding(.horizontal)
    }
}

struct CountdownBox: View {
    let value: Int
    let label: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text("\(value)")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.gray)
        }
        .frame(minWidth: 60)
        .padding(.vertical, 8)
        .background(Color.black.opacity(0.6))
        .cornerRadius(8)
    }
}

struct EventRow: View {
    let event: UFCEvent
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(event.mainEvent)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    Text(event.eventType.rawValue)
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                }
                Spacer()
                Text(event.formattedDate)
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.black.opacity(0.3))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

#Preview {
    EventListView()
        .preferredColorScheme(.dark)
} 