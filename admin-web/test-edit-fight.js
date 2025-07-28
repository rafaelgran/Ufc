const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEditFight() {
    console.log('✏️ Testando edição de lutas...\n');
    
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
            console.log('❌ Nenhuma luta para testar edição');
            return;
        }
        
        // 2. Mostrar estrutura de uma luta
        console.log('\n2️⃣ Estrutura de uma luta:');
        const sampleFight = fights[0];
        console.log('Campos disponíveis:', Object.keys(sampleFight));
        console.log('Dados da luta:', {
            id: sampleFight.id,
            eventid: sampleFight.eventid,
            fighter1id: sampleFight.fighter1id,
            fighter2id: sampleFight.fighter2id,
            weightclass: sampleFight.weightclass,
            fighttype: sampleFight.fighttype,
            rounds: sampleFight.rounds,
            fightorder: sampleFight.fightorder
        });
        
        // 3. Buscar lutadores para referência
        console.log('\n3️⃣ Buscando lutadores...');
        const { data: fighters, error: fightersError } = await supabase
            .from('fighters')
            .select('*')
            .limit(5);
        
        if (fightersError) {
            console.log('❌ Erro ao buscar lutadores:', fightersError);
            return;
        }
        
        console.log(`✅ ${fighters.length} lutadores encontrados`);
        fighters.forEach(fighter => {
            console.log(`   - ${fighter.id}: ${fighter.name} (${fighter.weightclass})`);
        });
        
        // 4. Simular função editFight do frontend
        console.log('\n4️⃣ Simulando função editFight do frontend...');
        
        function simulateEditFight(fight) {
            console.log('   Simulando preenchimento do formulário:');
            console.log(`   - fightId: ${fight.id}`);
            console.log(`   - fighter1: ${fight.fighter1Id || fight.fighter1id}`);
            console.log(`   - fighter2: ${fight.fighter2Id || fight.fighter2id}`);
            console.log(`   - weightClass: ${fight.weightClass || fight.weightclass}`);
            console.log(`   - fightType: ${fight.fightType || fight.fighttype}`);
            console.log(`   - rounds: ${fight.rounds}`);
            
            // Verificar se os campos estão sendo encontrados
            const fields = {
                fighter1Id: fight.fighter1Id,
                fighter1id: fight.fighter1id,
                fighter2Id: fight.fighter2Id,
                fighter2id: fight.fighter2id,
                weightClass: fight.weightClass,
                weightclass: fight.weightclass,
                fightType: fight.fightType,
                fighttype: fight.fighttype
            };
            
            console.log('   Campos disponíveis:', fields);
            
            // Verificar se os lutadores existem
            const fighter1 = fighters.find(f => f.id == (fight.fighter1Id || fight.fighter1id));
            const fighter2 = fighters.find(f => f.id == (fight.fighter2Id || fight.fighter2id));
            
            console.log(`   - Lutador 1 encontrado: ${fighter1 ? '✅' : '❌'} ${fighter1?.name || 'N/A'}`);
            console.log(`   - Lutador 2 encontrado: ${fighter2 ? '✅' : '❌'} ${fighter2?.name || 'N/A'}`);
        }
        
        simulateEditFight(sampleFight);
        
        // 5. Testar atualização de uma luta
        console.log('\n5️⃣ Testando atualização de luta...');
        
        const fightToUpdate = fights[0];
        const updateData = {
            weightclass: 'Heavyweight',
            rounds: 5,
            fighttype: 'main'
        };
        
        console.log(`   Atualizando luta ${fightToUpdate.id} com:`, updateData);
        
        const { data: updatedFight, error: updateError } = await supabase
            .from('fights')
            .update(updateData)
            .eq('id', fightToUpdate.id)
            .select();
        
        if (updateError) {
            console.log('❌ Erro ao atualizar luta:', updateError);
            return;
        }
        
        console.log('✅ Luta atualizada com sucesso!');
        console.log('   Dados atualizados:', updatedFight[0]);
        
        // 6. Testar via API HTTP
        console.log('\n6️⃣ Testando edição via API HTTP...');
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
        
        // Testar GET de uma luta específica
        try {
            const response = await makeHttpRequest('GET', `fights/${fightToUpdate.id}`);
            console.log(`   GET /api/fights/${fightToUpdate.id}:`);
            console.log(`   Status: ${response.statusCode}`);
            
            if (response.statusCode === 200) {
                const fightData = JSON.parse(response.data);
                console.log('   Dados da luta:', {
                    id: fightData.id,
                    eventid: fightData.eventid,
                    fighter1id: fightData.fighter1id,
                    fighter2id: fightData.fighter2id,
                    weightclass: fightData.weightclass,
                    fighttype: fightData.fighttype
                });
            }
        } catch (error) {
            console.log('   ❌ Erro na requisição HTTP:', error.message);
        }
        
        console.log('\n🎉 Teste de edição de lutas concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testEditFight(); 