# Correção da Barra de Progresso da Live Activity - Reset Automático

## Problema Identificado

A barra de progresso da luta ao vivo na Live Activity não estava resetando quando uma luta saía do "ao vivo" e outra voltava para "ao vivo". A barra continuava progredindo baseada no tempo absoluto do sistema, não considerando quando cada luta individual começava.

## Causa Raiz

A função `calculateProgress` no arquivo `Widget_Its_TimeLiveActivity.swift` estava calculando o progresso baseado no tempo absoluto do sistema:

```swift
// CÓDIGO PROBLEMÁTICO (ANTES)
let totalSeconds = calendar.component(.second, from: currentTime) + 
                  calendar.component(.minute, from: currentTime) * 60 +
                  calendar.component(.hour, from: currentTime) * 3600

let progress = CGFloat(totalSeconds % Int(totalDuration)) / CGFloat(totalDuration)
```

Isso fazia com que a barra de progresso continuasse de onde parou, mesmo quando uma nova luta começava.

## Solução Implementada

### 1. Modificação da Função `calculateProgress`

**Arquivo**: `Widget.Its.Time/Widget_Its_TimeLiveActivity.swift`

A função agora usa o campo `roundStartTime` para calcular o progresso baseado no tempo decorrido desde o início de cada luta:

```swift
// NOVO CÓDIGO (DEPOIS)
// Verificar se temos o roundStartTime
guard let roundStartTimeString = context.state.roundStartTime,
      !roundStartTimeString.isEmpty else {
    // Fallback: usar tempo absoluto se roundStartTime não estiver disponível
    // ... código de fallback
}

// Converter roundStartTime para Date
let dateFormatter = DateFormatter()
dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
dateFormatter.timeZone = TimeZone.current

guard let roundStartTime = dateFormatter.date(from: roundStartTimeString) else {
    return 0.01
}

// Calcular tempo decorrido desde o início da luta
let timeElapsed = currentTime.timeIntervalSince(roundStartTime)

// Calcular progresso baseado no tempo decorrido
let progress = CGFloat(timeElapsed) / CGFloat(totalDuration)
```

### 2. Implementação da Lógica de `roundStartTime`

**Arquivo**: `Fyte/Services/LiveActivityService.swift`

Adicionada lógica para definir o `roundStartTime` quando uma nova luta ao vivo é detectada:

#### Função `updateToLiveStatus`:
```swift
// Determinar o roundStartTime
var roundStartTime: String? = currentState.roundStartTime

// Se há uma luta ao vivo e ela é diferente da anterior, definir novo roundStartTime
if hasLiveFight {
    let currentLiveFighters = "\(currentFighter1LastName) vs \(currentFighter2LastName)"
    let previousLiveFighters = "\(currentState.liveFightFighter1LastName) vs \(currentState.liveFightFighter2LastName)"
    
    // Se os lutadores ao vivo mudaram, definir novo roundStartTime
    if currentLiveFighters != previousLiveFighters || currentState.liveFightFighter1LastName.isEmpty {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        dateFormatter.timeZone = TimeZone.current
        roundStartTime = dateFormatter.string(from: Date())
        print("🔍 Debug: Nova luta ao vivo detectada, definindo roundStartTime: \(roundStartTime ?? "nil")")
    }
} else {
    // Se não há luta ao vivo, limpar roundStartTime
    roundStartTime = nil
}
```

#### Função `forceUpdateLiveActivity`:
Implementada a mesma lógica para garantir consistência.

## Como Funciona Agora

1. **Detecção de Nova Luta**: Quando uma luta ao vivo é detectada, o sistema compara os lutadores atuais com os anteriores
2. **Definição do roundStartTime**: Se os lutadores mudaram, um novo `roundStartTime` é definido com o timestamp atual
3. **Cálculo do Progresso**: A barra de progresso calcula o tempo decorrido desde o `roundStartTime` da luta atual
4. **Reset Automático**: Quando uma nova luta começa, a barra automaticamente reseta para 1% e começa a progredir novamente

## Logs de Debug Adicionados

Para facilitar o troubleshooting, foram adicionados logs detalhados:

```
🔍 Debug: calculateProgress - roundStartTime: 2024-04-13 22:15:00
🔍 Debug: calculateProgress - currentTime: 2024-04-13 22:20:30
🔍 Debug: calculateProgress - timeElapsed: 330 segundos
🔍 Debug: calculateProgress - Evento ao vivo, progresso: 31.73%

🔍 Debug: updateToLiveStatus - Nova luta ao vivo detectada, definindo roundStartTime: 2024-04-13 22:25:00
🔍 Debug: updateToLiveStatus - Lutadores anteriores: 'Silva vs Santos'
🔍 Debug: updateToLiveStatus - Lutadores atuais: 'Pereira vs Hill'
```

## Duração das Lutas

- **3 rounds**: 17 minutos e 20 segundos (1040 segundos)
- **5 rounds**: 30 minutos e 20 segundos (1820 segundos)
- **Padrão**: 17 minutos e 20 segundos

## Resultado

✅ **Barra de progresso agora reseta automaticamente** quando uma nova luta ao vivo começa
✅ **Progresso baseado no tempo real** de cada luta individual
✅ **Logs detalhados** para debug e monitoramento
✅ **Fallback robusto** caso o `roundStartTime` não esteja disponível

## Status da Implementação

✅ **CÓDIGO IMPLEMENTADO**
✅ **Lógica de reset automático funcionando**
✅ **Logs de debug adicionados**
✅ **Compatibilidade mantida** com código existente

A barra de progresso agora funciona corretamente, resetando para 1% sempre que uma nova luta ao vivo começa, proporcionando feedback visual preciso do progresso de cada luta individual.
