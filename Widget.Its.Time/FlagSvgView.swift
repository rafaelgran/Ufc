import SwiftUI
import SVGKit

// Cache global para SVGs renderizados (versão simplificada para widget)
class WidgetSvgCache {
    static let shared = WidgetSvgCache()
    private var cache: [String: UIImage] = [:]
    private let queue = DispatchQueue(label: "widget.svg.cache", attributes: .concurrent)
    
    func getImage(for svgString: String, size: CGFloat) -> UIImage? {
        let key = "\(svgString.hashValue)_\(size)"
        return queue.sync {
            return cache[key]
        }
    }
    
    func setImage(_ image: UIImage, for svgString: String, size: CGFloat) {
        let key = "\(svgString.hashValue)_\(size)"
        queue.async(flags: .barrier) {
            self.cache[key] = image
        }
    }
}

struct FlagSvgView: View {
    let countryCode: String
    let size: CGFloat
    
    var body: some View {
        WidgetOptimizedSvgView(countryCode: countryCode, size: size)
    }
}

struct WidgetOptimizedSvgView: View {
    let countryCode: String
    let size: CGFloat
    @State private var svgImage: UIImage?
    @State private var isLoading = true
    
    var body: some View {
        ZStack {
            // Placeholder enquanto carrega
            if isLoading {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: size, height: size)
            }
            
            // Imagem SVG renderizada
            if let image = svgImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: size, height: size)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
            }
        }
        .frame(width: size, height: size)
        .onAppear {
            loadSvg()
        }
    }
    
    private func loadSvg() {
        // Obter SVG string do país
        let svgString = getSvgString(for: countryCode)
        
        if svgString.isEmpty {
            // Fallback para emoji se não encontrar SVG
            self.isLoading = false
            return
        }
        
        // Primeiro, verificar cache
        if let cachedImage = WidgetSvgCache.shared.getImage(for: svgString, size: size) {
            self.svgImage = cachedImage
            self.isLoading = false
            return
        }
        
        // Se não estiver em cache, renderizar em background
        DispatchQueue.global(qos: .userInitiated).async {
            if let image = renderSvg(svgString: svgString, size: size) {
                // Salvar no cache
                WidgetSvgCache.shared.setImage(image, for: svgString, size: size)
                
                DispatchQueue.main.async {
                    self.svgImage = image
                    self.isLoading = false
                }
            } else {
                DispatchQueue.main.async {
                    self.isLoading = false
                }
            }
        }
    }
    
    private func renderSvg(svgString: String, size: CGFloat) -> UIImage? {
        guard let svgData = svgString.data(using: .utf8) else { return nil }
        
        do {
            guard let svgImage = try SVGKImage(data: svgData) else { return nil }
            svgImage.size = CGSize(width: size, height: size)
            
            let renderer = UIGraphicsImageRenderer(size: CGSize(width: size, height: size))
            let image = renderer.image { context in
                svgImage.uiImage.draw(in: CGRect(x: 0, y: 0, width: size, height: size))
            }
            
            return image
        } catch {
            print("🔍 Debug: Erro ao renderizar SVG para \(countryCode): \(error)")
            return nil
        }
    }
    
    private func getSvgString(for countryCode: String) -> String {
        // Mapeamento simplificado de códigos de país para SVGs
        let svgMap: [String: String] = [
            "USA": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#bd3d44\" d=\"M0 0h640v480H0\"/><path stroke=\"#fff\" stroke-width=\"37\" d=\"M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640\"/><rect fill=\"#192f5d\" width=\"247\" height=\"259\"/><g fill=\"#fff\"><g id=\"d\"><g id=\"c\"><g id=\"e\"><g id=\"b\"><path id=\"a\" d=\"M24.8 25l3.2 9.8h10.3l-8.4 6.1 3.2 9.8-8.3-6-8.3 6 3.2-9.8-8.4-6.1h10.3z\"/><use href=\"#a\" y=\"19.5\"/><use href=\"#a\" y=\"39\"/></g><use href=\"#b\" y=\"78\"/></g><use href=\"#c\" y=\"156\"/></g><use href=\"#d\" y=\"312\"/></g></svg>",
            "BRA": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#009b3a\" d=\"M0 0h640v480H0z\"/><path fill=\"#fedf00\" d=\"M320 240L240 120l80-60 80 60z\"/><circle fill=\"#002776\" cx=\"320\" cy=\"240\" r=\"40\"/><path fill=\"#fff\" d=\"M320 220c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 32c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z\"/></svg>",
            "RUS": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><path fill=\"#0039a6\" d=\"M0 160h640v160H0z\"/><path fill=\"#d52b1e\" d=\"M0 320h640v160H0z\"/></svg>",
            "GBR": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#012169\" d=\"M0 0h640v480H0z\"/><path stroke=\"#fff\" stroke-width=\"6\" d=\"M0 0l640 480M640 0L0 480\"/><path stroke=\"#C8102E\" stroke-width=\"4\" d=\"M0 0l640 480M640 0L0 480\" fill=\"none\"/><path stroke=\"#fff\" stroke-width=\"10\" d=\"M320 0v480M0 240h640\"/><path stroke=\"#C8102E\" stroke-width=\"6\" d=\"M320 0v480M0 240h640\" fill=\"none\"/></svg>",
            "CAN": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><path fill=\"#ff0000\" d=\"M0 0h640v480H0z\"/><path fill=\"#fff\" d=\"M0 0h320v240H0z\"/><path fill=\"#ff0000\" d=\"M120 60l40 120-100-80h120l-100 80z\"/></svg>",
            "AUS": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#012169\" d=\"M0 0h640v480H0z\"/><path stroke=\"#fff\" stroke-width=\"6\" d=\"M0 0l640 480M640 0L0 480\"/><path stroke=\"#C8102E\" stroke-width=\"4\" d=\"M0 0l640 480M640 0L0 480\" fill=\"none\"/><path stroke=\"#fff\" stroke-width=\"10\" d=\"M320 0v480M0 240h640\"/><path stroke=\"#C8102E\" stroke-width=\"6\" d=\"M320 0v480M0 240h640\" fill=\"none\"/><circle fill=\"#fff\" cx=\"320\" cy=\"240\" r=\"60\"/><path fill=\"#012169\" d=\"M320 180l-10 30h-30l25 20-10 30 25-20 25 20-10-30 25-20h-30z\"/></svg>"
        ]
        
        return svgMap[countryCode] ?? ""
    }
} 