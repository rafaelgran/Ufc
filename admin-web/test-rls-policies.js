const { SupabaseService } = require('./supabase-config');

async function testRLSPolicies() {
    console.log('🔍 Testando políticas RLS...');
    const supabaseService = new SupabaseService();
    
    try {
        // 1. Testar select direto no evento
        console.log('1️⃣ Testando select direto no evento ID 22...');
        
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
        const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabaseAnon;
        
        // Testar select com anon
        console.log('🔍 Select com anon...');
        const { data: selectAnon, error: selectAnonError } = await supabaseAnon
            .from('events')
            .select('*')
            .eq('id', 22)
            .single();
        
        console.log('📥 Select anon - Data:', selectAnon);
        console.log('📥 Select anon - Error:', selectAnonError);
        
        // Testar select com admin
        console.log('🔍 Select com admin...');
        const { data: selectAdmin, error: selectAdminError } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('id', 22)
            .single();
        
        console.log('📥 Select admin - Data:', selectAdmin);
        console.log('📥 Select admin - Error:', selectAdminError);
        
        // 2. Testar update sem select
        console.log('\n2️⃣ Testando update sem select...');
        
        const { data: updateData, error: updateError } = await supabaseAdmin
            .from('events')
            .update({ name: 'UFC FIGHT NIGHT [TESTE RLS]' })
            .eq('id', 22);
        
        console.log('📥 Update sem select - Data:', updateData);
        console.log('📥 Update sem select - Error:', updateError);
        
        // 3. Verificar se o update funcionou
        console.log('\n3️⃣ Verificando se o update funcionou...');
        const { data: checkData, error: checkError } = await supabaseAdmin
            .from('events')
            .select('name')
            .eq('id', 22)
            .single();
        
        console.log('📥 Check - Data:', checkData);
        console.log('📥 Check - Error:', checkError);
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
    }
}

testRLSPolicies(); 