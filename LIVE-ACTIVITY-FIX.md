# 🔧 Correção: Live Activity Fechando Sozinha

## 🐛 **Problema Identificado**

A Live Activity estava fechando automaticamente devido a:

1. **Timer de verificação muito frequente**: O app verificava eventos a cada 30 segundos
2. **Lógica de parada muito agressiva**: Parava Live Activities após apenas 2 horas do evento
3. **Falta de verificação de contexto**: Não verificava se a Live Activity atual era para o evento correto
4. **Ausência de restauração**: Não restaurava Live Activities perdidas

## ✅ **Correções Implementadas**

### **1. Lógica de Parada Melhorada**
```swift
// Antes: Parava após 2 horas
if totalMinutes < -120 {
    await stopCurrentActivity()
}

// Depois: Parada mais inteligente
func stopActivityIfFinished(event: UFCEvent) async {
    // Só parar se a Live Activity atual é para este evento específico
    guard let currentActivity = currentActivity,
          currentActivity.attributes.eventId == event.id else {
        return
    }
    
    // Verificar se ainda deve manter a Live Activity ativa
    if shouldKeepActivityActive(for: event) {
        return
    }
    
    await stopCurrentActivity()
}
```

### **2. Verificação de Contexto**
```swift
func shouldKeepActivityActive(for event: UFCEvent) -> Bool {
    let timeRemaining = event.timeRemaining
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    
    // Manter ativa se:
    // 1. Evento ainda não começou (tempo positivo)
    // 2. Evento está acontecendo agora (entre 0 e -480 minutos = 8 horas)
    // 3. Evento acabou há menos de 8 horas (tempo suficiente para eventos longos)
    return totalMinutes > -480
}

// Verificar se um evento está em andamento (live)
func isEventLive(for event: UFCEvent) -> Bool {
    let timeRemaining = event.timeRemaining
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    
    // Evento está live se já começou mas ainda não passou 8 horas
    return totalMinutes <= 0 && totalMinutes > -480
}

// Verificar se um evento está próximo de começar
func isEventNearStart(for event: UFCEvent) -> Bool {
    let timeRemaining = event.timeRemaining
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    
    // Evento está próximo se começa em até 15 minutos
    return totalMinutes <= 15 && totalMinutes > 0
}
```

### **3. Início Inteligente de Live Activities**
```swift
func startActivityIfNear(event: UFCEvent) async {
    // Se já há uma Live Activity ativa, verificar se é para o mesmo evento
    if let currentActivity = currentActivity {
        if currentActivity.attributes.eventId == event.id {
            return // Já está ativa para este evento
        }
    }
    
    let totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes
    
    // Iniciar 15 minutos antes do evento ou se o evento já começou há menos de 8 horas
    if (totalMinutes <= 15 && totalMinutes > 0) || (totalMinutes <= 0 && totalMinutes > -480) {
        await startEventActivity(for: event)
    }
}
```

### **4. Restauração de Live Activities Perdidas**
```swift
func checkAndRestoreLiveActivities(events: [UFCEvent]) async {
    let activities = Activity<UFCEventLiveActivityAttributes>.activities
    
    if activities.isEmpty {
        // Procurar por eventos que deveriam ter Live Activity ativa
        for event in events {
            if shouldKeepActivityActive(for: event) {
                // Restaurar Live Activity se necessário
                await startEventActivity(for: event)
                break
            }
        }
    } else {
        // Atualizar referência para a Live Activity ativa
        currentActivity = activities.first
        isActivityActive = true
    }
}
```

### **5. Timer de Atualização Melhorado**
```swift
private func startUpdateTimer(for event: UFCEvent) {
    updateTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
        Task { @MainActor in
            // Verificar se a Live Activity ainda deve estar ativa
            if let self = self, let currentActivity = self.currentActivity {
                // Se a Live Activity é para um evento diferente, parar o timer
                if currentActivity.attributes.eventId != event.id {
                    self.updateTimer?.invalidate()
                    return
                }
                
                // Verificar se o evento ainda deve manter a Live Activity ativa
                if !self.shouldKeepActivityActive(for: event) {
                    await self.stopCurrentActivity()
                    return
                }
            }
            
            await self?.updateCountdown(for: event)
        }
    }
}
```

## 🎯 **Benefícios das Correções**

### **1. Estabilidade**
- Live Activities não fecham mais prematuramente
- Verificação de contexto evita paradas desnecessárias
- Restauração automática de Live Activities perdidas
- **Suporte a eventos longos**: Permanece ativa durante todo o evento (até 8 horas)

### **2. Performance**
- Menos verificações desnecessárias
- Timer para apenas quando necessário
- Lógica mais eficiente
- Funções especializadas para diferentes estados do evento

### **3. Experiência do Usuário**
- Live Activities permanecem ativas durante todo o evento
- Transições suaves entre eventos
- Restauração automática se perdidas
- **Cobertura completa**: Desde 15 minutos antes até 8 horas após o início

## 🔍 **Como Testar**

### **1. Teste de Estabilidade**
- Inicie uma Live Activity para um evento
- Deixe o app em background por algumas horas
- Verifique se a Live Activity permanece ativa

### **2. Teste de Restauração**
- Force o fechamento do app
- Abra o app novamente
- Verifique se a Live Activity é restaurada automaticamente

### **3. Teste de Transição**
- Tenha dois eventos próximos
- Verifique se a Live Activity muda corretamente entre eles

## 📱 **Logs de Debug**

Os seguintes logs foram adicionados para facilitar o debug:

```swift
print("🔍 Debug: Keeping Live Activity active for event: \(event.name)")
print("🛑 Stopping Live Activity for finished event: \(event.name)")
print("🔍 Debug: Restoring Live Activity for event: \(event.name)")
print("🔍 Debug: Found existing Live Activity: \(activity.attributes.eventName)")
```

## ⚠️ **Considerações Importantes**

1. **Tempo de Vida**: Live Activities agora permanecem ativas por até 8 horas após o evento (cobrindo eventos longos)
2. **Múltiplas Activities**: O sistema evita múltiplas Live Activities simultâneas
3. **Restauração**: Live Activities perdidas são restauradas automaticamente
4. **Performance**: Verificações mais inteligentes reduzem o uso de recursos
5. **Eventos Longos**: Suporte para eventos que podem durar até 8 horas (como eventos UFC completos)

## 🚀 **Próximos Passos**

1. **Monitoramento**: Acompanhar logs para verificar se as correções resolveram o problema
2. **Otimização**: Ajustar tempos baseado no feedback dos usuários
3. **Testes**: Realizar testes extensivos em diferentes cenários 

## 🎨 **Atualizações da Interface**

### **1. Logo Atualizado**
- **Antes**: "FIGHT TIME CLUB" em Rajdhani Bold 16pt
- **Agora**: "FYTE" em Rajdhani Regular 12pt
- **Cor**: Mantida a cor vermelha (#FF0550)

### **2. Lógica de Lutas Melhorada**
```swift
// Luta de destaque: Sempre a luta com fightOrder 1
private func getHighlightFight(for event: UFCEvent) -> UFCFight? {
    return fights.first { $0.fightOrder == 1 }
}

// Próxima luta: Primeira luta não finalizada por fightOrder
private func getNextFight(for event: UFCEvent, finishedFights: Int) -> UFCFight? {
    let sortedFights = fights.sorted { fight1, fight2 in
        let order1 = fight1.fightOrder ?? Int.max
        let order2 = fight2.fightOrder ?? Int.max
        return order1 < order2
    }
    
    // Encontrar a próxima luta não finalizada
    for fight in sortedFights {
        if !fight.isFinished && fight.status != "live" {
            return fight
        }
    }
    return nil
}
```

### **3. Interface Atualizada**
- **Luta destaque**: Mostra a luta com fightOrder 1 no retângulo central
- **Próxima luta**: Mostra a próxima luta não finalizada baseada em fightOrder
- **Logo simplificado**: "FYTE" em vez de "FIGHT TIME CLUB" 