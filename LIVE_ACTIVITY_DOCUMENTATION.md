# 📱 Live Activity Documentation - Fyte App

## 🎯 Visão Geral

A **Live Activity** é uma funcionalidade iOS que permite exibir informações em tempo real na tela de bloqueio e na Dynamic Island. No app Fyte, ela é usada para mostrar o status de eventos de UFC, incluindo lutas ao vivo, contagem regressiva e informações dos lutadores.

## 🏗️ Arquitetura

### Componentes Principais

1. **`LiveActivityService.swift`** - Serviço principal que gerencia todo o ciclo de vida
2. **`Widget_Its_TimeLiveActivity.swift`** - Interface SwiftUI da Live Activity
3. **`UFCEventLiveActivityAttributes.swift`** - Definição dos atributos e estados
4. **`ActivityKit`** - Framework iOS para gerenciar Live Activities

### Fluxo de Funcionamento

```
App Inicia → Verifica Eventos → Determina Status → Inicia/Atualiza Live Activity
    ↓
Timer (1s) → Debounce (5s) → Atualiza Dados → Atualiza UI
    ↓
Evento Termina → Para Timer → Finaliza Live Activity
```

## 🔧 Funcionalidades Implementadas

### 1. Estados do Evento
- **`starting`** - Evento ainda não começou
- **`live`** - Evento está acontecendo (há luta ao vivo)
- **`finished`** - Evento terminou (todas as lutas finalizadas)

### 2. Detecção de Luta ao Vivo
- Monitora lutas com `status == "live"`
- Atualiza automaticamente quando uma luta termina
- Transição suave entre lutas

### 3. Sistema de Debounce
- **Timer**: Executa a cada 1 segundo
- **Debounce**: Só processa a cada 5 segundos
- **Objetivo**: Evitar múltiplas chamadas simultâneas e payload muito grande

### 4. Otimização de SVG
- **Problema**: SVGs das bandeiras muito grandes (1372+ chars)
- **Solução**: Otimização agressiva para SVGs > 500 chars
- **Resultado**: Reduz de 1372 para ~50 chars (90%+ redução)

## 📊 Estrutura de Dados

### UFCEventLiveActivityAttributes.ContentState

```swift
struct ContentState: Codable {
    // Informações básicas
    var timeRemaining: String
    var eventStatus: String
    var currentFight: String
    var finishedFights: Int
    var totalFights: Int
    
    // Luta atual
    var fighter1LastName: String
    var fighter2LastName: String
    var fighter1Ranking: String?
    var fighter2Ranking: String?
    var fighter1Country: String?
    var fighter2Country: String?
    var fighter1Record: String?
    var fighter2Record: String?
    var currentFightWeightClass: String?
    
    // Próxima luta
    var nextFighter1LastName: String
    var nextFighter2LastName: String
    
    // Luta principal (main event)
    var mainEventFighter1LastName: String
    var mainEventFighter2LastName: String
    var mainEventFighter1Ranking: String?
    var mainEventFighter2Ranking: String?
    var mainEventFighter1Country: String?
    var mainEventFighter2Country: String?
    var mainEventWeightClass: String?
    
    // Bandeiras (SVGs otimizados)
    var mainEventFighter1FlagSvg: String?
    var mainEventFighter2FlagSvg: String?
    var liveFightFighter1FlagSvg: String?
    var liveFightFighter2FlagSvg: String?
    
    // Informações da luta
    var roundStartTime: String?
    var totalRounds: Int?
}
```

## 🚀 Funções Principais

### 1. `startEventActivity(for event: UFCEvent)`
- **Função**: Inicia uma nova Live Activity
- **Quando**: Evento próximo de começar ou já ao vivo
- **Dados**: Popula todos os campos com informações do evento

### 2. `updateToLiveStatus(currentFight: String?, event: UFCEvent?)`
- **Função**: Atualiza Live Activity para status "live"
- **Quando**: Luta ao vivo detectada
- **Dados**: Atualiza informações da luta atual

### 3. `updateCountdown(for event: UFCEvent)`
- **Função**: Atualiza contagem regressiva e status
- **Quando**: Timer executa (com debounce de 5s)
- **Dados**: Atualiza tempo restante e verifica mudanças

### 4. `determineEventStatus(for event: UFCEvent) -> String`
- **Função**: Determina o status atual do evento
- **Lógica**: 
  - Se há luta `live` → retorna `"live"`
  - Se todas as lutas `finished` → retorna `"finished"`
  - Caso contrário → retorna `"starting"`

### 5. `shouldKeepActivityActive(for event: UFCEvent) -> Bool`
- **Função**: Decide se a Live Activity deve permanecer ativa
- **Critérios**:
  - Status `"live"` → sempre ativa
  - Status `"starting"` + próximo do início → ativa
  - Status `"finished"` → nunca ativa

## 🔍 Sistema de Debug

### Logs Implementados
- **Eventos**: Status, lutas, tempos
- **SVG**: Tamanho antes/depois da otimização
- **Timer**: Execução e debounce
- **Dados**: Nomes dos lutadores, status das lutas

### Exemplo de Log
```
🔍 Debug: SVG muito grande (1372 chars), otimizando agressivamente...
🔍 Debug: SVG otimizado de 1372 para 52 chars
🔍 Debug: updateCountdown debounced, aguardando 5.0 segundos
```

## ⚠️ Problemas Comuns e Soluções

### 1. "Payload maximum size exceeded"
- **Causa**: Dados muito grandes (especialmente SVGs)
- **Solução**: Otimização automática de SVGs > 500 chars
- **Prevenção**: Debounce de 5 segundos

### 2. Live Activity não aparece
- **Verificar**: 
  - Live Activities habilitadas no sistema
  - Evento tem status correto
  - `shouldKeepActivityActive` retorna `true`
- **Logs**: Verificar `determineEventStatus` e `getDisplayFight`

### 3. Dados mockup aparecendo
- **Causa**: Campos vazios ou dados de preview
- **Solução**: `updateCountdown` detecta e busca dados reais
- **Prevenção**: Validação automática de nomes vazios

### 4. Múltiplas chamadas simultâneas
- **Causa**: Timer executando sem controle
- **Solução**: Debounce implementado (5 segundos)
- **Prevenção**: `lastUpdateTime` controla frequência

## 🎨 Interface da Live Activity

### Widget_Its_TimeLiveActivity.swift
- **Preview**: Dados mockup para Xcode (não afetam produção)
- **Layout**: Adaptativo para diferentes tamanhos
- **Estados**: `starting`, `live`, `finished`

### Elementos Visuais
- **Bandeiras**: SVGs otimizados dos países
- **Nomes**: Sobrenomes dos lutadores
- **Status**: Indicador visual do estado do evento
- **Contadores**: Lutas finalizadas e total

## 🔧 Manutenção e Troubleshooting

### Verificar Funcionamento
1. **Logs**: Procurar por erros ou warnings
2. **Status**: Verificar se `eventStatus` está correto
3. **Dados**: Confirmar se nomes não estão vazios
4. **Timer**: Verificar se debounce está funcionando

### Modificações Seguras
1. **Nunca remover** campos existentes sem substituir
2. **Sempre testar** compilação antes de executar
3. **Manter logs** para debug futuro
4. **Respeitar** o sistema de debounce

### Performance
- **SVGs**: Sempre otimizar se > 500 chars
- **Timer**: Manter debounce de 5 segundos
- **Dados**: Evitar campos desnecessários
- **Updates**: Minimizar chamadas para `updateCompat`

## 📱 Testes

### Cenários de Teste
1. **Evento novo**: Deve iniciar Live Activity
2. **Luta ao vivo**: Deve mostrar informações corretas
3. **Transição**: Deve trocar entre lutas suavemente
4. **Finalização**: Deve parar quando evento terminar
5. **Payload**: Deve estar sempre abaixo de 4.096 bytes

### Como Testar
1. Executar no simulador
2. Verificar logs no console
3. Testar diferentes estados do evento
4. Monitorar tamanho do payload
5. Verificar transições de estado

## 🚀 Futuras Melhorias

### Possíveis Otimizações
- **Cache**: Implementar cache local para dados estáticos
- **Compressão**: Comprimir dados antes de enviar
- **Lazy Loading**: Carregar dados sob demanda
- **Background Updates**: Atualizações em background

### Novas Funcionalidades
- **Notificações**: Push notifications para mudanças
- **Estatísticas**: Mais informações sobre lutas
- **Personalização**: Temas e layouts customizáveis
- **Integração**: Sincronização com outros apps

## 📚 Recursos Técnicos

### Frameworks Utilizados
- **ActivityKit**: Gerenciamento de Live Activities
- **SwiftUI**: Interface da Live Activity
- **WidgetKit**: Sistema de widgets
- **Foundation**: Gerenciamento de dados

### Limitações do Sistema
- **Payload**: Máximo 4.096 bytes
- **Tempo**: Live Activity expira automaticamente
- **Memória**: Recursos limitados em background
- **Updates**: Frequência controlada pelo sistema

### Boas Práticas
- **Sempre otimizar** dados grandes
- **Implementar debounce** para operações frequentes
- **Manter logs** detalhados
- **Testar** em diferentes cenários
- **Respeitar** limitações do sistema

---

## 📝 Notas de Desenvolvimento

### Última Atualização
- **Data**: 15/08/2025
- **Versão**: 1.0
- **Status**: ✅ Funcionando perfeitamente

### Problemas Resolvidos
1. ✅ Lógica de estados do evento corrigida
2. ✅ Dados mockup removidos
3. ✅ Múltiplas chamadas simultâneas resolvidas
4. ✅ Payload size otimizado
5. ✅ Debounce implementado

### Desenvolvedor
- **Assistente**: Claude Sonnet 4
- **Método**: Análise incremental e correções focadas
- **Princípio**: "Não estragar o que já funciona"

---

*Esta documentação deve ser atualizada sempre que houver mudanças significativas na implementação da Live Activity.*
