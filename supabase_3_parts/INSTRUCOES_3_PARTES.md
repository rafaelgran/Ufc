# 📋 INSTRUÇÕES PARA EXECUTAR OS SVGs NO SUPABASE

## 🎯 Arquivos Divididos em 3 Partes

Você tem **3 arquivos SQL** para executar no Supabase SQL Editor:

### 📁 Arquivos Disponíveis:
- `part_1.sql` (~33KB) - Primeiros 140 países
- `part_2.sql` (~30KB) - Próximos 140 países  
- `part_3.sql` (~32KB) - Últimos 141 países

## 🚀 Como Executar:

### 1️⃣ **Execute part_1.sql primeiro**
1. Abra o Supabase Dashboard
2. Vá para **SQL Editor**
3. Clique em **"New query"**
4. Cole o conteúdo do arquivo `part_1.sql`
5. Clique em **"Run"**
6. Aguarde a execução completar

### 2️⃣ **Execute part_2.sql**
1. Clique em **"New query"** novamente
2. Cole o conteúdo do arquivo `part_2.sql`
3. Clique em **"Run"**
4. Aguarde a execução completar

### 3️⃣ **Execute part_3.sql**
1. Clique em **"New query"** novamente
2. Cole o conteúdo do arquivo `part_3.sql`
3. Clique em **"Run"**
4. Aguarde a execução completar

## ✅ Verificação:

Após executar os 3 arquivos, verifique se funcionou:

```sql
-- Verificar quantos países têm SVG
SELECT COUNT(*) as total_com_svg FROM countries WHERE flag_svg IS NOT NULL;

-- Verificar alguns exemplos
SELECT name, flag_code, LENGTH(flag_svg) as svg_size 
FROM countries 
WHERE flag_svg IS NOT NULL 
LIMIT 5;
```

## ⚠️ Importante:
- Execute na **ordem correta** (part_1, part_2, part_3)
- Aguarde cada execução completar antes da próxima
- Se houver erro, verifique se a tabela `countries` existe

## 🎉 Resultado Esperado:
- **421 países** com SVGs carregados
- **0 países** sem SVG (se já existiam antes)

---
**📊 Total: 421 países divididos em 3 partes** 