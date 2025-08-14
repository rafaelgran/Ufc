# 🥊 Live Activity Fighter API - Guia Completo

## 📱 Visão Geral

Esta API permite que a Live Activity busque automaticamente os **nomes completos dos lutadores** da luta ao vivo diretamente do banco de dados Supabase, garantindo que as informações estejam sempre atualizadas e precisas.

## 🚀 Funcionalidades Principais

### ✅ **Busca Automática de Lutadores**
- Identifica automaticamente a luta ao vivo (status = 'live')
- Busca dados completos dos lutadores: nome, apelido, record, ranking, país
- Atualiza a Live Activity em tempo real

### ✅ **Atualizações Automáticas**
- Sistema de atualização a cada 30 segundos
- Verifica continuamente se há lutas ao vivo
- Para automaticamente quando não há Live Activity ativa

### ✅ **API Completa**
- Busca manual dos nomes dos lutadores
- Atualização forçada da Live Activity
- Monitoramento de mudanças em tempo real

## 🔧 Como Usar

### **1. Inicialização Automática**
A Live Activity inicia automaticamente as atualizações quando é exibida:

```swift
.onAppear {
    // Iniciar atualização automática dos nomes dos lutadores
    Task {
        await startLiveFighterUpdates()
    }
}
```

**O que acontece automaticamente:**
- Busca a luta ao vivo no banco de dados
- Atualiza os nomes completos dos lutadores
- Atualiza ranking, país e record
- Continua atualizando a cada 30 segundos

### **2. Busca Manual dos Nomes**
```swift
// Buscar nomes dos lutadores da luta ao vivo
let (fighter1, fighter2) = await fetchLiveFighterNames()

if let fighter1 = fighter1, let fighter2 = fighter2 {
    print("Luta: \(fighter1) vs \(fighter2)")
}
```

### **3. Atualização Forçada**
```swift
// Forçar atualização da Live Activity
await forceUpdateLiveActivity()
```

### **4. Iniciar Atualizações Automáticas**
```swift
// Iniciar sistema de atualizações automáticas
Task {
    await startLiveFighterUpdates()
}
```

## 📊 Estrutura dos Dados

### **Fighter (Lutador)**
```swift
struct Fighter: Codable {
    let id: Int
    let name: String           // Nome completo
    let nickname: String?      // Apelido
    let wins: Int?            // Vitórias
    let losses: Int?          // Derrotas
    let draws: Int?           // Empates
    let ranking: String?      // Ranking UFC
    let country: String?      // País de origem
}
```

### **Fight (Luta)**
```swift
struct Fight: Codable {
    let id: Int
    let eventid: Int          // ID do evento
    let fighter1id: Int       // ID do lutador 1
    let fighter2id: Int       // ID do lutador 2
    let weightclass: String?  // Categoria de peso
    let status: String?       // Status da luta
    let is_finished: Bool?    // Luta finalizada
    let fightorder: Int?      // Ordem da luta
}
```

## 🌐 Endpoints da API

### **Base URL**
```
https://igxztpjrojdmyzzhqxsv.supabase.co/rest/v1
```

### **Endpoints Disponíveis**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/fights?status=eq.live` | Buscar lutas ao vivo |
| GET | `/fighters?id=eq.{id}` | Buscar lutador específico |

### **Headers Necessários**
```swift
"Authorization": "Bearer {apiKey}"
"apikey": "{apiKey}"
"Content-Type": "application/json"
```

## 🔄 Fluxo de Atualização

### **1. Detecção da Luta ao Vivo**
```swift
// Busca lutas com status 'live'
let liveFightsURL = "\(baseURL)/fights?select=*&status=eq.live&order=fightorder.asc&limit=1"
```

### **2. Busca dos Lutadores**
```swift
// Para cada lutador da luta ao vivo
let fighter1 = await fetchFighter(id: liveFight.fighter1id)
let fighter2 = await fetchFighter(id: liveFight.fighter2id)
```

### **3. Atualização da Live Activity**
```swift
// Cria novo estado mantendo dados existentes e atualizando apenas a luta ao vivo
let updatedState = UFCEventLiveActivityAttributes.ContentState(
    // ... campos existentes mantidos ...
    
    // ATUALIZAR APENAS OS CAMPOS DA LUTA AO VIVO
    liveFightFighter1LastName: fighter1.name,
    liveFightFighter2LastName: fighter2.name,
    liveFightFighter1Ranking: fighter1.ranking,
    liveFightFighter2Ranking: fighter2.ranking,
    liveFightFighter1Country: fighter1.country,
    liveFightFighter2Country: fighter2.country,
    currentFight: "\(fighter1.name) vs \(fighter2.name)"
)

// Atualiza a Live Activity
await activity.update(using: updatedState)
```

## 📱 Integração com a Live Activity

### **Campos Atualizados Automaticamente**

#### **Luta ao Vivo (Principais)**
- `liveFightFighter1LastName` → Nome completo do lutador 1 da luta ao vivo
- `liveFightFighter2LastName` → Nome completo do lutador 2 da luta ao vivo
- `currentFight` → "Nome1 vs Nome2" (descrição da luta atual)
- `liveFightFighter1Ranking` → Ranking do lutador 1 da luta ao vivo
- `liveFightFighter2Ranking` → Ranking do lutador 2 da luta ao vivo
- `liveFightFighter1Country` → País do lutador 1 da luta ao vivo
- `liveFightFighter2Country` → País do lutador 2 da luta ao vivo

#### **Outros Campos (Mantidos)**
- `fighter1LastName` → Nome do lutador 1 (não alterado)
- `fighter2LastName` → Nome do lutador 2 (não alterado)
- `mainEventFighter1LastName` → Nome do lutador 1 do evento principal
- `mainEventFighter2LastName` → Nome do lutador 2 do evento principal

### **Exemplo de Uso na Interface**
```swift
// Exibir nomes completos dos lutadores da luta ao vivo
Text("\(context.state.liveFightFighter1LastName) vs \(context.state.liveFightFighter2LastName)")
    .font(.widgetRajdhani(size: 16, weight: .bold))

// Exibir ranking dos lutadores da luta ao vivo
if let ranking1 = context.state.liveFightFighter1Ranking {
    Text(ranking1)
        .font(.widgetRajdhani(size: 14, weight: .bold))
        .foregroundColor(ranking1 == "C" ? .black : .white)
        .padding(.horizontal, 4)
        .padding(.vertical, 1)
        .background(
            RoundedRectangle(cornerRadius: 3)
                .fill(ranking1 == "C" ? Color.yellow : Color.gray.opacity(0.6))
        )
}

// Exibir país dos lutadores da luta ao vivo
Text("País: \(context.state.liveFightFighter1Country ?? "N/A")")
    .font(.widgetRajdhani(size: 10, weight: .regular))

// Exibir descrição da luta atual
if let currentFight = context.state.currentFight {
    Text(currentFight)
        .font(.widgetRajdhani(size: 12, weight: .medium))
        .foregroundColor(.gray)
}
```

## 🚨 Tratamento de Erros

### **Cenários de Erro**
1. **Sem luta ao vivo**: Retorna dados vazios
2. **Erro de rede**: Log de erro e retry automático
3. **API indisponível**: Fallback para dados locais
4. **Live Activity inativa**: Para atualizações automaticamente

### **Logs de Debug**
```swift
print("🔍 Live Activity: Buscando lutadores da luta ao vivo...")
print("✅ Live Activity: Luta ao vivo encontrada - ID: \(liveFight.id)")
print("❌ Live Activity: Erro ao buscar lutas ao vivo")
print("⚠️ Live Activity: Nenhuma luta ao vivo encontrada")
```

## 🔧 Configuração

### **Variáveis de Ambiente**
```swift
private let baseURL = "https://igxztpjrojdmyzzhqxsv.supabase.co/rest/v1"
private let apiKey = "sua_chave_api_aqui"
```

### **Intervalo de Atualização**
```swift
let updateInterval: TimeInterval = 30 // 30 segundos
```

## 📋 Exemplos Práticos

### **Exemplo 1: Widget Simples**
```swift
struct SimpleFighterWidget: View {
    var body: some View {
        VStack {
            Text("Luta ao Vivo")
                .font(.headline)
            
            // Os nomes da luta ao vivo são atualizados automaticamente
            Text("\(context.state.liveFightFighter1LastName) vs \(context.state.liveFightFighter2LastName)")
                .font(.title2)
                .bold()
            
            // Exibir ranking se disponível
            if let ranking1 = context.state.liveFightFighter1Ranking {
                Text(ranking1)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .onAppear {
            Task {
                await startLiveFighterUpdates()
            }
        }
    }
}
```

### **Exemplo 2: Atualização Manual**
```swift
Button("Atualizar Agora") {
    Task {
        await forceUpdateLiveActivity()
    }
}
```

### **Exemplo 3: Monitoramento Contínuo**
```swift
.onReceive(Timer.publish(every: 30, on: .main, in: .common).autoconnect()) { _ in
    Task {
        await updateLiveActivityWithLiveFightData()
    }
}
```

## 🎯 Benefícios

### **✅ Precisão dos Dados**
- **Nomes completos** sempre atualizados (não apenas sobrenomes)
- Informações em tempo real do banco de dados
- Sincronização automática com o status das lutas

### **✅ Experiência do Usuário**
- Interface sempre atualizada com nomes reais dos lutadores
- Informações completas: nome, ranking, país, record
- Atualizações automáticas a cada 30 segundos

### **✅ Manutenibilidade**
- Código limpo e organizado
- Tratamento de erros robusto
- Logs detalhados para debug
- Funções de teste para verificar funcionamento

## 🔮 Próximas Funcionalidades

- [ ] Cache local para dados offline
- [ ] Notificações push para mudanças
- [ ] Histórico de lutas
- [ ] Estatísticas em tempo real
- [ ] Integração com outras APIs UFC

## 🥊 **Como os Nomes Completos são Exibidos**

### **Antes (Sobrenomes apenas)**
```
Taira vs Park
```

### **Depois (Nomes Completos)**
```
Taira Kai vs Park Jun-yong
```

### **Campos Atualizados na Interface**
- **Seção "LIVE"**: Nomes completos dos lutadores da luta ao vivo
- **Rankings**: Exibidos com cores diferentes (amarelo para campeão)
- **Países**: Mostrados para cada lutador
- **Descrição**: "Nome Completo 1 vs Nome Completo 2" atualizada automaticamente

### **Exemplo de Dados Completos**
```swift
// Lutador 1
liveFightFighter1LastName: "Taira Kai"           // Nome completo
liveFightFighter1Ranking: "#12"                  // Ranking UFC
liveFightFighter1Country: "Japan"                // País de origem

// Lutador 2  
liveFightFighter2LastName: "Park Jun-yong"       // Nome completo
liveFightFighter2Ranking: "#15"                  // Ranking UFC
liveFightFighter2Country: "South Korea"          // País de origem
```

---

## 📞 Suporte

Para dúvidas ou problemas com a API, consulte:
- Logs do console para debug
- Documentação do Supabase
- Exemplos de uso no arquivo `LiveActivityFighterAPI.swift`
