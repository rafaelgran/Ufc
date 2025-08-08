const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para obter JWT com role admin (igual ao supabase-config.js)
async function getAdminJWT() {
    const adminJWT = {
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 horas
        iat: Math.floor(Date.now() / 1000)
    };
    
    return adminJWT;
}

// Função para configurar headers de admin
async function getAdminHeaders() {
    const adminJWT = await getAdminJWT();
    return {
        Authorization: `Bearer ${JSON.stringify(adminJWT)}`,
        'Content-Type': 'application/json'
    };
}

async function testJWTAdmin() {
    console.log('🔒 Testando JWT Admin...\n');
    
    try {
        // 1. Testar sem JWT (deve falhar)
        console.log('1️⃣ Testando criação sem JWT (deve falhar)...');
        const { data: createData1, error: createError1 } = await supabase
            .from('fighters')
            .insert({
                name: 'Test Fighter No JWT',
                weightclass: 'Test'
            })
            .select();
        
        if (createError1) {
            console.log('   ✅ Criação bloqueada sem JWT (esperado):', createError1.message);
        } else {
            console.log('   ⚠️ Criação funcionou sem JWT (não esperado)');
            // Limpar o teste
            await supabase.from('fighters').delete().eq('name', 'Test Fighter No JWT');
        }
        
        // 2. Testar com JWT admin (deve funcionar)
        console.log('\n2️⃣ Testando criação com JWT admin (deve funcionar)...');
        const adminHeaders = await getAdminHeaders();
        console.log('   Headers:', adminHeaders);
        
        const { data: createData2, error: createError2 } = await supabase
            .from('fighters')
            .insert({
                name: 'Test Fighter With JWT',
                weightclass: 'Test'
            })
            .select()
            .headers(adminHeaders);
        
        if (createError2) {
            console.log('   ❌ Criação falhou com JWT admin:', createError2.message);
        } else {
            console.log('   ✅ Criação funcionou com JWT admin');
            // Limpar o teste
            await supabase.from('fighters').delete().eq('name', 'Test Fighter With JWT').headers(adminHeaders);
        }
        
        // 3. Verificar se RLS está ativo
        console.log('\n3️⃣ Verificando se RLS está ativo...');
        const { data: rlsData, error: rlsError } = await supabase
            .from('information_schema.tables')
            .select('table_name, row_security')
            .eq('table_schema', 'public')
            .in('table_name', ['fighters', 'events', 'fights']);
        
        if (rlsError) {
            console.log('   ❌ Erro ao verificar RLS:', rlsError.message);
        } else {
            console.log('   📊 Status RLS:');
            rlsData.forEach(table => {
                console.log(`      ${table.table_name}: ${table.row_security ? 'ATIVO' : 'INATIVO'}`);
            });
        }
        
        // 4. Verificar políticas
        console.log('\n4️⃣ Verificando políticas...');
        const { data: policiesData, error: policiesError } = await supabase
            .from('pg_policies')
            .select('tablename, policyname, cmd')
            .in('tablename', ['fighters', 'events', 'fights']);
        
        if (policiesError) {
            console.log('   ❌ Erro ao verificar políticas:', policiesError.message);
        } else {
            console.log('   📋 Políticas encontradas:');
            policiesData.forEach(policy => {
                console.log(`      ${policy.tablename}.${policy.policyname}: ${policy.cmd}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testJWTAdmin(); 