# 🥊 Sistema de Controle de Live Activities e Resultados

Este sistema permite controlar lutas ao vivo e registrar resultados no admin da UFC. Ele foi projetado para alimentar futuras live activities no app iOS.

## 🚀 Funcionalidades

### Controle ao Vivo
- **Iniciar/Parar Luta ao Vivo**: Controle quando uma luta está sendo transmitida
- **Controle de Rounds**: Play/Pause para cada round individual
- **Timer de Round**: Contador regressivo de 5 minutos por round
- **Navegação entre Rounds**: Avançar para o próximo round

### Resultados das Lutas
- **Tipos de Vitória**: DE (Decisão), KO, TKO, SUB, Draw, DQ, NC
- **Round Final**: Seleção do round onde a luta terminou
- **Tempo Final**: Tempo exato do round final (formato MM:SS)
- **Vencedor**: Seleção do lutador vencedor

## 📋 Pré-requisitos

1. **Banco de Dados**: Execute as migrações para adicionar as novas colunas
2. **Servidor**: Certifique-se de que o servidor está rodando
3. **Dados**: Tenha eventos e lutas cadastrados no sistema

## 🗄️ Migrações do Banco de Dados

### Opção 1: Script Automático
```bash
cd admin-web
node execute-migrations.js
```

### Opção 2: SQL Manual
Execute o arquivo `add-fight-control-columns.sql` no Supabase SQL Editor.

## 🎮 Como Usar

### 1. Acessar o Controle da Luta
1. Vá para a aba "Eventos"
2. Selecione um evento
3. Na lista de lutas, clique no botão azul com ícone de gamepad (🎮)
4. O modal de controle da luta será aberto

### 2. Controle ao Vivo

#### Iniciar Luta ao Vivo
1. No modal, clique em "Iniciar ao Vivo"
2. A luta será marcada como ao vivo
3. Os controles de round aparecerão

#### Controlar Rounds
- **Play (▶️)**: Inicia o round com timer de 5 minutos
- **Pause (⏸️)**: Pausa o round atual
- **Next Round (⏭️)**: Avança para o próximo round

#### Timer de Round
- O timer mostra o tempo restante do round atual
- Atualiza em tempo real
- Para automaticamente quando chega a 00:00

### 3. Registrar Resultado

#### Preencher Formulário
1. **Tipo de Vitória**: Selecione o tipo de resultado
   - DE: Decisão dos Juízes (desabilita seleção de round)
   - KO: Nocaute
   - TKO: Nocaute Técnico
   - SUB: Finalização
   - Draw: Empate
   - DQ: Desqualificação
   - NC: No Contest

2. **Round Final**: Selecione em qual round a luta terminou
   - Para DE, automaticamente seleciona o último round

3. **Tempo Final**: Selecione o tempo exato do round final
   - Formato MM:SS (ex: 02:30)

4. **Vencedor**: Selecione o lutador vencedor
   - Lista apenas os lutadores da luta

#### Salvar Resultado
1. Clique em "Salvar Resultado"
2. O sistema validará os dados
3. A luta será marcada como finalizada
4. O modal será fechado automaticamente

## 🔧 API Endpoints

### Controle ao Vivo
- `POST /api/fights/:id/start-live` - Iniciar luta ao vivo
- `POST /api/fights/:id/stop-live` - Parar luta ao vivo
- `POST /api/fights/:id/control-round` - Controlar round
- `GET /api/fights/:id/round-time` - Obter tempo restante do round

### Resultados
- `POST /api/fights/:id/save-result` - Salvar resultado da luta
- `GET /api/fights/live` - Obter lutas ao vivo
- `GET /api/fights/finished` - Obter lutas finalizadas

## 📊 Estrutura do Banco de Dados

### Novas Colunas na Tabela `fights`

#### Controle ao Vivo
- `is_live` (BOOLEAN): Indica se a luta está ao vivo
- `current_round` (INTEGER): Round atual (1-5)
- `round_start_time` (TIMESTAMP): Horário de início do round
- `round_end_time` (TIMESTAMP): Horário de fim do round
- `round_duration` (INTEGER): Duração do round em segundos (padrão: 300)
- `round_status` (VARCHAR): Status do round ('running', 'paused', 'stopped')

#### Resultados
- `result_type` (VARCHAR): Tipo de resultado ('DE', 'KO', 'TKO', 'SUB', 'Draw', 'DQ', 'NC')
- `final_round` (INTEGER): Round final da luta
- `final_time` (VARCHAR): Tempo final (formato 'MM:SS')
- `winner_id` (INTEGER): ID do lutador vencedor (FK para fighters)
- `is_finished` (BOOLEAN): Indica se a luta foi finalizada
- `result_updated_at` (TIMESTAMP): Data/hora da última atualização

## 🎯 Validações

### Controle ao Vivo
- Apenas uma luta pode estar ao vivo por vez
- Timer só funciona quando round_status = 'running'
- Round atual deve estar entre 1 e o número máximo de rounds

### Resultados
- Todos os campos são obrigatórios
- Para DE (Decisão), o round final deve ser o último round
- Vencedor deve ser um dos lutadores da luta
- Tipo de resultado deve estar na lista permitida

## 🔄 Sincronização em Tempo Real

O sistema usa Socket.IO para sincronização em tempo real:
- Atualizações de status são transmitidas para todos os clientes
- Timer é sincronizado entre diferentes sessões
- Mudanças são refletidas imediatamente

## 🚨 Troubleshooting

### Problemas Comuns

1. **Timer não atualiza**
   - Verifique se a luta está marcada como ao vivo
   - Confirme se o round_status é 'running'

2. **Erro ao salvar resultado**
   - Verifique se todos os campos estão preenchidos
   - Para DE, confirme que o round final é o último

3. **Controles de round não aparecem**
   - Certifique-se de que a luta foi iniciada ao vivo
   - Verifique se há lutas cadastradas no evento

### Logs
- Verifique o console do navegador para erros JavaScript
- Monitore os logs do servidor para erros de API
- Use o DevTools para inspecionar requisições

## 🔮 Próximos Passos

Este sistema foi projetado para integrar com:
- **Live Activities iOS**: Notificações em tempo real
- **Widgets**: Exibição de lutas ao vivo
- **Push Notifications**: Alertas de resultados
- **Analytics**: Estatísticas de lutas

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Consulte os logs do sistema
3. Teste com dados de exemplo
4. Entre em contato com a equipe de desenvolvimento 