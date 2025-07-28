import SwiftUI
import CoreText

struct CustomFonts {
    static func registerFonts() {
        // Register Rajdhani fonts
        registerFont(named: "Rajdhani-Regular")
        registerFont(named: "Rajdhani-Bold")
        registerFont(named: "Rajdhani-Medium")
        
        // Register Inter fonts
        registerFont(named: "Inter-Regular")
        registerFont(named: "Inter-Bold")
        registerFont(named: "Inter-Medium")
    }
    
    private static func registerFont(named fontName: String) {
        guard let fontURL = Bundle.main.url(forResource: fontName, withExtension: "ttf") else {
            print("⚠️ Font file not found: \(fontName).ttf")
            return
        }
        
        var error: Unmanaged<CFError>?
        if CTFontManagerRegisterFontsForURL(fontURL as CFURL, .process, &error) {
            print("✅ Successfully registered font: \(fontName)")
        } else {
            if let error = error?.takeRetainedValue() {
                print("❌ Failed to register font \(fontName): \(error)")
            } else {
                print("❌ Failed to register font \(fontName): Unknown error")
            }
        }
    }
}

extension Font {
    static func rajdhani(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        switch weight {
        case .bold:
            return .custom("Rajdhani-Bold", size: size)
        case .medium:
            return .custom("Rajdhani-Medium", size: size)
        default:
            return .custom("Rajdhani-Regular", size: size)
        }
    }
    
    static func inter(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        switch weight {
        case .bold:
            return .custom("Inter-Bold", size: size)
        case .medium:
            return .custom("Inter-Medium", size: size)
        default:
            return .custom("Inter-Regular", size: size)
        }
    }
} 