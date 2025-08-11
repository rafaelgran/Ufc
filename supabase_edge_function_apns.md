# EDGE FUNCTION COM APNs IMPLEMENTADO

## Código Atualizado para schedule-event-notifications

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configurações APNs
const APNS_HOST = 'api.push.apple.com' // Produção
// const APNS_HOST = 'api.sandbox.push.apple.com' // Sandbox (desenvolvimento)

const APNS_TOPIC = 'com.granemanndigital.Fyte' // Bundle ID do seu app

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event_id, event_name, event_date } = await req.json()
    
    console.log("🎯 Event notification received:", { event_id, event_name, event_date })
    
    // Enviar push notification para todos os dispositivos registrados
    const result = await sendPushNotificationToAllDevices({
      type: "event_start",
      event_id,
      event_name,
      event_date
    })
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent for event: ${event_name}`,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error("❌ Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Função para enviar push para todos os dispositivos
async function sendPushNotificationToAllDevices(payload: any) {
  try {
    // Buscar todos os device tokens do banco
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const response = await fetch(`${supabaseUrl}/rest/v1/device_tokens?select=device_token`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch device tokens: ${response.status}`)
    }
    
    const deviceTokens = await response.json()
    console.log(`📱 Found ${deviceTokens.length} device tokens`)
    
    // Enviar push para cada dispositivo
    const results = []
    for (const device of deviceTokens) {
      try {
        const result = await sendPushToDevice(device.device_token, payload)
        results.push({ device_token: device.device_token, success: true, result })
      } catch (error) {
        console.error(`❌ Failed to send to device ${device.device_token}:`, error)
        results.push({ device_token: device.device_token, success: false, error: error.message })
      }
    }
    
    return {
      total_devices: deviceTokens.length,
      results
    }
    
  } catch (error) {
    console.error("❌ Error sending to all devices:", error)
    throw error
  }
}

// Função para enviar push para um dispositivo específico
async function sendPushToDevice(deviceToken: string, payload: any) {
  const apnsPayload = {
    aps: {
      alert: {
        title: `🎯 ${payload.event_name} is LIVE!`,
        body: `${payload.event_name} is live! Join live now!`
      },
      sound: "default",
      badge: 1,
      "content-available": 1
    },
    type: payload.type,
    event_id: payload.event_id,
    event_name: payload.event_name,
    event_date: payload.event_date
  }
  
  const headers = {
    'apns-topic': APNS_TOPIC,
    'apns-push-type': 'alert',
    'apns-priority': '10',
    'Content-Type': 'application/json'
  }
  
  const url = `https://${APNS_HOST}/3/device/${deviceToken}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(apnsPayload)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`APNs error: ${response.status} - ${errorText}`)
  }
  
  return { status: response.status, headers: Object.fromEntries(response.headers) }
}
```

## Como Implementar

1. **Copie o código acima**
2. **Vá na Edge Function** `schedule-event-notifications`
3. **Substitua todo o código** pelo código acima
4. **Clique em "Deploy"**

## Configurações Necessárias

### 1. Service Role Key
- Vá em **Settings > API**
- Copie a **service_role** key (não a anon key)
- Adicione como variável de ambiente na Edge Function

### 2. Bundle ID
- Verifique se `com.granemanndigital.Fyte` está correto
- Deve ser o mesmo do seu app iOS

### 3. APNs Environment
- **Sandbox**: Para desenvolvimento (comentado no código)
- **Production**: Para produção (ativo no código)

## Próximos Passos

1. ✅ **Implementar Edge Function** (código acima)
2. ✅ **Configurar Service Role Key**
3. ✅ **Testar envio de push**
4. ✅ **Integrar com app iOS**
