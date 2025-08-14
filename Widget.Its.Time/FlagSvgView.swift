import SwiftUI
import SVGKit

// Cache global para SVGs renderizados (otimizado)
class SvgCache {
    static let shared = SvgCache()
    private var cache: [String: UIImage] = [:]
    private let queue = DispatchQueue(label: "svg.cache", attributes: .concurrent)
    
    // Pré-carregar bandeiras comuns para evitar placeholder cinza
    init() {
        preloadCommonFlags()
    }
    
    func preloadCommonFlags() {
        let commonFlags = [
            // Japan (Live Fight)
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><circle fill=\"#bc002d\" cx=\"320\" cy=\"240\" r=\"120\"/></svg>",
            // South Korea (Live Fight)
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#fff\" d=\"M0 0h640v480H0z\"/><path fill=\"#cd2e3a\" d=\"M0 0h640v480H0z\"/><path fill=\"#0047a0\" d=\"M0 0h640v240H0z\"/><path fill=\"#fff\" d=\"M0 0h640v160H0z\"/><path fill=\"#cd2e3a\" d=\"M0 0h640v80H0z\"/></svg>",
            // Brazil (Main Event)
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#009b3a\" d=\"M0 0h640v480H0z\"/><path fill=\"#fedf00\" d=\"M320 240L240 120l80-60 80 60z\"/><circle fill=\"#002776\" cx=\"320\" cy=\"240\" r=\"40\"/><path fill=\"#fff\" d=\"M320 220c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 32c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z\"/></svg>",
            // United States (Main Event)
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 480\"><path fill=\"#bd3d44\" d=\"M0 0h640v480H0\"/><path stroke=\"#fff\" stroke-width=\"37\" d=\"M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640\"/><rect fill=\"#192f5d\" width=\"247\" height=\"259\"/><g fill=\"#fff\"><g id=\"d\"><g id=\"c\"><g id=\"e\"><g id=\"b\"><path id=\"a\" d=\"M24.8 25l3.2 9.8h10.3l-8.4 6.1 3.2 9.8-8.3-6-8.3 6 3.2-9.8-8.4-6.1h10.3z\"/><use href=\"#a\" y=\"19.5\"/><use href=\"#a\" y=\"39\"/></g><use href=\"#b\" y=\"78\"/></g><use href=\"#c\" y=\"156\"/></g><use href=\"#d\" y=\"312\"/></g></svg>"
        ]
        
        for flagSvg in commonFlags {
            if let image = renderSvgToImage(flagSvg, size: 16) {
                setImage(image, for: flagSvg, size: 16)
            }
        }
    }
    
    private func renderSvgToImage(_ svgString: String, size: CGFloat) -> UIImage? {
        guard !svgString.isEmpty,
              svgString.contains("<svg"),
              let svgData = svgString.data(using: .utf8),
              let svgImage = SVGKImage(data: svgData) else {
            return nil
        }
        
        svgImage.size = CGSize(width: size, height: size)
        return svgImage.uiImage
    }
    
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
    let countryCode: String?
    let svgString: String?
    let size: CGFloat
    let countryName: String?
    
    // Inicializador para compatibilidade com countryCode
    init(countryCode: String, size: CGFloat) {
        self.countryCode = countryCode
        self.svgString = nil
        self.size = size
        self.countryName = nil
    }
    
    // Inicializador para svgString (como no app principal)
    init(svgString: String, size: CGFloat, countryName: String?) {
        self.countryCode = nil
        self.svgString = svgString
        self.size = size
        self.countryName = countryName
    }
    
    var body: some View {
        if let svgString = svgString, !svgString.isEmpty {
            // Usar SVG string se disponível (otimizado)
            StableSvgView(svgString: svgString, size: size, countryName: countryName)
        } else if let countryCode = countryCode {
            // Fallback para emoji baseado no countryCode
            FlagEmojiView(countryName: countryCode, size: size)
        } else {
            // Fallback para emoji genérico
            FlagEmojiView(countryName: nil, size: size)
        }
    }
    
    // Pré-carregar bandeiras comuns para evitar placeholder cinza
    static func preloadFlags() {
        SvgCache.shared.preloadCommonFlags()
    }
}

// Nova view otimizada para estabilidade na live activity
struct StableSvgView: View {
    let svgString: String
    let size: CGFloat
    let countryName: String?
    
    // Usar @State para manter a imagem carregada
    @State private var svgImage: UIImage?
    @State private var isLoading = true
    @State private var hasError = false
    
    // Cache local para evitar recriações
    private static var imageCache: [String: UIImage] = [:]
    
    // Pré-carregar SVG para evitar placeholder cinza
    init(svgString: String, size: CGFloat, countryName: String?) {
        self.svgString = svgString
        self.size = size
        self.countryName = countryName
        
        // Tentar carregar imediatamente se estiver em cache
        let cacheKey = "\(svgString.hashValue)_\(size)"
        if let cachedImage = Self.imageCache[cacheKey] {
            self._svgImage = State(initialValue: cachedImage)
            self._isLoading = State(initialValue: false)
        }
    }
    
    var body: some View {
        ZStack {
            // Imagem SVG renderizada (prioridade máxima)
            if let image = svgImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: size, height: size)
                    .clipShape(RoundedRectangle(cornerRadius: 50))
            } else if isLoading {
                // Placeholder sutil enquanto carrega (não cinza)
                RoundedRectangle(cornerRadius: 50)
                    .fill(Color.white.opacity(0.1))
                    .frame(width: size, height: size)
                    .overlay(
                        ProgressView()
                            .scaleEffect(0.5)
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    )
            } else if hasError {
                // Fallback para emoji se SVG falhar
                FlagEmojiView(countryName: countryName, size: size)
            }
        }
        .frame(width: size, height: size)
        .onAppear {
            loadSvgStable()
        }
    }
    
    private func loadSvgStable() {
        let cacheKey = "\(svgString.hashValue)_\(size)"
        
        // Primeiro, verificar cache local (síncrono para velocidade)
        if let cachedImage = Self.imageCache[cacheKey] {
            self.svgImage = cachedImage
            self.isLoading = false
            return
        }
        
        // Depois, verificar cache global (síncrono para velocidade)
        if let cachedImage = SvgCache.shared.getImage(for: svgString, size: size) {
            Self.imageCache[cacheKey] = cachedImage
            self.svgImage = cachedImage
            self.isLoading = false
            return
        }
        
        // Se não estiver em cache, renderizar com prioridade máxima
        DispatchQueue.global(qos: .userInteractive).async {
            if let image = renderSvgOptimized() {
                // Salvar nos caches
                SvgCache.shared.setImage(image, for: svgString, size: size)
                Self.imageCache[cacheKey] = image
                
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
        // Verificar se SVG é válido antes de processar
        guard !svgString.isEmpty,
              svgString.contains("<svg"),
              let svgData = svgString.data(using: .utf8),
              let svgImage = SVGKImage(data: svgData) else {
            return nil
        }
        
        // Configurar tamanho otimizado
        svgImage.size = CGSize(width: size, height: size)
        
        // Converter para UIImage
        return svgImage.uiImage
    }
}

// View original mantida para compatibilidade
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
                RoundedRectangle(cornerRadius: 50)
                    .fill(Color.gray.opacity(0.3))
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
        .onAppear {
            loadSvgWithTimeout()
        }
    }
    
    private func loadSvgWithTimeout() {
        // Primeiro, verificar cache
        if let cachedImage = SvgCache.shared.getImage(for: svgString, size: size) {
            self.svgImage = cachedImage
            self.isLoading = false
            return
        }
        
        // Renderizar SVG em background sem timeout
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
        // Verificar se SVG é válido antes de processar
        guard !svgString.isEmpty,
              svgString.contains("<svg"),
              let svgData = svgString.data(using: .utf8),
              let svgImage = SVGKImage(data: svgData) else {
            return nil
        }
        
        // Configurar tamanho otimizado
        svgImage.size = CGSize(width: size, height: size)
        
        // Converter para UIImage
        return svgImage.uiImage
    }
}

struct FlagEmojiView: View {
    let countryName: String?
    let size: CGFloat
    
    var body: some View {
        Text(getFlagEmoji())
            .font(.system(size: size))
    }
    
    private func getFlagEmoji() -> String {
        guard let countryName = countryName?.lowercased() else {
            return "🏳️"
        }
        
        // Mapeamento simplificado apenas para países mais comuns no UFC
        let countryFlags: [String: String] = [
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