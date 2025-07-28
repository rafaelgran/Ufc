const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuração Rápida do MongoDB Atlas');
console.log('=====================================\n');

console.log('1. Acesse: https://cloud.mongodb.com');
console.log('2. Crie uma conta gratuita');
console.log('3. Crie um cluster M0 (gratuito)');
console.log('4. Configure Network Access: Allow from Anywhere (0.0.0.0/0)');
console.log('5. Crie um usuário em Database Access');
console.log('6. Clique em "Connect" → "Connect your application"');
console.log('7. Copie a string de conexão\n');

rl.question('Cole sua string de conexão do MongoDB Atlas: ', (connectionString) => {
  const envContent = `# MongoDB Configuration
MONGODB_URI=${connectionString}

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,capacitor://localhost,ionic://localhost
`;

  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Arquivo .env criado com sucesso!');
  console.log('🎯 Agora você pode rodar: npm start');
  rl.close();
}); 