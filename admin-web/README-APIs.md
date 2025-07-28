# 🥊 APIs UFC - Guia Completo

Este documento lista todas as APIs e fontes de dados disponíveis para obter informações de lutadores UFC.

## 📋 APIs Disponíveis

### 1. **UFC Stats** (Recomendada - Gratuita)
- **URL**: https://www.ufcstats.com/statistics/fighters
- **Tipo**: Web Scraping
- **Dados**: Nome, apelido, record, categoria, vitórias/derrotas/empates
- **Status**: ⚠️ Pode ter bloqueios de acesso
- **Uso**: `node ufc-fighters-scraper.js`

### 2. **SportsData.io** (Paga - Estruturada)
- **URL**: https://api.sportsdata.io/v3/mma/scores/json/Fighters
- **Tipo**: API REST
- **Dados**: Dados completos e estruturados
- **Preço**: $29.99/mês
- **Status**: ✅ Funcional (requer chave de API)

### 3. **Tapology** (Gratuita - Web Scraping)
- **URL**: https://www.tapology.com/fightcenter/fighters
- **Tipo**: Web Scraping
- **Dados**: Nome, record, categoria
- **Status**: ⚠️ Estrutura variável
- **Uso**: `node tapology-scraper.js`

### 4. **Sherdog** (Gratuita - Web Scraping)
- **URL**: https://www.sherdog.com/fighter
- **Tipo**: Web Scraping
- **Dados**: Perfis detalhados de lutadores
- **Status**: ❌ Bloqueia requisições automatizadas

## 🚀 Como Usar

### Opção 1: Dados de Exemplo (Recomendado para Testes)
```bash
# Usar dados de exemplo pré-definidos
node ufc-fighters-scraper.js --sample
```

### Opção 2: Web Scraping UFC Stats
```bash
# Tentar extrair dados do UFC Stats
node ufc-fighters-scraper.js
```

### Opção 3: Web Scraping Tapology
```bash
# Tentar extrair dados do Tapology
node tapology-scraper.js
```

### Opção 4: API SportsData.io (Paga)
```bash
# Configurar chave de API
export SPORTSDATA_API_KEY="sua_chave_aqui"

# Usar API (implementar conforme necessário)
curl "https://api.sportsdata.io/v3/mma/scores/json/Fighters?key=$SPORTSDATA_API_KEY"
```

## 📊 Dados de Exemplo Incluídos

O sistema já inclui 10 lutadores de exemplo com dados reais:

### Middleweight
- **Israel Adesanya** (The Last Stylebender) - 24-3-0 - Ranking #1
- **Dricus Du Plessis** (Stillknocks) - 21-2-0 - Ranking #2

### Light Heavyweight
- **Alex Pereira** (Poatan) - 9-2-0 - Ranking #1
- **Jiri Prochazka** (BJP) - 29-4-1 - Ranking #2

### Bantamweight
- **Sean O'Malley** (Sugar) - 17-1-0 - Ranking #1
- **Merab Dvalishvili** (The Machine) - 16-4-0 - Ranking #2

### Welterweight
- **Leon Edwards** (Rocky) - 22-3-0 - Ranking #1
- **Kamaru Usman** (The Nigerian Nightmare) - 20-4-0 - Ranking #2

### Lightweight
- **Conor McGregor** (The Notorious) - 22-6-0 - Ranking #1
- **Michael Chandler** (Iron) - 23-8-0 - Ranking #2

## 🔧 Endpoints da API

### Lutadores
- `GET /api/fighters` - Listar todos os lutadores
- `GET /api/fighters/:id` - Buscar lutador específico
- `POST /api/fighters` - Criar lutador
- `PUT /api/fighters/:id` - Atualizar lutador
- `DELETE /api/fighters/:id` - Excluir lutador

### Novos Endpoints
- `GET /api/fighters/weight-class/:weightClass` - Lutadores por categoria
- `GET /api/fighters/ranked` - Apenas lutadores com ranking
- `POST /api/fighters/bulk` - Importar lutadores em massa

## 📈 Estrutura do Banco

```sql
CREATE TABLE fighters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nickname TEXT,
    record TEXT,
    weightClass TEXT,
    ranking INTEGER,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    ufcStatsUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Scripts Disponíveis

### 1. `ufc-fighters-scraper.js`
- **Função**: Extrair dados do UFC Stats
- **Uso**: `node ufc-fighters-scraper.js [--sample]`
- **Dados**: Nome, apelido, record, categoria, vitórias/derrotas

### 2. `tapology-scraper.js`
- **Função**: Extrair dados do Tapology
- **Uso**: `node tapology-scraper.js`
- **Dados**: Nome, record, categoria

### 3. `test-scraper.js`
- **Função**: Testar acesso às APIs
- **Uso**: `node test-scraper.js`
- **Resultado**: Relatório de disponibilidade das APIs

## 💡 Recomendações

### Para Desenvolvimento/Testes
```bash
# Usar dados de exemplo (rápido e confiável)
node ufc-fighters-scraper.js --sample
```

### Para Produção
1. **Opção 1**: Usar SportsData.io (API paga, mas confiável)
2. **Opção 2**: Implementar cache dos dados extraídos
3. **Opção 3**: Manter dados de exemplo como fallback

### Para Atualizações Regulares
```bash
# Criar cron job para atualizar dados
0 2 * * 0 node ufc-fighters-scraper.js --sample
```

## 🔒 Considerações Legais

- **UFC Stats**: Dados públicos, mas respeitar rate limits
- **Tapology**: Dados públicos, usar com moderação
- **SportsData.io**: API oficial, requer assinatura
- **Sherdog**: Dados públicos, mas bloqueia scrapers

## 📞 Suporte

Para problemas com as APIs:
1. Verifique a conectividade com a internet
2. Teste com `node test-scraper.js`
3. Use dados de exemplo como fallback
4. Considere usar uma API paga para produção

## 🎯 Próximos Passos

1. **Implementar cache** dos dados extraídos
2. **Adicionar mais fontes** de dados
3. **Criar sistema de atualização** automática
4. **Implementar validação** de dados
5. **Adicionar fotos** dos lutadores 