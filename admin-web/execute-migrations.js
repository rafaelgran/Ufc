const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigrations() {
    console.log('🚀 Iniciando migrações do banco de dados...');
    
    try {
        // 1. Adicionar colunas para controle ao vivo da luta
        console.log('📝 Adicionando colunas para controle ao vivo...');
        
        const liveControlColumns = [
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 0',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS round_start_time TIMESTAMP WITH TIME ZONE',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS round_end_time TIMESTAMP WITH TIME ZONE',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS round_duration INTEGER DEFAULT 300',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS round_status VARCHAR(20) DEFAULT \'stopped\''
        ];
        
        for (const query of liveControlColumns) {
            const { error } = await supabase.rpc('exec_sql', { sql: query });
            if (error) {
                console.error('❌ Erro ao executar:', query);
                console.error('Erro:', error);
            } else {
                console.log('✅ Executado:', query);
            }
        }
        
        // 2. Adicionar colunas para resultado da luta
        console.log('📝 Adicionando colunas para resultado...');
        
        const resultColumns = [
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS result_type VARCHAR(10)',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS final_round INTEGER',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS final_time VARCHAR(10)',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS winner_id INTEGER',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS is_finished BOOLEAN DEFAULT FALSE',
            'ALTER TABLE fights ADD COLUMN IF NOT EXISTS result_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
        ];
        
        for (const query of resultColumns) {
            const { error } = await supabase.rpc('exec_sql', { sql: query });
            if (error) {
                console.error('❌ Erro ao executar:', query);
                console.error('Erro:', error);
            } else {
                console.log('✅ Executado:', query);
            }
        }
        
        // 3. Adicionar índices
        console.log('📝 Adicionando índices...');
        
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_fights_is_live ON fights(is_live)',
            'CREATE INDEX IF NOT EXISTS idx_fights_is_finished ON fights(is_finished)',
            'CREATE INDEX IF NOT EXISTS idx_fights_event_id ON fights(event_id)'
        ];
        
        for (const query of indexes) {
            const { error } = await supabase.rpc('exec_sql', { sql: query });
            if (error) {
                console.error('❌ Erro ao executar:', query);
                console.error('Erro:', error);
            } else {
                console.log('✅ Executado:', query);
            }
        }
        
        // 4. Adicionar constraints
        console.log('📝 Adicionando constraints...');
        
        const constraints = [
            'ALTER TABLE fights ADD CONSTRAINT IF NOT EXISTS check_result_type CHECK (result_type IN (\'DE\', \'KO\', \'TKO\', \'SUB\', \'Draw\', \'DQ\', \'NC\'))',
            'ALTER TABLE fights ADD CONSTRAINT IF NOT EXISTS check_round_status CHECK (round_status IN (\'running\', \'paused\', \'stopped\'))'
        ];
        
        for (const query of constraints) {
            const { error } = await supabase.rpc('exec_sql', { sql: query });
            if (error) {
                console.error('❌ Erro ao executar:', query);
                console.error('Erro:', error);
            } else {
                console.log('✅ Executado:', query);
            }
        }
        
        // 5. Adicionar foreign key
        console.log('📝 Adicionando foreign key...');
        
        const { error: fkError } = await supabase.rpc('exec_sql', { 
            sql: 'ALTER TABLE fights ADD CONSTRAINT IF NOT EXISTS fk_fights_winner FOREIGN KEY (winner_id) REFERENCES fighters(id) ON DELETE SET NULL'
        });
        
        if (fkError) {
            console.error('❌ Erro ao adicionar foreign key:', fkError);
        } else {
            console.log('✅ Foreign key adicionada');
        }
        
        console.log('🎉 Migrações concluídas com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante as migrações:', error);
    }
}

// Executar migrações
executeMigrations(); 