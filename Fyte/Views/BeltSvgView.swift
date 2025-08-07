import SwiftUI

struct BeltSvgView: View {
    let size: CGFloat
    
    var body: some View {
        Image("belt")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(width: size, height: size)
            .foregroundColor(Color(red: 0.984, green: 1.0, blue: 0.020)) // #FBFF05
    }
} 