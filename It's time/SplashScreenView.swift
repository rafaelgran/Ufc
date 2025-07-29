import SwiftUI

struct SplashScreenView: View {
    @State private var isAnimating = false
    @State private var showMainApp = false
    
    var body: some View {
        ZStack {
            // Background
            Color.black
                .ignoresSafeArea()
            
            // Logo Container
            VStack(spacing: 0) {
                // Octagonal Logo
                ZStack {
                    // Outer white border
                    OctagonShape()
                        .stroke(Color.white, lineWidth: 4)
                        .frame(width: 280, height: 280)
                    
                    // Inner yellow border
                    OctagonShape()
                        .stroke(Color(red: 1.0, green: 0.8, blue: 0.0), lineWidth: 3)
                        .frame(width: 270, height: 270)
                    
                    // Black background
                    OctagonShape()
                        .fill(Color.black)
                        .frame(width: 265, height: 265)
                    
                    // Text content
                    VStack(spacing: 8) {
                        // FIGHT with decorative lines
                        HStack(spacing: 12) {
                            Rectangle()
                                .fill(Color.white)
                                .frame(width: 20, height: 2)
                            
                            Text("FIGHT")
                                .font(.rajdhani(size: 24, weight: .bold))
                                .foregroundColor(Color(red: 1.0, green: 0.8, blue: 0.0))
                                .uppercase()
                            
                            Rectangle()
                                .fill(Color.white)
                                .frame(width: 20, height: 2)
                        }
                        
                        // TIME (largest text)
                        Text("TIME")
                            .font(.rajdhani(size: 48, weight: .bold))
                            .foregroundColor(.white)
                            .uppercase()
                        
                        // CLUB
                        Text("CLUB")
                            .font(.rajdhani(size: 20, weight: .bold))
                            .foregroundColor(.white)
                            .uppercase()
                    }
                }
                .scaleEffect(isAnimating ? 1.0 : 0.8)
                .opacity(isAnimating ? 1.0 : 0.0)
                .animation(.easeInOut(duration: 1.5), value: isAnimating)
            }
        }
        .onAppear {
            // Start animation
            withAnimation(.easeInOut(duration: 0.5)) {
                isAnimating = true
            }
            
            // Navigate to main app after delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                withAnimation(.easeInOut(duration: 0.5)) {
                    showMainApp = true
                }
            }
        }
        .fullScreenCover(isPresented: $showMainApp) {
            ContentView()
        }
    }
}

// Custom Octagon Shape
struct OctagonShape: Shape {
    func path(in rect: CGRect) -> Path {
        let width = rect.width
        let height = rect.height
        let centerX = width / 2
        let centerY = height / 2
        let radius = min(width, height) / 2 - 10
        
        var path = Path()
        
        // Calculate octagon points
        let points = (0..<8).map { i in
            let angle = Double(i) * .pi / 4
            let x = centerX + radius * cos(angle)
            let y = centerY + radius * sin(angle)
            return CGPoint(x: x, y: y)
        }
        
        // Draw octagon
        path.move(to: points[0])
        for i in 1..<points.count {
            path.addLine(to: points[i])
        }
        path.closeSubpath()
        
        return path
    }
}

#Preview {
    SplashScreenView()
} 