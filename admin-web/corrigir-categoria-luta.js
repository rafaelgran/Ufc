const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function corrigirCategoriaLuta() {
    console.log('🔧 Corrigindo categoria da luta ID 11...\n');
    
    try {
        // 1. Verificar a luta atual
        console.log('1️⃣ Verificando luta ID 11...');
        
        const { data: fight, error: fightError } = await supabase
            .from('fights')
            .select('*')
            .eq('id', 11)
            .single();
        
        if (fightError) {
            console.log('❌ Erro ao buscar luta:', fightError);
            return;
        }
        
        console.log('✅ Luta encontrada:', {
            id: fight.id,
            eventid: fight.eventid,
            fighter1id: fight.fighter1id,
            fighter2id: fight.fighter2id,
            weightclass: fight.weightclass,
            fighttype: fight.fighttype,
            rounds: fight.rounds
        });
        
        // 2. Verificar os lutadores da luta
        console.log('\n2️⃣ Verificando lutadores da luta...');
        
        const { data: fighter1, error: fighter1Error } = await supabase
            .from('fighters')
            .select('*')
            .eq('id', fight.fighter1id)
            .single();
        
        const { data: fighter2, error: fighter2Error } = await supabase
            .from('fighters')
            .select('*')
            .eq('id', fight.fighter2id)
            .single();
        
        if (fighter1Error || fighter2Error) {
            console.log('❌ Erro ao buscar lutadores:', { fighter1Error, fighter2Error });
            return;
        }
        
        console.log('✅ Lutador 1:', {
            id: fighter1.id,
            name: fighter1.name,
            weightclass: fighter1.weightclass
        });
        
        console.log('✅ Lutador 2:', {
            id: fighter2.id,
            name: fighter2.name,
            weightclass: fighter2.weightclass
        });
        
        // 3. Verificar categorias disponíveis
        console.log('\n3️⃣ Verificando categorias disponíveis...');
        
        const { data: fighters, error: fightersError } = await supabase
            .from('fighters')
            .select('weightclass');
        
        if (fightersError) {
            console.log('❌ Erro ao buscar lutadores:', fightersError);
            return;
        }
        
        const categories = [...new Set(fighters.map(f => f.weightclass))];
        console.log('✅ Categorias disponíveis:', categories);
        
        // 4. Corrigir a categoria da luta
        console.log('\n4️⃣ Corrigindo categoria da luta...');
        
        // Usar a categoria do lutador 1 (ou Light Heavyweight como fallback)
        const newWeightClass = fighter1.weightclass || 'Light Heavyweight';
        
        console.log(`🔄 Mudando categoria de "${fight.weightclass}" para "${newWeightClass}"`);
        
        const { data: updatedFight, error: updateError } = await supabase
            .from('fights')
            .update({ weightclass: newWeightClass })
            .eq('id', 11)
            .select()
            .single();
        
        if (updateError) {
            console.log('❌ Erro ao atualizar luta:', updateError);
            return;
        }
        
        console.log('✅ Luta atualizada com sucesso:', {
            id: updatedFight.id,
            weightclass: updatedFight.weightclass
        });
        
        // 5. Verificar se agora há lutadores na categoria
        console.log('\n5️⃣ Verificando lutadores na nova categoria...');
        
        const { data: fightersInCategory, error: categoryError } = await supabase
            .from('fighters')
            .select('*')
            .eq('weightclass', newWeightClass);
        
        if (categoryError) {
            console.log('❌ Erro ao buscar lutadores da categoria:', categoryError);
            return;
        }
        
        console.log(`✅ ${fightersInCategory.length} lutadores encontrados na categoria "${newWeightClass}":`);
        fightersInCategory.forEach(fighter => {
            console.log(`   - ${fighter.name} (ID: ${fighter.id})`);
        });
        
        console.log('\n🎉 Correção concluída com sucesso!');
        console.log(`📝 A luta ID 11 agora está na categoria "${newWeightClass}"`);
        console.log(`👥 Há ${fightersInCategory.length} lutadores disponíveis nesta categoria`);
        
    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
    }
}

corrigirCategoriaLuta(); 