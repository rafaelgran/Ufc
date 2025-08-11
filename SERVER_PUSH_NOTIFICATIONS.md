# SERVER PUSH NOTIFICATIONS - FYTE APP

## Como implementar no servidor

### 1. Estrutura da Push Notification

```json
{
  "aps": {
    "alert": {
      "title": "🎯 UFC 319 is LIVE!",
      "body": "UFC 319 - Dricus Du Plessis vs Khamzat Chimaev (Middleweight) is live! Join live now!"
    },
    "sound": "default",
    "badge": 1
  },
  "type": "event_start",
  "event_id": 25,
  "event_name": "UFC 319",
  "main_event": "Dricus Du Plessis vs Khamzat Chimaev (Middleweight)"
}
```

### 2. Tipos de Notificação

#### Event Start (event_start)
- **Quando**: Exatamente na hora do evento
- **Payload**: 
  ```json
  {
    "type": "event_start",
    "event_id": 25,
    "event_name": "UFC 319",
    "main_event": "Dricus Du Plessis vs Khamzat Chimaev (Middleweight)"
  }
  ```

#### Event Reminder (event_reminder)
- **Quando**: 15 minutos antes do evento
- **Payload**:
  ```json
  {
    "type": "event_reminder",
    "event_id": 25,
    "event_name": "UFC 319",
    "main_event": "Dricus Du Plessis vs Khamzat Chimaev (Middleweight)",
    "minutes_left": 15
  }
  ```

### 3. Implementação no Servidor

#### 3.1 Agendar Push Notifications

```python
# Exemplo em Python
import schedule
import time
from datetime import datetime, timedelta

def send_event_start_notification(event):
    """Envia push notification quando evento começa"""
    payload = {
        "aps": {
            "alert": {
                "title": f"🎯 {event.name} is LIVE!",
                "body": f"{event.name} - {event.main_event} is live! Join live now!"
            },
            "sound": "default",
            "badge": 1
        },
        "type": "event_start",
        "event_id": event.id,
        "event_name": event.name,
        "main_event": event.main_event
    }
    
    # Enviar para todos os dispositivos registrados
    send_push_to_all_devices(payload)

def schedule_event_notifications(event):
    """Agenda notificações para um evento"""
    event_time = parse_event_time(event.date)
    
    # Notificação de lembrete (15 min antes)
    reminder_time = event_time - timedelta(minutes=15)
    schedule.every().day.at(reminder_time.strftime("%H:%M")).do(
        send_event_reminder_notification, event
    )
    
    # Notificação de início (hora exata)
    schedule.every().day.at(event_time.strftime("%H:%M")).do(
        send_event_start_notification, event
    )

# Executar agendador
while True:
    schedule.run_pending()
    time.sleep(60)  # Verificar a cada minuto
```

#### 3.2 Enviar Push via APNs

```python
import requests

def send_push_to_all_devices(payload):
    """Envia push para todos os dispositivos registrados"""
    
    # Headers para APNs
    headers = {
        "apns-topic": "com.granemanndigital.Fyte",
        "apns-push-type": "alert",
        "Content-Type": "application/json"
    }
    
    # Para cada device token registrado
    for device_token in get_all_device_tokens():
        apns_url = f"https://api.push.apple.com/3/device/{device_token}"
        
        response = requests.post(
            apns_url,
            json=payload,
            headers=headers,
            cert=("path/to/cert.pem", "path/to/key.pem")
        )
        
        if response.status_code == 200:
            print(f"✅ Push sent to device {device_token}")
        else:
            print(f"❌ Failed to send push: {response.status_code}")
```

### 4. Vantagens desta Abordagem

✅ **Funciona sempre** - Mesmo com app fechado
✅ **Horário preciso** - Servidor controla timing exato
✅ **Sem dependência** - Do app estar aberto
✅ **Flexível** - Pode enviar qualquer tipo de notificação
✅ **Escalável** - Funciona para milhares de usuários

### 5. Configuração Necessária

1. **APNs Certificate** - Para autenticar com Apple
2. **Device Tokens** - Armazenar tokens de todos os usuários
3. **Agendador** - Para enviar no horário correto
4. **Database** - Para armazenar eventos e horários

### 6. Teste

Para testar, envie uma push notification com payload de teste:

```bash
curl -v \
  -d '{"aps":{"alert":{"title":"Test","body":"Test notification"},"sound":"default"},"type":"event_start","event_id":999,"event_name":"TEST"}' \
  -H "apns-topic: com.granemanndigital.Fyte" \
  -H "apns-push-type: alert" \
  -H "Content-Type: application/json" \
  --http2 \
  --cert /path/to/cert.pem \
  --key /path/to/key.pem \
  https://api.push.apple.com/3/device/{DEVICE_TOKEN}
```

## Resumo

Com esta implementação, o servidor será responsável por enviar push notifications no horário exato dos eventos, garantindo que os usuários recebam as notificações mesmo que o app não esteja aberto ou não saiba das mudanças no banco de dados.
