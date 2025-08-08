# 📋 Instruções para Executar os Lotes no Supabase

## 🎯 Arquivos Prontos

Você tem **9 arquivos** divididos igualmente:
- `part_1.sql` até `part_9.sql`
- Cada arquivo contém aproximadamente **47 países** com seus SVGs

## 🚀 Como Executar

### **Passo 1: Acessar o Supabase**
1. Vá para o seu projeto no Supabase
2. Clique em **"SQL Editor"** no menu lateral
3. Clique em **"New query"**

### **Passo 2: Executar os Lotes**
1. **Abra o arquivo `part_1.sql`**
2. **Copie todo o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Supabase (Ctrl+V)
4. **Clique em "Run"** para executar
5. **Aguarde a execução** (pode demorar alguns segundos)
6. **Repita para `part_2.sql`, `part_3.sql`, etc.**

### **Passo 3: Verificar Progresso**
Após cada lote, execute esta query para verificar:
```sql
SELECT 
    COUNT(*) as total_countries,
    COUNT(flag_svg) as countries_with_svg,
    COUNT(*) - COUNT(flag_svg) as countries_without_svg
FROM countries;
```

## 📊 Ordem de Execução

**Execute nesta ordem:**
1. ✅ `part_1.sql` - Países A-C
2. ✅ `part_2.sql` - Países D-F  
3. ✅ `part_3.sql` - Países G-I
4. ✅ `part_4.sql` - Países J-L
5. ✅ `part_5.sql` - Países M-O
6. ✅ `part_6.sql` - Países P-R
7. ✅ `part_7.sql` - Países S-U
8. ✅ `part_8.sql` - Países V-X
9. ✅ `part_9.sql` - Países Y-Z

## ⚠️ Dicas Importantes

### **Se der erro de timeout:**
- Execute um lote por vez
- Aguarde alguns segundos entre os lotes
- Se um lote falhar, tente novamente

### **Se der erro de sintaxe:**
- Verifique se copiou o arquivo completo
- Certifique-se de que não cortou nenhum comando

### **Para verificar se funcionou:**
```sql
-- Ver países com SVG
SELECT name, flag_code FROM countries 
WHERE flag_svg IS NOT NULL 
ORDER BY name;

-- Ver países sem SVG
SELECT name, flag_code FROM countries 
WHERE flag_svg IS NULL 
ORDER BY name;
```

## 🎉 Resultado Final

Após executar todos os 9 lotes, você terá:
- ✅ **421 países** com bandeiras SVG
- ✅ **Tabela completa** pronta para uso
- ✅ **Bandeiras de alta qualidade** para o app

## 🔧 Troubleshooting

### **Erro: "Connection timeout"**
- Execute menos comandos por vez
- Divida o lote em partes menores

### **Erro: "Syntax error"**
- Verifique se o arquivo foi copiado completamente
- Certifique-se de que não há caracteres especiais

### **Erro: "Flag code not found"**
- Alguns códigos podem não existir na tabela
- Isso é normal, continue com os próximos lotes

## 📞 Suporte

Se encontrar problemas:
1. Verifique se a tabela `countries` foi criada
2. Confirme se executou o script `create_countries_table.sql` primeiro
3. Teste com um lote menor se necessário

**Boa sorte! 🚀** 