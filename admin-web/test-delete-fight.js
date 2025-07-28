const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeleteFight() {
    console.log('🗑️ Testando exclusão de lutas...\n');
    
    try {
        // 1. Buscar lutas existentes
        console.log('1️⃣ Buscando lutas existentes...');
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .order('id', { ascending: false })
            .limit(3);
        
        if (fightsError) {
            console.log('❌ Erro ao buscar lutas:', fightsError);
            return;
        }
        
        console.log(`✅ ${fights.length} lutas encontradas`);
        
        if (fights.length === 0) {
            console.log('❌ Nenhuma luta para testar exclusão');
            return;
        }
        
        // 2. Mostrar lutas antes da exclusão
        console.log('\n2️⃣ Lutas antes da exclusão:');
        fights.forEach(fight => {
            console.log(`   - Luta ${fight.id}: Evento ${fight.eventid}, Lutadores ${fight.fighter1id} vs ${fight.fighter2id}`);
        });
        
        // 3. Testar exclusão da primeira luta
        const fightToDelete = fights[0];
        console.log(`\n3️⃣ Testando exclusão da luta ${fightToDelete.id}...`);
        
        const { error: deleteError } = await supabase
            .from('fights')
            .delete()
            .eq('id', fightToDelete.id);
        
        if (deleteError) {
            console.log('❌ Erro ao excluir luta:', deleteError);
            return;
        }
        
        console.log('✅ Luta excluída com sucesso!');
        
        // 4. Verificar se a luta foi realmente excluída
        console.log('\n4️⃣ Verificando se a luta foi excluída...');
        const { data: remainingFights, error: checkError } = await supabase
            .from('fights')
            .select('*')
            .eq('id', fightToDelete.id);
        
        if (checkError) {
            console.log('❌ Erro ao verificar exclusão:', checkError);
            return;
        }
        
        if (remainingFights.length === 0) {
            console.log('✅ Confirmação: Luta foi excluída do banco de dados');
        } else {
            console.log('❌ Erro: Luta ainda existe no banco de dados');
        }
        
        // 5. Testar via API HTTP
        console.log('\n5️⃣ Testando exclusão via API HTTP...');
        const http = require('http');
        
        function makeHttpRequest(method, endpoint, data = null) {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'localhost',
                    port: 3000,
                    path: `/api/${endpoint}`,
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };
                
                const req = http.request(options, (res) => {
                    let responseData = '';
                    
                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });
                    
                    res.on('end', () => {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: responseData
                        });
                    });
                });
                
                req.on('error', (error) => {
                    reject(error);
                });
                
                if (data) {
                    req.write(JSON.stringify(data));
                }
                
                req.end();
            });
        }
        
        // Buscar uma luta para testar via API
        const { data: testFights } = await supabase
            .from('fights')
            .select('*')
            .limit(1);
        
        if (testFights.length > 0) {
            const testFightId = testFights[0].id;
            console.log(`   Testando DELETE /api/fights/${testFightId}`);
            
            try {
                const response = await makeHttpRequest('DELETE', `fights/${testFightId}`);
                console.log(`   Status: ${response.statusCode}`);
                console.log(`   Headers:`, response.headers);
                console.log(`   Data: "${response.data}"`);
                
                if (response.statusCode === 204) {
                    console.log('   ✅ API DELETE funcionando corretamente');
                } else {
                    console.log('   ❌ API DELETE retornou status inesperado');
                }
            } catch (error) {
                console.log('   ❌ Erro na requisição HTTP:', error.message);
            }
        }
        
        console.log('\n🎉 Teste de exclusão de lutas concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testDeleteFight(); 