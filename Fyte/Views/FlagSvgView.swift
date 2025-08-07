import SwiftUI
import SVGKit

// Cache global para SVGs renderizados
class SvgCache {
    static let shared = SvgCache()
    private var cache: [String: UIImage] = [:]
    private let queue = DispatchQueue(label: "svg.cache", attributes: .concurrent)
    
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
    
    func clearCache() {
        queue.async(flags: .barrier) {
            self.cache.removeAll()
        }
    }
}

struct FlagSvgView: View {
    let svgString: String
    let size: CGFloat
    let countryName: String?
    
    var body: some View {
        if svgString.isEmpty {
            // Fallback para emoji de bandeira
            Text("🏳️")
                .font(.system(size: size))
        } else {
            // Usar SVGKit otimizado com cache
            OptimizedSvgView(svgString: svgString, size: size, countryName: countryName)
        }
    }
}

struct OptimizedSvgView: View {
    let svgString: String
    let size: CGFloat
    let countryName: String?
    @State private var svgImage: UIImage?
    @State private var isLoading = true
    @State private var hasError = false
    
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
                    .clipShape(RoundedRectangle(cornerRadius: 50))
            }
            
            // Fallback para emoji se SVG falhar
            if hasError {
                FlagEmojiView(countryName: countryName, size: size)
            }
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: 50))
        .onAppear {
            loadSvg()
        }
    }
    
    private func loadSvg() {
        // Primeiro, verificar cache
        if let cachedImage = SvgCache.shared.getImage(for: svgString, size: size) {
            self.svgImage = cachedImage
            self.isLoading = false
            return
        }
        
        // Se não estiver em cache, renderizar em background
        DispatchQueue.global(qos: .userInitiated).async {
            if let image = renderSvgOptimized() {
                // Salvar no cache
                SvgCache.shared.setImage(image, for: svgString, size: size)
                
                DispatchQueue.main.async {
                    self.svgImage = image
                    self.isLoading = false
                }
            } else {
                // Fallback se não conseguir renderizar
                DispatchQueue.main.async {
                    self.hasError = true
                    self.isLoading = false
                }
            }
        }
    }
    
    private func renderSvgOptimized() -> UIImage? {
        // Otimização: verificar se SVG é válido antes de processar
        guard !svgString.isEmpty,
              svgString.contains("<svg"),
              let svgData = svgString.data(using: .utf8),
              let svgImage = SVGKImage(data: svgData) else {
            return nil
        }
        
        // Configurar tamanho otimizado
        svgImage.size = CGSize(width: size, height: size)
        
        // Converter para UIImage com qualidade otimizada
        return svgImage.uiImage
    }
}

struct FlagEmojiView: View {
    let countryName: String?
    let size: CGFloat
    
    var body: some View {
        // Mapear países para emojis de bandeira
        Text(getFlagEmoji())
            .font(.system(size: size))
            .background(
                RoundedRectangle(cornerRadius: 50)
                    .fill(Color.gray.opacity(0.1))
                    .frame(width: size, height: size)
            )
            .clipShape(RoundedRectangle(cornerRadius: 50))
    }
    
    private func getFlagEmoji() -> String {
        guard let countryName = countryName?.lowercased() else {
            return "🏳️"
        }
        
        // Mapeamento de países para emojis de bandeira
        let countryFlags: [String: String] = [
            // Países mais comuns no UFC
            "united states": "🇺🇸", "usa": "🇺🇸", "america": "🇺🇸",
            "brazil": "🇧🇷", "brasil": "🇧🇷",
            "canada": "🇨🇦",
            "australia": "🇦🇺",
            "united kingdom": "🇬🇧", "england": "🇬🇧", "uk": "🇬🇧",
            "ireland": "🇮🇪",
            "russia": "🇷🇺",
            "poland": "🇵🇱",
            "germany": "🇩🇪",
            "france": "🇫🇷",
            "spain": "🇪🇸",
            "italy": "🇮🇹",
            "netherlands": "🇳🇱", "holland": "🇳🇱",
            "sweden": "🇸🇪",
            "norway": "🇳🇴",
            "denmark": "🇩🇰",
            "finland": "🇫🇮",
            "switzerland": "🇨🇭",
            "austria": "🇦🇹",
            "belgium": "🇧🇪",
            "portugal": "🇵🇹",
            "greece": "🇬🇷",
            "czech republic": "🇨🇿", "czech": "🇨🇿",
            "hungary": "🇭🇺",
            "romania": "🇷🇴",
            "bulgaria": "🇧🇬",
            "croatia": "🇭🇷",
            "serbia": "🇷🇸",
            "bosnia": "🇧🇦",
            "montenegro": "🇲🇪",
            "macedonia": "🇲🇰",
            "albania": "🇦🇱",
            "slovenia": "🇸🇮",
            "slovakia": "🇸🇰",
            "estonia": "🇪🇪",
            "latvia": "🇱🇻",
            "lithuania": "🇱🇹",
            "ukraine": "🇺🇦",
            "belarus": "🇧🇾",
            "moldova": "🇲🇩",
            "georgia": "🇬🇪",
            "armenia": "🇦🇲",
            "azerbaijan": "🇦🇿",
            "kazakhstan": "🇰🇿",
            "uzbekistan": "🇺🇿",
            "kyrgyzstan": "🇰🇬",
            "tajikistan": "🇹🇯",
            "turkmenistan": "🇹🇲",
            "afghanistan": "🇦🇫",
            "pakistan": "🇵🇰",
            "india": "🇮🇳",
            "bangladesh": "🇧🇩",
            "sri lanka": "🇱🇰",
            "nepal": "🇳🇵",
            "bhutan": "🇧🇹",
            "myanmar": "🇲🇲", "burma": "🇲🇲",
            "thailand": "🇹🇭",
            "laos": "🇱🇦",
            "vietnam": "🇻🇳",
            "cambodia": "🇰🇭",
            "malaysia": "🇲🇾",
            "singapore": "🇸🇬",
            "indonesia": "🇮🇩",
            "philippines": "🇵🇭",
            "taiwan": "🇹🇼",
            "hong kong": "🇭🇰",
            "macau": "🇲🇴",
            "china": "🇨🇳",
            "japan": "🇯🇵",
            "south korea": "🇰🇷", "korea": "🇰🇷",
            "mongolia": "🇲🇳",
            "north korea": "🇰🇵",
            "mexico": "🇲🇽",
            "argentina": "🇦🇷",
            "chile": "🇨🇱",
            "peru": "🇵🇪",
            "colombia": "🇨🇴",
            "venezuela": "🇻🇪",
            "ecuador": "🇪🇨",
            "bolivia": "🇧🇴",
            "paraguay": "🇵🇾",
            "uruguay": "🇺🇾",
            "guyana": "🇬🇾",
            "suriname": "🇸🇷",
            "french guiana": "🇬🇫",
            "south africa": "🇿🇦", "africa": "🇿🇦",
            "nigeria": "🇳🇬",
            "ghana": "🇬🇭",
            "kenya": "🇰🇪",
            "uganda": "🇺🇬",
            "tanzania": "🇹🇿",
            "ethiopia": "🇪🇹",
            "somalia": "🇸🇴",
            "djibouti": "🇩🇯",
            "eritrea": "🇪🇷",
            "sudan": "🇸🇩",
            "south sudan": "🇸🇸",
            "central african republic": "🇨🇫",
            "cameroon": "🇨🇲",
            "congo": "🇨🇬",
            "democratic republic of the congo": "🇨🇩", "drc": "🇨🇩",
            "angola": "🇦🇴",
            "zambia": "🇿🇲",
            "zimbabwe": "🇿🇼",
            "botswana": "🇧🇼",
            "namibia": "🇳🇦",
            "eswatini": "🇸🇿", "swaziland": "🇸🇿",
            "lesotho": "🇱🇸",
            "madagascar": "🇲🇬",
            "mauritius": "🇲🇺",
            "seychelles": "🇸🇨",
            "comoros": "🇰🇲",
            "mayotte": "🇾🇹",
            "reunion": "🇷🇪",
            "malawi": "🇲🇼",
            "mozambique": "🇲🇿"
        ]
        
        // Procurar por correspondência exata
        if let flag = countryFlags[countryName] {
            return flag
        }
        
        // Procurar por correspondência parcial
        for (country, flag) in countryFlags {
            if countryName.contains(country) || country.contains(countryName) {
                return flag
            }
        }
        
        // Fallback para bandeira genérica
        return "🏳️"
    }
} 