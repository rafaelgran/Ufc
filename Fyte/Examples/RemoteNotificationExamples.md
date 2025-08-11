# Exemplos de Payload para Notificações Remotas

## Estrutura Básica do Payload

```json
{
  "aps": {
    "alert": {
      "title": "Título da Notificação",
      "body": "Corpo da notificação"
    },
    "sound": "default",
    "badge": 1,
    "category": "EVENT_NOTIFICATION"
  },
  "type": "event_start",
  "event_id": "12345",
  "event_name": "UFC 300",
  "custom_data": "valor_personalizado"
}
```

## 1. Notificação de Início de Evento

```json
{
  "aps": {
    "alert": {
      "title": "🥊 UFC Event Starting",
      "body": "UFC 300 is about to begin! Don't miss the main event."
    },
    "sound": "default",
    "badge": 1,
    "category": "EVENT_START"
  },
  "type": "event_start",
  "event_id": "12345",
  "event_name": "UFC 300",
  "main_event": "Jones vs. Stipe",
  "start_time": "2024-12-15T20:00:00Z"
}
```

## 2. Notificação de Lembrete

```json
{
  "aps": {
    "alert": {
      "title": "⏰ UFC Event Reminder",
      "body": "UFC 300 starts in 30 minutes!"
    },
    "sound": "default",
    "badge": 1,
    "category": "EVENT_REMINDER"
  },
  "type": "event_reminder",
  "event_id": "12345",
  "event_name": "UFC 300",
  "minutes_left": 30
}
```

## 3. Notificação de Resultado de Luta

```json
{
  "aps": {
    "alert": {
      "title": "🏆 Fight Result",
      "body": "Jon Jones wins by unanimous decision!"
    },
    "sound": "default",
    "badge": 1,
    "category": "FIGHT_RESULT"
  },
  "type": "fight_result",
  "event_id": "12345",
  "fighter_name": "Jon Jones",
  "result": "Unanimous Decision",
  "opponent": "Stipe Miocic"
}
```

## 4. Notificação Geral

```json
{
  "aps": {
    "alert": {
      "title": "📢 UFC News",
      "body": "New fight announced: McGregor vs. Chandler at UFC 301!"
    },
    "sound": "default",
    "badge": 1,
    "category": "GENERAL"
  },
  "type": "general",
  "message": "New fight announced: McGregor vs. Chandler at UFC 301!",
  "news_id": "67890"
}
```

## 5. Notificação Silenciosa (Background)

```json
{
  "aps": {
    "content-available": 1,
    "badge": 1
  },
  "type": "background_update",
  "event_id": "12345",
  "update_type": "fight_status_change",
  "new_status": "in_progress"
}
```

## Campos Importantes

### APS (Apple Push Notification Service)
- `alert`: Título e corpo da notificação
- `sound`: Som da notificação
- `badge`: Número no ícone do app
- `category`: Categoria para ações personalizadas
- `content-available`: Para notificações silenciosas

### Campos Customizados
- `type`: Tipo da notificação para processamento
- `event_id`: ID do evento relacionado
- `event_name`: Nome do evento
- `custom_data`: Dados adicionais específicos

## Envio via cURL

```bash
curl -v \
  -d '{"aps":{"alert":{"title":"Test","body":"Test notification"},"sound":"default"},"type":"test"}' \
  -H "apns-topic: com.granemanndigital.Fyte" \
  -H "apns-push-type: alert" \
  -H "authorization: bearer YOUR_AUTH_KEY" \
  --http2 \
  https://api.push.apple.com/3/device/DEVICE_TOKEN_HERE
```

## Notas Importantes

1. **Device Token**: Deve ser enviado pelo app para o servidor
2. **Payload Size**: Máximo de 4KB
3. **Sound**: Use "default" ou nome de arquivo .caf
4. **Badge**: Incremente para cada notificação não lida
5. **Category**: Permite ações personalizadas na notificação
