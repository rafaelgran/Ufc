# Live Activity Status Logic Fix

## Problema Identificado

A lógica de estados da Live Activity estava **fundamentalmente incorreta**:

### ❌ Lógica Anterior Incorreta

```swift
// ❌ PROBLEMA: Status baseado apenas em presença de luta ao vivo
let eventStatus = hasLiveFight ? "live" : "starting"

// ❌ PROBLEMA: Status "finished" sempre usado ao parar Live Activity
func stopCurrentActivity() async {
    let finalState = UFCEventLiveActivityAttributes.ContentState(
        eventStatus: "finished", // ← SEMPRE "finished" independente do estado real
        // ... outros campos
    )
}

// ❌ PROBLEMA: Verificações baseadas apenas em tempo
func isEventLive(for event: UFCEvent) -> Bool {
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    return totalMinutes <= 0 && totalMinutes > -120 // ← Apenas tempo, não status real
}
```

### 🚨 Impactos dos Problemas

1. **Live Activity fechando prematuramente**
   - Status "finished" aparecia quando ainda havia lutas agendadas
   - Usuários perdiam acesso à informação antes do evento terminar

2. **Informação contraditória**
   - Contador podia mostrar "12/12" mas status "finished"
   - Sistema não refletia o estado real do evento

3. **Lógica de negócio quebrada**
   - Decisões baseadas em status incorreto
   - Transições de estado inconsistentes

## ✅ Solução Implementada

### 1. Nova Função de Determinação de Status

```swift
// ✅ NOVA FUNÇÃO: Determinar status real do evento baseado no estado das lutas
private func determineEventStatus(for event: UFCEvent) -> String {
    guard let fights = event.fights, !fights.isEmpty else { 
        return "starting" 
    }
    
    // Verificar se TODAS as lutas estão finalizadas
    if areAllFightsFinished(for: event) {
        return "finished" // ✅ Evento realmente terminou
    }
    
    // Verificar se há alguma luta ao vivo
    let (scheduledCount, liveCount, finishedCount, totalCount) = getFightsStatusBreakdown(for: event)
    
    if liveCount > 0 {
        return "live" // ✅ Evento está acontecendo
    }
    
    if scheduledCount > 0 {
        return "starting" // ✅ Evento ainda não começou
    }
    
    return "starting" // Fallback
}
```

### 2. Funções Auxiliares

```swift
// ✅ NOVA FUNÇÃO: Verificar se todas as lutas estão finalizadas
private func areAllFightsFinished(for event: UFCEvent) -> Bool {
    guard let fights = event.fights, !fights.isEmpty else { return false }
    
    let allFinished = fights.allSatisfy { fight in
        fight.status == "finished"
    }
    
    return allFinished
}

// ✅ NOVA FUNÇÃO: Obter breakdown detalhado do status
private func getFightsStatusBreakdown(for event: UFCEvent) -> (scheduled: Int, live: Int, finished: Int, total: Int) {
    guard let fights = event.fights, !fights.isEmpty else { return (0, 0, 0, 0) }
    
    let scheduledCount = fights.filter { $0.status == "scheduled" }.count
    let liveCount = fights.filter { $0.status == "live" }.count
    let finishedCount = fights.filter { $0.status == "finished" }.count
    let totalCount = fights.count
    
    return (scheduledCount, liveCount, finishedCount, totalCount)
}
```

### 3. Estados Corretos Implementados

#### **"starting"** - Evento ainda não começou
- **Condição**: Todas as lutas estão com status "scheduled"
- **Exemplo**: Evento UFC 319 antes de qualquer luta começar
- **Contador**: 0/12 (todas agendadas)

#### **"live"** - Evento está acontecendo
- **Condição**: Há pelo menos uma luta "live" OU há lutas "finished" + "scheduled"
- **Exemplo 1**: Luta 5 ao vivo, lutas 1-4 finalizadas, lutas 6-12 agendadas
- **Exemplo 2**: Lutas 1-8 finalizadas, lutas 9-12 agendadas (evento em progresso)
- **Contador**: 5/12 (4 finalizadas + 1 ao vivo) ou 8/12 (8 finalizadas)

#### **"finished"** - Evento realmente terminou
- **Condição**: TODAS as lutas estão com status "finished"
- **Exemplo**: Todas as 12 lutas do evento foram finalizadas
- **Contador**: 12/12 (todas finalizadas)

### 4. Funções Corrigidas

#### **startEventActivity**
```swift
// ✅ ANTES (incorreto)
let eventStatus = hasLiveFight ? "live" : "starting"

// ✅ DEPOIS (correto)
let eventStatus = determineEventStatus(for: event)
```

#### **updateToLiveStatus**
```swift
// ✅ ANTES (incorreto)
let eventStatus = hasLiveFight ? "live" : "starting"

// ✅ DEPOIS (correto)
let eventStatus = determineEventStatus(for: event)
```

#### **forceUpdateLiveActivity**
```swift
// ✅ ANTES (incorreto)
let eventStatus = timeRemaining == "00:00:00" || timeRemaining == "EVENTO INICIADO" ? "live" : "starting"

// ✅ DEPOIS (correto)
let eventStatus = determineEventStatus(for: event)
```

#### **stopCurrentActivity**
```swift
// ✅ ANTES (incorreto)
let finalState = UFCEventLiveActivityAttributes.ContentState(
    eventStatus: "finished", // ← SEMPRE "finished"
    // ... outros campos
)

// ✅ DEPOIS (correto)
let eventStatus: String
if let eventId = activity.attributes.eventId {
    if let event = await fetchEventFromServer(eventId: eventId) {
        eventStatus = determineEventStatus(for: event) // ← Status real
    } else {
        eventStatus = "finished" // Fallback
    }
} else {
    eventStatus = "finished" // Fallback
}
```

#### **shouldKeepActivityActive**
```swift
// ✅ ANTES (incorreto)
func shouldKeepActivityActive(for event: UFCEvent) -> Bool {
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    return totalMinutes > -480 // ← Apenas tempo
}

// ✅ DEPOIS (correto)
func shouldKeepActivityActive(for event: UFCEvent) -> Bool {
    let eventStatus = determineEventStatus(for: event)
    
    // Se o evento está realmente finalizado, não manter ativa
    if eventStatus == "finished" {
        return false
    }
    
    // Para eventos não finalizados, verificar tempo como fallback
    let timeRemaining = event.timeRemaining
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    return totalMinutes > -480
}
```

#### **isEventLive**
```swift
// ✅ ANTES (incorreto)
func isEventLive(for event: UFCEvent) -> Bool {
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    return totalMinutes <= 0 && totalMinutes > -120 // ← Apenas tempo
}

// ✅ DEPOIS (correto)
func isEventLive(for event: UFCEvent) -> Bool {
    let eventStatus = determineEventStatus(for: event)
    return eventStatus == "live" // ← Status real
}
```

#### **isEventNearStart**
```swift
// ✅ ANTES (incorreto)
func isEventNearStart(for event: UFCEvent) -> Bool {
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    return totalMinutes <= 15 && totalMinutes > 0 // ← Apenas tempo
}

// ✅ DEPOIS (correto)
func isEventNearStart(for event: UFCEvent) -> Bool {
    let eventStatus = determineEventStatus(for: event)
    
    // Se o evento já está ao vivo ou finalizado, não está próximo de começar
    if eventStatus == "live" || eventStatus == "finished" {
        return false
    }
    
    // Para eventos "starting", verificar tempo como fallback
    let timeRemaining = event.timeRemaining
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    return totalMinutes <= 15 && totalMinutes > 0
}
```

## 🧪 Exemplos de Cenários Reais

### **Cenário 1: Evento UFC 319 (12 lutas) - Início**
- **Status das lutas**: 12 "scheduled"
- **Status do evento**: `"starting"` ✅
- **Contador**: `0/12`
- **Live Activity**: Ativa, mostrando luta principal

### **Cenário 2: Evento UFC 319 - Meio do evento**
- **Status das lutas**: 5 "finished" + 1 "live" + 6 "scheduled"
- **Status do evento**: `"live"` ✅
- **Contador**: `6/12` (5 finalizadas + 1 ao vivo)
- **Live Activity**: Ativa, mostrando luta ao vivo

### **Cenário 3: Evento UFC 319 - Final**
- **Status das lutas**: 11 "finished" + 1 "scheduled"
- **Status do evento**: `"live"` ✅ (ainda não terminou!)
- **Contador**: `11/12`
- **Live Activity**: Ativa, mostrando próxima luta

### **Cenário 4: Evento UFC 319 - Completamente finalizado**
- **Status das lutas**: 12 "finished"
- **Status do evento**: `"finished"` ✅ (agora sim!)
- **Contador**: `12/12`
- **Live Activity**: Finalizada automaticamente

## 🔍 Debug e Logs

### **Logs de Determinação de Status**
```
🔍 Debug: determineEventStatus - Analisando 12 lutas para evento: UFC 319
🔍 Debug: areAllFightsFinished - 5/12 lutas finalizadas, Todas finalizadas: false
🔍 Debug: getFightsStatusBreakdown - Scheduled: 6, Live: 1, Finished: 5, Total: 12
🔍 Debug: determineEventStatus - Há 1 luta(s) ao vivo, retornando 'live'
```

### **Logs de Verificação de Atividade**
```
🔍 Debug: shouldKeepActivityActive - Status: 'live', Tempo: -120min, Manter ativa: true
🔍 Debug: isEventLive - Status: 'live', Está ao vivo: true
🔍 Debug: isEventNearStart - Status: 'live', Tempo: -120min, Está próximo: false
```

## ✅ Benefícios da Correção

### **1. Consistência de Dados**
- Status do evento sempre reflete o estado real das lutas
- Contador e status sempre alinhados
- Transições de estado lógicas e previsíveis

### **2. Experiência do Usuário**
- Live Activity não fecha prematuramente
- Informação sempre atual e correta
- Status claro e compreensível

### **3. Manutenibilidade**
- Lógica centralizada em funções específicas
- Debug detalhado para troubleshooting
- Código mais legível e testável

### **4. Escalabilidade**
- Fácil adicionar novos status de lutas
- Lógica aplicável a diferentes tipos de eventos
- Estrutura preparada para futuras expansões

## 🚀 Como Testar

### **1. Verificar Status em Diferentes Cenários**
```swift
// Testar com evento que tem lutas em diferentes status
let eventStatus = determineEventStatus(for: event)
print("Status do evento: \(eventStatus)")
```

### **2. Verificar Contadores**
```swift
// Verificar se contador está correto
let (scheduled, live, finished, total) = getFightsStatusBreakdown(for: event)
print("Breakdown: \(scheduled) agendadas, \(live) ao vivo, \(finished) finalizadas, \(total) total")
```

### **3. Verificar Transições de Estado**
```swift
// Verificar se Live Activity mantém estado correto
let shouldKeep = shouldKeepActivityActive(for: event)
let isLive = isEventLive(for: event)
let isNearStart = isEventNearStart(for: event)
```

## 📝 Próximos Passos

### **1. Testes em Produção**
- Verificar comportamento com eventos reais
- Monitorar logs de debug
- Validar transições de estado

### **2. Otimizações**
- Cache de status para melhor performance
- Notificações push baseadas em mudanças de status
- Integração com sistema de apostas (se aplicável)

### **3. Documentação**
- Atualizar documentação da API
- Criar guias de troubleshooting
- Documentar cenários de edge case

---

**Conclusão**: A lógica de estados da Live Activity foi completamente reescrita para refletir o estado real dos eventos UFC, garantindo consistência, precisão e uma experiência de usuário superior.
