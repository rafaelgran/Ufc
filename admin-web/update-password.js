const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Atualizar Senha do MongoDB Atlas');
console.log('==================================\n');

rl.question('Digite a senha do seu usuário MongoDB Atlas: ', (password) => {
  const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://rafaelgranemann:${password}@cluster0.dwmmt89.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,capacitor://localhost,ionic://localhost
`;

  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Senha atualizada com sucesso!');
  console.log('🎯 Agora você pode rodar: npm start');
  rl.close();
}); 