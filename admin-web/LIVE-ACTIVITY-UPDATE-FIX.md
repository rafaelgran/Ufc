# Live Activity Update Fix

## Problema Identificado

A Live Activity não estava atualizando automaticamente quando o status das lutas mudava no banco de dados. Especificamente:

- ✅ **Lógica correta**: A função `getNextFight` estava funcionando perfeitamente
- ❌ **Live Activity não atualiza**: A Live Activity não detectava mudanças no banco automaticamente
- 🔍 **Cenário**: Luta 12 ao vivo → Live Activity ainda mostrava luta 12 como próxima (deveria ser luta 11)

## Solução Implementada

### 1. Nova Função `forceUpdateLiveActivity`

**Arquivo**: `Fyte/Services/LiveActivityService.swift`

```swift
func forceUpdateLiveActivity(event: UFCEvent) async {
    guard let activity = currentActivity else { 
        print("🔍 Debug: No active Live Activity to update")
        return 
    }
    
    print("🔍 Debug: Force updating Live Activity for event: \(event.name)")
    
    // Recalcular a próxima luta com dados atualizados
    let nextFight = getNextFight(for: event, finishedFights: 0)
    let highlightFight = getHighlightFight(for: event)
    
    // ... resto da implementação
}
```

**Funcionalidade**:
- Recalcula a próxima luta com dados mais recentes
- Força a atualização da Live Activity
- Adiciona logs de debug para troubleshooting

### 2. Nova Função `updateLiveActivityIfNeeded`

**Arquivo**: `Fyte/Services/UFCEventService.swift`

```swift
private func updateLiveActivityIfNeeded(with events: [UFCEvent]) async {
    let liveActivityService = LiveActivityService.shared
    
    // Verificar se há uma Live Activity ativa
    if liveActivityService.isActivityActive, let currentActivity = liveActivityService.currentActivity {
        let activeEventId = currentActivity.attributes.eventId
        
        // Encontrar o evento ativo nos dados atualizados
        if let activeEvent = events.first(where: { $0.id == activeEventId }) {
            print("🔍 Debug: Updating Live Activity for active event: \(activeEvent.name)")
            await liveActivityService.forceUpdateLiveActivity(event: activeEvent)
        }
    }
}
```

**Funcionalidade**:
- Detecta quando há uma Live Activity ativa
- Chama a atualização forçada automaticamente
- Executa sempre que `fetchEvents()` é chamado

### 3. Nova Função `refreshDataAndUpdateLiveActivity`

**Arquivo**: `Fyte/Services/UFCEventService.swift`

```swift
func refreshDataAndUpdateLiveActivity() async {
    print("🔄 Forcing data refresh and Live Activity update...")
    await fetchEvents()
}
```

**Funcionalidade**:
- Permite forçar um refresh manual dos dados
- Atualiza a Live Activity automaticamente
- Pode ser chamada pelo usuário quando necessário

### 4. Integração Automática

**Arquivo**: `Fyte/Services/UFCEventService.swift` - função `fetchEvents()`

```swift
func fetchEvents() async {
    // ... código existente ...
    
    do {
        let fetchedEvents = try await fetchEventsFromSupabase()
        await MainActor.run {
            self.events = fetchedEvents
            self.isLoading = false
        }
        
        // Atualizar Live Activity se houver uma ativa
        await updateLiveActivityIfNeeded(with: fetchedEvents)
        
    } catch {
        // ... tratamento de erro ...
    }
}
```

## Como Funciona

### Atualização Automática
1. App iOS busca dados do banco (`fetchEvents`)
2. Se há uma Live Activity ativa, atualiza automaticamente
3. Live Activity mostra dados mais recentes

### Atualização Manual
1. Usuário chama `refreshDataAndUpdateLiveActivity()`
2. Dados são recarregados do banco
3. Live Activity é atualizada com dados mais recentes

## Correções de Compilação

### Import Necessário
```swift
import ActivityKit // Adicionado para LiveActivityService
```

### Estrutura de Dados
- Todas as funções são `async` e usam `await` corretamente
- Integração com `@MainActor` para atualizações de UI
- Tratamento de erros adequado

## Testes Implementados

### 1. `test-live-activity-update.js`
- Verifica se a lógica está funcionando corretamente
- Simula cenário com luta 12 ao vivo
- Confirma que próxima luta deveria ser 11

### 2. `test-live-activity-force-update.js`
- Simula a função `forceUpdateLiveActivity`
- Mostra o fluxo completo de atualização
- Documenta como testar no app iOS

## Resultado Esperado

### Antes da Correção
- Live Activity mostra luta 12 como próxima
- Não atualiza quando luta 12 fica ao vivo

### Depois da Correção
- Live Activity atualiza automaticamente
- Mostra luta 11 como próxima quando luta 12 fica ao vivo
- Logs de debug para troubleshooting

## Como Testar

### No App iOS
1. Abra o app iOS
2. Se houver uma Live Activity ativa, ela deve mostrar a luta 12 como próxima
3. No FYTE Admin, coloque a luta 12 ao vivo
4. No app iOS, force um refresh dos dados (pull to refresh ou similar)
5. A Live Activity deve atualizar e mostrar a luta 11 como próxima

### Verificação
- ✅ Lógica decrescente funcionando
- ✅ Atualização automática implementada
- ✅ Logs de debug adicionados
- ✅ Tratamento de erros adequado
- ✅ Compilação sem erros

## Próximos Passos

1. **Testar no dispositivo real**: Verificar se a atualização funciona no app iOS
2. **Adicionar botão de refresh**: Implementar UI para forçar atualização manual
3. **Otimizar performance**: Considerar cache local para reduzir chamadas ao banco
4. **Monitoramento**: Adicionar métricas para acompanhar atualizações da Live Activity 