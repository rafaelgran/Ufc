# 🔧 Troubleshooting da Live Activity

## 🐛 **Problema: Nomes dos Lutadores Não Aparecem**

### **Sintomas:**
- Live Activity mostra "vs is live!" em vez dos nomes dos lutadores
- Nomes dos lutadores aparecem vazios ou incorretos
- Luta de destaque não é exibida

### **🔍 Logs de Debug Adicionados**

#### **1. Logs na Função `extractLastName`**
```swift
print("🔍 Debug: extractLastName called with: '\(fullName)'")
print("🔍 Debug: nameParts count: \(nameParts.count), parts: \(nameParts)")
print("🔍 Debug: extracted lastName: '\(lastName)'")
```

#### **2. Logs na Função `getHighlightFight`**
```swift
print("🔍 Debug: Looking for highlight fight (fightOrder 1) in \(fights.count) fights")
print("🔍 Debug: Fight \(fight.fighter1.name) vs \(fight.fighter2.name) - fightOrder: \(fight.fightOrder ?? -1)")
print("🔍 Debug: Found highlight fight: \(highlightFight.fighter1.name) vs \(highlightFight.fighter2.name)")
```

#### **3. Logs na Função `startEventActivity`**
```swift
print("🔍 Debug: Initial state created:")
print("🔍 Debug: - fighter1LastName: '\(initialState.fighter1LastName)'")
print("🔍 Debug: - fighter2LastName: '\(initialState.fighter2LastName)'")
```

#### **4. Logs na Interface da Live Activity**
```swift
print("🔍 Debug: Live Activity UI - Starting status")
print("🔍 Debug: - fighter1LastName: '\(context.state.fighter1LastName)'")
print("🔍 Debug: - fighter2LastName: '\(context.state.fighter2LastName)'")
```

### **🧪 Como Testar**

#### **1. Botão de Teste**
- Use o botão laranja (chave inglesa) no header
- Este botão cria uma Live Activity com dados fixos
- Verifique se os nomes aparecem corretamente

#### **2. Verificar Logs**
1. Abra o console do Xcode
2. Procure por logs "🔍 Debug:"
3. Verifique se os dados estão sendo passados corretamente

#### **3. Verificar Dados do Evento**
```swift
// No console, procure por:
🔍 Debug: Looking for highlight fight (fightOrder 1) in X fights
🔍 Debug: Fight [Nome] vs [Nome] - fightOrder: [Número]
🔍 Debug: Found highlight fight: [Nome] vs [Nome]
```

### **🔧 Possíveis Causas**

#### **1. Dados Vazios**
- Evento sem lutas
- Lutas sem nomes de lutadores
- fightOrder não definido

#### **2. Problema na Extração de Nomes**
- Função `extractLastName` não funcionando
- Nomes com formato inesperado

#### **3. Problema na Interface**
- Dados não chegando à interface
- Problema de binding

### **✅ Soluções**

#### **1. Verificar Dados do Evento**
```swift
// Adicione este log no startEventActivity
print("🔍 Debug: Event fights count: \(event.fights?.count ?? 0)")
for (index, fight) in (event.fights ?? []).enumerated() {
    print("🔍 Debug: Fight \(index): \(fight.fighter1.name) vs \(fight.fighter2.name) - fightOrder: \(fight.fightOrder ?? -1)")
}
```

#### **2. Forçar Valores de Teste**
```swift
// Use a função testLiveActivity() que tem valores fixos
await liveActivityService.testLiveActivity()
```

#### **3. Verificar Permissões**
```swift
// Verifique se Live Activities estão habilitadas
let authInfo = ActivityAuthorizationInfo()
print("🔍 Debug: Activities enabled: \(authInfo.areActivitiesEnabled)")
```

### **📋 Checklist de Verificação**

- [ ] Evento tem lutas cadastradas
- [ ] Lutadores têm nomes válidos
- [ ] fightOrder está definido corretamente
- [ ] Live Activities estão habilitadas
- [ ] Logs mostram dados corretos
- [ ] Interface recebe os dados
- [ ] Teste com dados fixos funciona

### **🚨 Comandos de Debug**

#### **1. Teste Rápido**
```swift
// No console do Xcode, execute:
await LiveActivityService.shared.testLiveActivity()
```

#### **2. Verificar Estado Atual**
```swift
// Verificar se há Live Activity ativa
let activities = Activity<UFCEventLiveActivityAttributes>.activities
print("🔍 Debug: Active activities: \(activities.count)")
```

#### **3. Forçar Atualização**
```swift
// Forçar atualização da Live Activity
if let activity = LiveActivityService.shared.currentActivity {
    await activity.update(using: newState)
}
```

### **📞 Próximos Passos**

1. **Execute o teste**: Use o botão laranja para testar
2. **Verifique logs**: Procure por erros no console
3. **Compare dados**: Verifique se os dados estão corretos
4. **Reporte resultado**: Informe o que os logs mostram 