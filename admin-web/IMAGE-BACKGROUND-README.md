# 🖼️ Imagem de Background para Eventos

## 📋 Visão Geral

Implementamos a funcionalidade de usar imagens dos eventos como background no app iOS. Agora os eventos podem ter uma imagem associada que será exibida como background no destaque do evento na home e na tela de detalhes.

## ✨ Funcionalidades Implementadas

### 1. **Modelo de Dados**
- ✅ Adicionado campo `image` (String?) ao modelo `UFCEvent`
- ✅ Campo suporta URLs de imagens
- ✅ Compatível com a estrutura existente do banco de dados

### 2. **Interface do Usuário**
- ✅ **FeaturedEventView**: Background com imagem do evento na home
- ✅ **EventDetailView**: Background com imagem do evento na tela de detalhes
- ✅ **Fallback**: Gradiente padrão quando não há imagem
- ✅ **Overlay**: Escurecimento automático para melhorar legibilidade do texto

### 3. **Carregamento de Imagens**
- ✅ **AsyncImage**: Carregamento assíncrono de imagens
- ✅ **Placeholder**: Gradiente padrão enquanto carrega
- ✅ **Error Handling**: Fallback para gradiente em caso de erro

## 🎨 Design e UX

### Background com Imagem
```swift
// Exemplo de implementação
if let imageUrl = event.image, !imageUrl.isEmpty {
    AsyncImage(url: URL(string: imageUrl)) { image in
        image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()
            .overlay(
                // Overlay escuro para melhorar legibilidade
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color.black.opacity(0.7),
                        Color.black.opacity(0.3),
                        Color.black.opacity(0.7)
                    ]),
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
    } placeholder: {
        defaultBackgroundGradient
    }
}
```

### Gradiente Padrão
```swift
private var defaultBackgroundGradient: some View {
    LinearGradient(
        gradient: Gradient(colors: [
            Color(red: 0.1, green: 0.1, blue: 0.1),
            Color(red: 0.05, green: 0.05, blue: 0.05)
        ]),
        startPoint: .top,
        endPoint: .bottom
    )
}
```

## 🗄️ Banco de Dados

### Estrutura da Tabela
```sql
-- Coluna adicionada à tabela events
ALTER TABLE events ADD COLUMN IF NOT EXISTS image TEXT;
```

### Exemplo de Dados
```json
{
  "id": 1,
  "name": "UFC FIGHT NIGHT",
  "date": "2025-08-02T22:00:00+00:00",
  "location": "Las Vegas",
  "venue": "UFC APEX",
  "image": "https://example.com/ufc-event-image.jpg"
}
```

## 🛠️ Como Usar

### 1. **Adicionar Imagem a um Evento**

#### Via Script Node.js
```bash
cd admin-web
node test-image-event.js
```

#### Via API Supabase
```javascript
const { data, error } = await supabase
  .from('events')
  .update({ 
    image: 'https://example.com/event-image.jpg' 
  })
  .eq('id', eventId)
  .select();
```

### 2. **Formatos de Imagem Suportados**
- ✅ URLs HTTP/HTTPS
- ✅ Imagens JPG, PNG, WebP
- ✅ Imagens responsivas (recomendado: 800x600 ou maior)

### 3. **Recomendações de Imagem**
- **Resolução**: Mínimo 800x600px
- **Formato**: JPG ou PNG
- **Tamanho**: Máximo 2MB
- **Conteúdo**: Imagens relacionadas ao UFC/MMA
- **Contraste**: Imagens com bom contraste para legibilidade do texto

## 📱 Teste no App

### 1. **Compilar e Executar**
```bash
# No Xcode
Product > Build
Product > Run
```

### 2. **Verificar Funcionalidade**
- ✅ Home: Imagem aparece como background no destaque do evento
- ✅ Detalhes: Imagem aparece como background na tela de detalhes
- ✅ Fallback: Gradiente padrão quando não há imagem
- ✅ Carregamento: Placeholder enquanto carrega a imagem

## 🔧 Scripts Disponíveis

### `add-image-column.js`
Verifica se a coluna `image` existe na tabela `events`.

### `test-image-event.js`
Adiciona uma imagem de exemplo ao primeiro evento encontrado.

## 🎯 Próximos Passos

### Melhorias Futuras
- [ ] **Upload de Imagens**: Interface para upload direto no app
- [ ] **Cache de Imagens**: Cache local para melhor performance
- [ ] **Otimização**: Compressão automática de imagens
- [ ] **CDN**: Integração com CDN para imagens
- [ ] **Fallback Inteligente**: Imagens padrão por categoria de evento

### Integração com Admin Web
- [ ] **Campo de Imagem**: Adicionar campo de URL de imagem no formulário de eventos
- [ ] **Preview**: Preview da imagem no painel admin
- [ ] **Validação**: Validação de URLs de imagem

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. **Imagem não carrega**
- Verificar se a URL é válida
- Verificar se a imagem é acessível publicamente
- Verificar formato da imagem

#### 2. **Performance lenta**
- Otimizar tamanho da imagem
- Usar CDN para imagens
- Implementar cache local

#### 3. **Texto ilegível**
- Ajustar opacidade do overlay
- Usar imagens com melhor contraste
- Implementar detecção automática de contraste

## 📞 Suporte

Para dúvidas ou problemas com a funcionalidade de imagem de background:

1. Verificar logs do console
2. Testar URL da imagem no navegador
3. Verificar estrutura do banco de dados
4. Consultar documentação do AsyncImage

---

**Desenvolvido por**: Rafael Granemann  
**Data**: Julho 2025  
**Versão**: 1.0.0 