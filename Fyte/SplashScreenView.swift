import SwiftUI

struct SplashScreenView: View {
    @State private var isAnimating = false
    @State private var showMainApp = false

    var body: some View {
        ZStack {
            // Background color - #1c1c1c
            Color(red: 0.984, green: 1.0, blue: 0.020) // #1c1c1c
                .ignoresSafeArea()

            VStack {
                Spacer()
                
                // Logo Container (centro absoluto da tela)
                VStack(spacing: 0) {
                    // SVG Logo - smaller and centered
                    Image("fyte-logo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 190, height: 190) 
                        .scaleEffect(isAnimating ? 1.0 : 0.8)
                        .opacity(isAnimating ? 1.0 : 0.0)
                        .animation(.easeInOut(duration: 2.5), value: isAnimating)
                        .offset(y: 100) // Empurra o logo 100px para baixo
                }
                
                Spacer()
                
                // Arte "fyte-slogan" na parte inferior - 210px de largura
                Image("fyte-slogan")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 210, height: 200)
                    .opacity(isAnimating ? 1 : 0.0)
                    .animation(.easeInOut(duration: 1.0).delay(0.5), value: isAnimating)
                    .padding(.bottom, 40)
                    .offset(y: 100) // Empurra o slogan 100px para baixo
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

#Preview {
    SplashScreenView()
} 