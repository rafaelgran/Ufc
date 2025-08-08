const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFightStructure() {
    console.log('🧪 Testando estrutura dos dados de lutas...\n');

    try {
        // Buscar uma luta para ver a estrutura
        const { data: fights, error } = await supabase
            .from('fights')
            .select('*')
            .limit(1);

        if (error) {
            throw error;
        }

        if (!fights || fights.length === 0) {
            console.log('❌ Nenhuma luta encontrada');
            return;
        }

        const fight = fights[0];
        console.log('📋 Estrutura da luta:');
        console.log(JSON.stringify(fight, null, 2));

        console.log('\n🔍 Campos importantes:');
        console.log(`   ID: ${fight.id}`);
        console.log(`   Fighter1ID: ${fight.fighter1id}`);
        console.log(`   Fighter2ID: ${fight.fighter2id}`);
        console.log(`   WinnerID: ${fight.winner_id}`);
        console.log(`   Status: ${fight.status}`);
        console.log(`   IsFinished: ${fight.is_finished}`);
        
        if (fight.fighter1) {
            console.log(`   Fighter1: ${fight.fighter1.name} (ID: ${fight.fighter1.id})`);
        }
        if (fight.fighter2) {
            console.log(`   Fighter2: ${fight.fighter2.name} (ID: ${fight.fighter2.id})`);
        }
        if (fight.winner) {
            console.log(`   Winner: ${fight.winner.name} (ID: ${fight.winner.id})`);
        }
        if (fight.events) {
            console.log(`   Event: ${fight.events.name} (ID: ${fight.events.id})`);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testFightStructure(); 