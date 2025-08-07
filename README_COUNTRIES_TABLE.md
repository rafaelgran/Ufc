# 📋 Scripts para Tabela de Países com Bandeiras SVG

Este conjunto de scripts cria uma tabela no Supabase com todos os países e suas bandeiras SVG.

## 📁 Arquivos

- `create_countries_table.sql` - Script principal para criar a tabela
- `load_flag_svgs.sql` - Funções para gerenciar SVGs
- `load_svg_flags.py` - Script Python para carregar SVGs automaticamente
- `README_COUNTRIES_TABLE.md` - Esta documentação

## 🚀 Como usar

### 1. Criar a tabela no Supabase

1. Acesse o **SQL Editor** do seu projeto Supabase
2. Execute o script `create_countries_table.sql`
3. Verifique se a tabela foi criada: `SELECT COUNT(*) FROM countries;`

### 2. Carregar funções SQL

1. Execute o script `load_flag_svgs.sql` no SQL Editor
2. Teste as funções:
   ```sql
   -- Listar países sem SVG
   SELECT * FROM get_countries_without_svg();
   
   -- Contar países
   SELECT COUNT(*) FROM countries;
   ```

### 3. Carregar SVGs automaticamente (Opcional)

**Pré-requisitos:**
```bash
pip install supabase python-dotenv
```

**Configuração:**
1. Crie um arquivo `.env` na raiz do projeto:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   ```

2. Execute o script Python:
   ```bash
   python load_svg_flags.py
   ```

## 📊 Estrutura da Tabela

```sql
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,      -- Nome do país
    flag_code VARCHAR(20) NOT NULL UNIQUE,  -- Código da bandeira (ex: us, br)
    flag_svg TEXT,                          -- Conteúdo SVG da bandeira
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## 🌍 Países Incluídos

### América do Norte
- Estados Unidos, Canadá, México

### América do Sul
- Brasil, Argentina, Chile, Colômbia, Peru, Venezuela, etc.

### Europa
- Inglaterra, França, Alemanha, Itália, Espanha, Portugal, etc.

### Ásia
- China, Japão, Coreia do Sul, Índia, Tailândia, etc.

### África
- África do Sul, Nigéria, Gana, Marrocos, Egito, etc.

### Oceania
- Austrália, Nova Zelândia, Papua Nova Guiné, etc.

### Caribe e América Central
- Cuba, Jamaica, Haiti, República Dominicana, etc.

## 🔧 Funções Úteis

### SQL Functions

```sql
-- Atualizar SVG de uma bandeira
SELECT update_flag_svg('us', '<svg>...</svg>');

-- Buscar SVG de uma bandeira
SELECT get_flag_svg('br');

-- Listar países sem SVG
SELECT * FROM get_countries_without_svg();
```

### Queries Úteis

```sql
-- Buscar países por região
SELECT name, flag_code FROM countries 
WHERE name IN ('Brazil', 'Argentina', 'Chile', 'Uruguay');

-- Contar países com/sem SVG
SELECT 
    COUNT(*) as total,
    COUNT(flag_svg) as com_svg,
    COUNT(*) - COUNT(flag_svg) as sem_svg
FROM countries;

-- Buscar bandeiras do Reino Unido
SELECT name, flag_code FROM countries 
WHERE flag_code LIKE 'gb-%';
```

## 🎯 Casos de Uso

### 1. Integração com o App iOS
```swift
// Buscar bandeira por código
let flagCode = "br"
let svgContent = supabase.from("countries")
    .select("flag_svg")
    .eq("flag_code", flagCode)
    .single()
```

### 2. API REST
```javascript
// Buscar todos os países
const countries = await supabase
    .from('countries')
    .select('name, flag_code, flag_svg')
    .order('name');
```

### 3. Filtros por Região
```sql
-- Países da América do Sul
SELECT name, flag_code FROM countries 
WHERE name IN (
    'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 
    'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay'
);
```

## 🔍 Troubleshooting

### Erro: "Flag code not found"
- Verifique se o código da bandeira existe na tabela
- Use: `SELECT * FROM countries WHERE flag_code = 'seu_codigo';`

### Erro: "Connection failed"
- Verifique as credenciais do Supabase no `.env`
- Confirme se a URL e Service Role Key estão corretos

### SVGs não carregando
- Verifique se os arquivos SVG existem em `Fyte/Assets.xcassets/flags/`
- Confirme se os nomes dos arquivos correspondem aos `flag_code`

## 📈 Próximos Passos

1. **Integrar com o app iOS** - Usar a tabela para buscar bandeiras
2. **Criar API endpoints** - Para buscar países por região
3. **Adicionar mais países** - Se necessário
4. **Otimizar performance** - Índices e cache

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do script Python
2. Teste as queries SQL diretamente no Supabase
3. Confirme se a estrutura da tabela está correta 