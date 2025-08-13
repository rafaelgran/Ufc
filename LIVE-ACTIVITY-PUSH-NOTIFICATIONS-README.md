# Live Activity Push Notifications - Sistema de Acordar Live Activities

## Visão Geral

Este sistema permite que as Live Activities sejam "acordadas" através de notificações push remotas enviadas pelo servidor, mesmo quando o app está em background ou fechado.

## Como Funciona

### 1. Configuração da Live Activity

Quando uma Live Activity é iniciada:

```swift
let activity = try Activity.request(
    attributes: UFCEventLiveActivityAttributes(...),
    content: ActivityContent(state: initialState, staleDate: nil),
    pushType: .token // ✅ Habilita notificações push
)
```

- **`pushType: .token`**: Habilita o sistema de notificações push para esta Live Activity
- O iOS gera automaticamente um push token único para esta Live Activity
- Este token é enviado para o servidor para permitir o envio de notificações

### 2. Registro do Push Token

Após a criação da Live Activity:

```swift
// Aguardar 1 segundo para o push token estar disponível
try await Task.sleep(nanoseconds: 1_000_000_000)

// Enviar push token para o servidor
await sendLiveActivityPushTokenToServer()
```

O push token é enviado para a Edge Function `register-live-activity` com:
- `live_activity_push_token`: Token único da Live Activity
- `event_id`: ID do evento
- `event_name`: Nome do evento
- `platform`: "iOS"
- `token_type`: "live_activity"

### 3. Notificação Push do Servidor

O servidor pode enviar uma notificação push com:

```json
{
  "type": "wake_live_activity",
  "event_id": 123,
  "event_name": "UFC 300",
  "message": "Evento começando em 5 minutos!"
}
```

### 4. Processamento da Notificação

#### App em Foreground
```swift
func handleServerPushNotification(_ userInfo: [AnyHashable: Any]) {
    if let type = userInfo["type"] as? String {
        switch type {
        case "wake_live_activity":
            handleWakeLiveActivityNotification(userInfo)
        // ... outros tipos
        }
    }
}
```

#### App em Background
```swift
func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    if let type = userInfo["type"] as? String,
       type == "wake_live_activity" {
        Task {
            await LiveActivityService.shared.handlePushNotificationForLiveActivity(userInfo)
            completionHandler(.newData)
        }
    }
}
```

### 5. Acordar a Live Activity

```swift
func handlePushNotificationForLiveActivity(_ userInfo: [AnyHashable: Any]) async {
    guard let type = userInfo["type"] as? String,
          type == "wake_live_activity" else { return }
    
    guard let eventId = userInfo["event_id"] as? Int,
          let eventName = userInfo["event_name"] as? String else { return }
    
    // Verificar se já há uma Live Activity ativa
    if let currentActivity = currentActivity,
       currentActivity.attributes.eventId == eventId {
        // Atualizar Live Activity existente
        if let event = await fetchEventFromServer(eventId: eventId) {
            await forceUpdateLiveActivity(event: event)
        }
        return
    }
    
    // Buscar dados do evento e iniciar nova Live Activity
    if let event = await fetchEventFromServer(eventId: eventId) {
        await startEventActivity(for: event)
    }
}
```

## Fluxo Completo

```
1. App inicia Live Activity
   ↓
2. iOS gera push token único
   ↓
3. App envia token para servidor
   ↓
4. Servidor armazena token + evento
   ↓
5. Servidor envia notificação push
   ↓
6. iOS recebe notificação
   ↓
7. App processa notificação
   ↓
8. Live Activity é acordada/atualizada
```

## Casos de Uso

### 1. Lembrete de Evento
- **Quando**: 15 minutos antes do evento
- **Ação**: Acordar Live Activity e mostrar countdown
- **Payload**: `{"type": "wake_live_activity", "event_id": 123}`

### 2. Início do Evento
- **Quando**: Exatamente no horário do evento
- **Ação**: Atualizar Live Activity para status "LIVE"
- **Payload**: `{"type": "wake_live_activity", "event_id": 123}`

### 3. Atualizações em Tempo Real
- **Quando**: Durante o evento (resultados, mudanças de luta)
- **Ação**: Atualizar Live Activity com informações mais recentes
- **Payload**: `{"type": "wake_live_activity", "event_id": 123}`

## Vantagens

✅ **Eficiência de Bateria**: Live Activity só é ativa quando necessário
✅ **Atualizações em Tempo Real**: Dados sempre atualizados via servidor
✅ **Funciona em Background**: App pode estar fechado
✅ **Escalabilidade**: Servidor controla quando acordar Live Activities
✅ **Flexibilidade**: Diferentes tipos de notificação para diferentes ações

## Configuração do Servidor

### Edge Function: `register-live-activity`

```typescript
// Recebe e armazena push tokens das Live Activities
export default async function handler(req: Request) {
  const { live_activity_push_token, event_id, event_name } = await req.json()
  
  // Armazenar no banco de dados
  await supabase
    .from('live_activity_tokens')
    .upsert({
      token: live_activity_push_token,
      event_id,
      event_name,
      platform: 'iOS',
      created_at: new Date()
    })
}
```

### Edge Function: `send-live-activity-notification`

```typescript
// Envia notificação push para acordar Live Activity
export default async function handler(req: Request) {
  const { event_id, type, message } = await req.json()
  
  // Buscar push token da Live Activity
  const { data: tokenData } = await supabase
    .from('live_activity_tokens')
    .select('token')
    .eq('event_id', event_id)
    .single()
  
  if (tokenData?.token) {
    // Enviar notificação push via APNs
    await sendPushNotification(tokenData.token, {
      type: 'wake_live_activity',
      event_id,
      message
    })
  }
}
```

## Testando

### 1. Iniciar Live Activity
```swift
// No app
await LiveActivityService.shared.startEventActivity(for: event)
```

### 2. Verificar Push Token
```swift
// Logs devem mostrar:
// 🔔 Live Activity push token: [TOKEN]
// ✅ Live Activity push token registered successfully with server
```

### 3. Enviar Notificação de Teste
```bash
# Via curl ou Postman
curl -X POST "https://igxztpjrojdmyzzhqxsv.supabase.co/functions/v1/send-live-activity-notification" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [JWT]" \
  -d '{"event_id": 123, "type": "wake_live_activity", "message": "Teste"}'
```

### 4. Verificar Logs
```
🔔 Wake Live Activity notification received
🎯 Wake Live Activity notification for event: UFC 300 (ID: 123)
📱 Starting Live Activity from push notification for event: UFC 300
```

## Troubleshooting

### Push Token não disponível
- **Sintoma**: "Live Activity push token not available yet"
- **Solução**: Aguardar 1-2 segundos após criar Live Activity

### Live Activity não acorda
- **Verificar**: Logs de notificação push
- **Verificar**: Push token registrado no servidor
- **Verificar**: Permissões de notificação

### Erro de autorização
- **Verificar**: JWT válido no servidor
- **Verificar**: Headers de autorização corretos

## Próximos Passos

1. **Implementar Edge Functions** no Supabase
2. **Criar tabela** para armazenar push tokens
3. **Testar** com notificações reais
4. **Monitorar** logs e performance
5. **Implementar** diferentes tipos de notificação
