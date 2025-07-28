const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debugConnection() {
  console.log('=== DEBUG CONNECTION ===');
  
  const uri = process.env.MONGODB_URI;
  console.log('URI encontrada:', uri ? 'SIM' : 'NAO');
  
  if (uri) {
    // Extrair informações da URI
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):(^@]+)@([^\/]+)\/([^?]+)/);
    if (match) {
      const [, username, password, host, database] = match;
      console.log('Username:', username);
      console.log('Password length:', password.length);
      console.log('Host:', host);
      console.log('Database:', database);
    }
  }
  
  console.log('\nTentando conectar...');
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log('SUCESSO: Conectado!');
    
    const db = client.db('ufc_events');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await client.close();
    
  } catch (error) {
    console.log('ERRO:', error.message);
    console.log('Código:', error.code);
    console.log('Stack:', error.stack);
  }
}

debugConnection(); 