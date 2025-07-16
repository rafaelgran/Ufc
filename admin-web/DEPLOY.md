# Deploy do Admin Web UFC

## Opções de Deploy

### 1. Vercel (Recomendado)

#### Pré-requisitos:
- Conta no [Vercel](https://vercel.com)
- Conta no [Vercel Postgres](https://vercel.com/storage/postgres) ou [Neon](https://neon.tech)

#### Passos:

1. **Criar banco PostgreSQL:**
   - Vercel Postgres: Dashboard → Storage → Create Database
   - Neon: Criar projeto e copiar connection string

2. **Deploy no Vercel:**
   ```bash
   # Instalar Vercel CLI
   npm i -g vercel
   
   # Fazer login
   vercel login
   
   # Deploy
   vercel
   ```

3. **Configurar variáveis de ambiente:**
   - Vercel Dashboard → Project Settings → Environment Variables
   - Adicionar:
     ```
     DATABASE_URL=sua_connection_string_postgres
     USE_SQLITE=false
     NODE_ENV=production
     ALLOWED_ORIGINS=https://seu-dominio.vercel.app,capacitor://localhost,ionic://localhost
     ```

### 2. Railway

#### Passos:
1. Conectar repositório GitHub no Railway
2. Adicionar PostgreSQL addon
3. Configurar variáveis de ambiente
4. Deploy automático

### 3. Heroku

#### Passos:
1. Criar app no Heroku
2. Adicionar PostgreSQL addon
3. Configurar variáveis de ambiente
4. Deploy via Git

## Configuração do App iOS

Após o deploy, atualizar a URL no app iOS:

```swift
// Em UFCEventService.swift
private let baseURL = "https://seu-dominio.vercel.app"
```

## Testando o Deploy

1. **Verificar API:**
   ```bash
   curl https://seu-dominio.vercel.app/api/events
   ```

2. **Acessar Admin:**
   - Abrir: `https://seu-dominio.vercel.app`
   - Criar eventos, lutadores e lutas

3. **Testar App iOS:**
   - Atualizar URL no código
   - Build e testar no simulador/dispositivo

## Troubleshooting

### Erro de CORS:
- Verificar `ALLOWED_ORIGINS` nas variáveis de ambiente
- Incluir domínio do app iOS

### Erro de Database:
- Verificar `DATABASE_URL` está correta
- Confirmar SSL settings para produção

### App não conecta:
- Verificar URL no `UFCEventService.swift`
- Confirmar CORS está configurado
- Testar API endpoint diretamente 