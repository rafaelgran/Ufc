# 🚀 Configuração do Admin com Supabase

Este guia explica como configurar o admin para usar o Supabase como banco de dados.

## 📋 Pré-requisitos

- ✅ Node.js 18+ instalado
- ✅ Conta no Supabase configurada
- ✅ Tabelas criadas no Supabase (events, fighters, fights)
- ✅ Permissões configuradas no Supabase

## 🔧 Configuração Rápida

### 1. Instalar Dependências

```bash
cd admin-web
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp env.example .env
```

Edite o arquivo `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://igxztpjrojdmyzzhqxsv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ

# Database Selection
DATABASE_TYPE=supabase

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,capacitor://localhost,ionic://localhost
```

### 3. Testar Conexão

```bash
node test-supabase-connection.js
```

### 4. Executar o Admin

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🗄️ Estrutura das Tabelas no Supabase

### Tabela: events
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    venue TEXT,
    mainEvent TEXT,
    status TEXT DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: fighters
```sql
CREATE TABLE fighters (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    nickname TEXT,
    record TEXT,
    weightClass TEXT,
    ranking INTEGER,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    ufcStatsUrl TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: fights
```sql
CREATE TABLE fights (
    id SERIAL PRIMARY KEY,
    eventId INTEGER REFERENCES events(id),
    fighter1Id INTEGER REFERENCES fighters(id),
    fighter2Id INTEGER REFERENCES fighters(id),
    weightClass TEXT,
    fightType TEXT DEFAULT 'main',
    rounds INTEGER DEFAULT 3,
    timeRemaining INTEGER DEFAULT 300,
    status TEXT DEFAULT 'scheduled',
    winnerId INTEGER REFERENCES fighters(id),
    fightOrder INTEGER DEFAULT 0,
    isChampionship BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Configuração de Permissões

Execute o SQL do arquivo `supabase_permissions.sql` no SQL Editor do Supabase:

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE fighters DISABLE ROW LEVEL SECURITY;
ALTER TABLE fights DISABLE ROW LEVEL SECURITY;
```

## 🧪 Testes

### Teste de Conexão
```bash
node test-supabase-connection.js
```

### Teste Manual
1. Acesse http://localhost:3000
2. Vá para a aba "Eventos"
3. Tente criar um evento de teste
4. Verifique se aparece na lista

## 🔄 Migração de Dados

Se você tem dados no SQLite local e quer migrar para o Supabase:

1. **Exportar dados do SQLite:**
```bash
node export-sqlite-data.js
```

2. **Importar para o Supabase:**
```bash
node import-to-supabase.js
```

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Configurar variáveis de ambiente no Vercel:**
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `DATABASE_TYPE=supabase`

### Opção 2: Netlify

1. **Build:**
```bash
npm run build
```

2. **Deploy via Netlify CLI ou interface web**

## 🔧 Troubleshooting

### Erro: "Invalid API key"
- Verifique se a `SUPABASE_ANON_KEY` está correta
- Confirme se a chave tem permissões de leitura/escrita

### Erro: "Table does not exist"
- Execute o SQL de criação das tabelas no Supabase
- Verifique se os nomes das tabelas estão corretos

### Erro: "Permission denied"
- Execute o SQL de permissões no Supabase
- Verifique se o RLS está desabilitado ou as políticas estão corretas

### Erro: "Connection timeout"
- Verifique se a `SUPABASE_URL` está correta
- Teste a conectividade de rede

## 📊 Monitoramento

### Logs do Supabase
- Acesse o dashboard do Supabase
- Vá para "Logs" para ver as queries executadas

### Logs do Admin
- Os logs aparecem no terminal onde o servidor está rodando
- Use `console.log()` para debug

## 🔄 Backup e Restore

### Backup
```bash
node backup-supabase-data.js
```

### Restore
```bash
node restore-supabase-data.js
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do terminal
2. Teste a conexão com `test-supabase-connection.js`
3. Verifique as permissões no Supabase
4. Consulte a documentação do Supabase

## 🎯 Próximos Passos

1. ✅ Configurar Supabase
2. ✅ Testar conexão
3. ✅ Migrar dados (se necessário)
4. ✅ Testar funcionalidades do admin
5. ✅ Fazer deploy (opcional)
6. ✅ Configurar monitoramento 