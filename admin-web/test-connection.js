const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  console.log('Testando conexao com MongoDB Atlas...');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ERRO: MONGODB_URI nao encontrada no arquivo .env');
    return;
  }
  
  console.log('String de conexao encontrada');
  console.log('Tentando conectar...');
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('SUCESSO: Conexao estabelecida!');
    console.log('Database: MongoDB Atlas');
    
    const db = client.db('ufc_events');
    const collections = await db.listCollections().toArray();
    console.log(`Collections encontradas: ${collections.length}`);
    
    await client.close();
    console.log('Teste concluido com sucesso!');
    
  } catch (error) {
    console.log('ERRO na conexao:');
    console.log(error.message);
    console.log('Possiveis solucoes:');
    console.log('1. Verifique se o MongoDB Atlas esta liberado para qualquer IP (0.0.0.0/0)');
    console.log('2. Confirme se o usuario e senha estao corretos');
    console.log('3. Verifique se o cluster esta ativo');
  }
}

testConnection(); 