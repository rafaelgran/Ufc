const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabaseAnon;

// Função para obter JWT com role admin
async function getAdminJWT() {
    // Para desenvolvimento, vamos criar um JWT simples com role admin
    // Em produção, você deve implementar autenticação real
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

// Database operations for Supabase
class SupabaseService {
    // Events operations
    async getAllEvents() {
        try {
            const { data, error } = await supabaseAnon
                .from('events')
                .select('*')
                .order('date', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    async createEvent(eventData) {
        try {
            // Sempre usar mainevent (lowercase) para evitar problemas de cache
            const mappedData = { ...eventData };
            
            // Garantir que mainEvent seja mapeado para mainevent
            if (mappedData.mainEvent !== undefined) {
                mappedData.mainevent = mappedData.mainEvent;
                delete mappedData.mainEvent;
            }
            
            // Tratar formato de data
            if (mappedData.date) {
                // Converter datetime-local para formato ISO
                const date = new Date(mappedData.date);
                if (!isNaN(date.getTime())) {
                    mappedData.date = date.toISOString();
                }
            }
            
            const { data, error } = await supabaseAdmin
                .from('events')
                .insert([mappedData])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    async updateEvent(id, eventData) {
        try {
            // Sempre usar mainevent (lowercase) para evitar problemas de cache
            const mappedData = { ...eventData };
            
            // Garantir que mainEvent seja mapeado para mainevent
            if (mappedData.mainEvent !== undefined) {
                mappedData.mainevent = mappedData.mainEvent;
                delete mappedData.mainEvent;
            }
            
            // Tratar formato de data
            if (mappedData.date) {
                // Se a data já está em formato ISO, usar como está
                if (mappedData.date.includes('T') && mappedData.date.includes(':')) {
                    // Verificar se precisa adicionar timezone se não tiver
                    if (!mappedData.date.includes('+') && !mappedData.date.includes('Z')) {
                        // Adicionar timezone local
                        const date = new Date(mappedData.date);
                        if (!isNaN(date.getTime())) {
                            mappedData.date = date.toISOString();
                        }
                    }
                } else {
                    // Converter datetime-local para formato ISO
                    const date = new Date(mappedData.date);
                    if (!isNaN(date.getTime())) {
                        mappedData.date = date.toISOString();
                    }
                }
            }
            
            // Fazer o update sem select (que funciona)
            let { error } = await supabaseAdmin
                .from('events')
                .update(mappedData)
                .eq('id', id);
            
            if (error) {
                throw error;
            }
            
            // Buscar o evento atualizado separadamente
            const { data: updatedEvent, error: fetchError } = await supabaseAdmin
                .from('events')
                .select('*')
                .eq('id', id)
                .single();
            
            if (fetchError) {
                throw fetchError;
            }
            
            if (!updatedEvent) {
                throw new Error('Event not found after update');
            }
            
            return updatedEvent;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async deleteEvent(id) {
        try {
            const { error } = await supabaseAdmin
                .from('events')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    // Fighters operations
    async getAllFighters() {
        try {
            const { data, error } = await supabaseAnon
                .from('fighters')
                .select('*')
                .order('name', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching fighters:', error);
            return [];
        }
    }

    async createFighter(fighterData) {
        try {
            // Mapear weightClass para weightclass se necessário
            const mappedData = { ...fighterData };
            if (mappedData.weightClass && !mappedData.weightclass) {
                mappedData.weightclass = mappedData.weightClass;
                delete mappedData.weightClass;
            }
            
            // Garantir que o campo country seja incluído
            if (!mappedData.country) {
                mappedData.country = null;
            }
            
            // Garantir que os campos de record sejam números
            if (mappedData.wins !== undefined) {
                mappedData.wins = parseInt(mappedData.wins) || 0;
            }
            if (mappedData.losses !== undefined) {
                mappedData.losses = parseInt(mappedData.losses) || 0;
            }
            if (mappedData.draws !== undefined) {
                mappedData.draws = parseInt(mappedData.draws) || 0;
            }
            
            const { data, error } = await supabaseAdmin
                .from('fighters')
                .insert([mappedData])
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating fighter:', error);
            throw error;
        }
    }

    async updateFighter(id, fighterData) {
        try {
            // Mapear weightClass para weightclass se necessário
            const mappedData = { ...fighterData };
            if (mappedData.weightClass && !mappedData.weightclass) {
                mappedData.weightclass = mappedData.weightClass;
                delete mappedData.weightClass;
            }
            
            // Garantir que o campo country seja incluído
            if (!mappedData.country) {
                mappedData.country = null;
            }
            
            // Garantir que os campos de record sejam números
            if (mappedData.wins !== undefined) {
                mappedData.wins = parseInt(mappedData.wins) || 0;
            }
            if (mappedData.losses !== undefined) {
                mappedData.losses = parseInt(mappedData.losses) || 0;
            }
            if (mappedData.draws !== undefined) {
                mappedData.draws = parseInt(mappedData.draws) || 0;
            }
            
            const { data, error } = await supabaseAdmin
                .from('fighters')
                .update(mappedData)
                .eq('id', id)
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating fighter:', error);
            throw error;
        }
    }

    async deleteFighter(id) {
        try {
            const { error } = await supabaseAdmin
                .from('fighters')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting fighter:', error);
            throw error;
        }
    }

    // Fights operations
    async getAllFights() {
        try {
            const { data, error } = await supabaseAnon
                .from('fights')
                .select('*')
                .order('fightorder', { ascending: true }); // Corrigido para fightorder (lowercase)
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching fights:', error);
            return [];
        }
    }

    async createFight(fightData) {
        try {
            // Mapear nomes de colunas para o formato correto
            const mappedData = { ...fightData };
            
            // Mapear eventId para eventid
            if (mappedData.eventId && !mappedData.eventid) {
                mappedData.eventid = mappedData.eventId;
                delete mappedData.eventId;
            }
            
            // Mapear fighter1Id para fighter1id
            if (mappedData.fighter1Id && !mappedData.fighter1id) {
                mappedData.fighter1id = mappedData.fighter1Id;
                delete mappedData.fighter1Id;
            }
            
            // Mapear fighter2Id para fighter2id
            if (mappedData.fighter2Id && !mappedData.fighter2id) {
                mappedData.fighter2id = mappedData.fighter2Id;
                delete mappedData.fighter2Id;
            }
            
            // Mapear weightClass para weightclass
            if (mappedData.weightClass && !mappedData.weightclass) {
                mappedData.weightclass = mappedData.weightClass;
                delete mappedData.weightClass;
            }
            
            // Mapear fightType para fighttype
            if (mappedData.fightType && !mappedData.fighttype) {
                mappedData.fighttype = mappedData.fightType;
                delete mappedData.fightType;
            }
            
            // Mapear timeRemaining para timeremaining
            if (mappedData.timeRemaining && !mappedData.timeremaining) {
                mappedData.timeremaining = mappedData.timeRemaining;
                delete mappedData.timeRemaining;
            }
            
            // Mapear winnerId para winnerid
            if (mappedData.winnerId && !mappedData.winnerid) {
                mappedData.winnerid = mappedData.winnerId;
                delete mappedData.winnerId;
            }
            
            // Mapear fightOrder para fightorder
            if (mappedData.fightOrder && !mappedData.fightorder) {
                mappedData.fightorder = mappedData.fightOrder;
                delete mappedData.fightOrder;
            }
            
            const { data, error } = await supabaseAdmin
                .from('fights')
                .insert([mappedData])
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating fight:', error);
            throw error;
        }
    }

    async updateFight(id, fightData) {
        try {
            // Mapear nomes de colunas para o formato correto
            const mappedData = { ...fightData };
            
            // Mapear eventId para eventid
            if (mappedData.eventId && !mappedData.eventid) {
                mappedData.eventid = mappedData.eventId;
                delete mappedData.eventId;
            }
            
            // Mapear fighter1Id para fighter1id
            if (mappedData.fighter1Id && !mappedData.fighter1id) {
                mappedData.fighter1id = mappedData.fighter1Id;
                delete mappedData.fighter1Id;
            }
            
            // Mapear fighter2Id para fighter2id
            if (mappedData.fighter2Id && !mappedData.fighter2id) {
                mappedData.fighter2id = mappedData.fighter2Id;
                delete mappedData.fighter2Id;
            }
            
            // Mapear weightClass para weightclass
            if (mappedData.weightClass && !mappedData.weightclass) {
                mappedData.weightclass = mappedData.weightClass;
                delete mappedData.weightClass;
            }
            
            // Mapear fightType para fighttype
            if (mappedData.fightType && !mappedData.fighttype) {
                mappedData.fighttype = mappedData.fightType;
                delete mappedData.fightType;
            }
            
            // Mapear timeRemaining para timeremaining
            if (mappedData.timeRemaining && !mappedData.timeremaining) {
                mappedData.timeremaining = mappedData.timeRemaining;
                delete mappedData.timeRemaining;
            }
            
            // Mapear winnerId para winnerid
            if (mappedData.winnerId && !mappedData.winnerid) {
                mappedData.winnerid = mappedData.winnerId;
                delete mappedData.winnerId;
            }
            
            // Mapear fightOrder para fightorder
            if (mappedData.fightOrder && !mappedData.fightorder) {
                mappedData.fightorder = mappedData.fightOrder;
                delete mappedData.fightOrder;
            }
            
            const { data, error } = await supabaseAdmin
                .from('fights')
                .update(mappedData)
                .eq('id', id)
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating fight:', error);
            throw error;
        }
    }

    async deleteFight(id) {
        try {
            const { error } = await supabaseAdmin
                .from('fights')
                .delete()
                .eq('id', id)
                ;
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting fight:', error);
            throw error;
        }
    }

    async updateFightOrder(fightId, newOrder) {
        try {
            const { data, error } = await supabaseAdmin
                .from('fights')
                .update({ fightorder: newOrder }) // Corrigido para fightorder (lowercase)
                .eq('id', fightId)
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating fight order:', error);
            throw error;
        }
    }

    async updateFightStatus(id, status) {
        try {
            const { data, error } = await supabaseAdmin
                .from('fights')
                .update({ status: status })
                .eq('id', id)
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating fight status:', error);
            throw error;
        }
    }

    // Test connection
    async testConnection() {
        try {
            const { data, error } = await supabaseAnon
                .from('events')
                .select('count')
                .limit(1);
            
            if (error) throw error;
            return { success: true, message: 'Supabase connection successful' };
        } catch (error) {
            console.error('Supabase connection test failed:', error);
            return { success: false, message: error.message };
        }
    }

    // ===== MÉTODOS PARA CONTROLE DE LIVE ACTIVITIES =====

    // Iniciar controle ao vivo de uma luta
    async startFightLive(fightId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('fights')
                .update({
                    is_live: true,
                    status: 'live', // Mudar status para "live" (In progress)
                    current_round: 1,
                    round_start_time: new Date().toISOString(),
                    round_status: 'running'
                })
                .eq('id', fightId)
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error starting fight live:', error);
            throw error;
        }
    }

    // Parar controle ao vivo de uma luta
    async stopFightLive(fightId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('fights')
                .update({
                    is_live: false,
                    status: 'scheduled', // Voltar status para "scheduled"
                    round_status: 'stopped',
                    round_end_time: new Date().toISOString()
                })
                .eq('id', fightId)
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error stopping fight live:', error);
            throw error;
        }
    }

    // Controlar round (play/pause)
    async controlRound(fightId, action, roundNumber = null) {
        try {
            let updateData = {};
            
            if (action === 'play') {
                updateData = {
                    round_status: 'running',
                    round_start_time: new Date().toISOString()
                };
            } else if (action === 'pause') {
                updateData = {
                    round_status: 'paused',
                    round_end_time: new Date().toISOString()
                };
            } else if (action === 'next_round' && roundNumber) {
                updateData = {
                    current_round: roundNumber,
                    round_start_time: new Date().toISOString(),
                    round_end_time: null,
                    round_status: 'running'
                };
            }
            
            const { data, error } = await supabaseAdmin
                .from('fights')
                .update(updateData)
                .eq('id', fightId)
                .select()
                ;
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error controlling round:', error);
            throw error;
        }
    }

    // Salvar resultado da luta
    async saveFightResult(fightId, resultData) {
        try {
            // Primeiro, buscar a luta para obter os IDs dos lutadores
            const { data: fightData, error: fightError } = await supabaseAdmin
                .from('fights')
                .select('fighter1id, fighter2id')
                .eq('id', fightId)
                .single()
                ;
            
            if (fightError) throw fightError;
            
            // Determinar quem perdeu
            const loserId = resultData.winnerId === fightData.fighter1id ? fightData.fighter2id : fightData.fighter1id;
            
            // Atualizar a luta com o resultado e o perdedor
            const { data, error } = await supabaseAdmin
                .from('fights')
                .update({
                    result_type: resultData.resultType,
                    final_round: resultData.finalRound,
                    final_time: resultData.finalTime,
                    winner_id: resultData.winnerId,
                    loser_id: loserId,
                    status: 'finished', // Atualizar status para finished
                    is_finished: true,
                    is_live: false,
                    result_updated_at: new Date().toISOString()
                })
                .eq('id', fightId)
                .select()
                ;
            
            if (error) throw error;
            
            // Atualizar records dos lutadores
            await this.updateFighterRecords(resultData.winnerId, loserId);
            
            return data[0];
        } catch (error) {
            console.error('Error saving fight result:', error);
            throw error;
        }
    }

    // Obter lutas ao vivo
    async getLiveFights() {
        try {
            const { data, error } = await supabaseAdmin
                .from('fights')
                .select(`
                    *,
                    fighter1:fighters!fights_fighter1Id_fkey(*),
                    fighter2:fighters!fights_fighter2Id_fkey(*),
                    events(*)
                `)
                .eq('is_live', true)
                .order('fightorder', { ascending: true })
                ;
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching live fights:', error);
            return [];
        }
    }

    // Obter lutas finalizadas
    async getFinishedFights() {
        try {
            const { data, error } = await supabaseAdmin
                .from('fights')
                .select(`
                    *,
                    fighter1:fighters!fights_fighter1Id_fkey(*),
                    fighter2:fighters!fights_fighter2Id_fkey(*),
                    winner:fighters!fights_winner_id_fkey(*),
                    events(*)
                `)
                .eq('is_finished', true)
                .order('result_updated_at', { ascending: false })
                ;
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching finished fights:', error);
            return [];
        }
    }

    // Obter tempo restante do round atual
    async getRoundTimeRemaining(fightId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('fights')
                .select('round_start_time, round_duration, round_status')
                .eq('id', fightId)
                .single()
                ;
            
            if (error) throw error;
            
            if (!data || data.round_status !== 'running') {
                return 0;
            }
            
            const startTime = new Date(data.round_start_time);
            const now = new Date();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const remainingSeconds = Math.max(0, data.round_duration - elapsedSeconds);
            
            return remainingSeconds;
        } catch (error) {
            console.error('Error getting round time remaining:', error);
            return 0;
        }
    }

    // Limpar resultado da luta
    async clearFightResult(fightId) {
        try {
            // Primeiro, buscar a luta para obter os IDs do vencedor e perdedor
            const { data: fightData, error: fightError } = await supabaseAdmin
                .from('fights')
                .select('winner_id, loser_id')
                .eq('id', fightId)
                .single()
                ;
            
            if (fightError) throw fightError;
            
            // Reverter records dos lutadores se houver resultado anterior
            if (fightData.winner_id && fightData.loser_id) {
                await this.revertFighterRecords(fightData.winner_id, fightData.loser_id);
            }
            
            // Limpar resultado da luta
            const { error } = await supabaseAdmin
                .from('fights')
                .update({
                    status: 'scheduled', // Voltar status para scheduled
                    is_live: false,
                    current_round: 0,
                    round_start_time: null,
                    round_end_time: null,
                    round_status: 'stopped',
                    result_type: null,
                    final_round: null,
                    final_time: null,
                    winner_id: null,
                    loser_id: null,
                    is_finished: false,
                    result_updated_at: null
                })
                .eq('id', fightId)
                ;
            
            if (error) throw error;
            return { success: true, message: 'Fight result cleared successfully' };
        } catch (error) {
            console.error('Error clearing fight result:', error);
            throw error;
        }
    }

    // Atualizar records dos lutadores após vitória/derrota
    async updateFighterRecords(winnerId, loserId) {
        try {
            // Buscar dados dos lutadores
            const { data: winner, error: winnerError } = await supabaseAdmin
                .from('fighters')
                .select('wins, losses, draws')
                .eq('id', winnerId)
                .single()
                ;
            
            const { data: loser, error: loserError } = await supabaseAdmin
                .from('fighters')
                .select('wins, losses, draws')
                .eq('id', loserId)
                .single()
                ;
            
            if (winnerError || loserError) {
                throw winnerError || loserError;
            }
            
            // Atualizar record do vencedor (adicionar vitória)
            const newWinnerWins = (winner.wins || 0) + 1;
            
            await supabaseAdmin
                .from('fighters')
                .update({
                    wins: newWinnerWins
                })
                .eq('id', winnerId)
                ;
            
            // Atualizar record do perdedor (adicionar derrota)
            const newLoserLosses = (loser.losses || 0) + 1;
            
            await supabaseAdmin
                .from('fighters')
                .update({
                    losses: newLoserLosses
                })
                .eq('id', loserId)
                ;
            
            console.log(`✅ Records atualizados: Vencedor ${winnerId} (${newWinnerWins}-${winner.losses || 0}-${winner.draws || 0}), Perdedor ${loserId} (${loser.wins || 0}-${newLoserLosses}-${loser.draws || 0})`);
            
        } catch (error) {
            console.error('Error updating fighter records:', error);
            throw error;
        }
    }
    
    // Reverter records dos lutadores (quando resultado é limpo)
    async revertFighterRecords(winnerId, loserId) {
        try {
            // Buscar dados dos lutadores
            const { data: winner, error: winnerError } = await supabaseAdmin
                .from('fighters')
                .select('wins, losses, draws')
                .eq('id', winnerId)
                .single()
                ;
            
            const { data: loser, error: loserError } = await supabaseAdmin
                .from('fighters')
                .select('wins, losses, draws')
                .eq('id', loserId)
                .single()
                ;
            
            if (winnerError || loserError) {
                throw winnerError || loserError;
            }
            
            // Reverter record do vencedor (remover vitória)
            const newWinnerWins = Math.max(0, (winner.wins || 0) - 1);
            
            await supabaseAdmin
                .from('fighters')
                .update({
                    wins: newWinnerWins
                })
                .eq('id', winnerId)
                ;
            
            // Reverter record do perdedor (remover derrota)
            const newLoserLosses = Math.max(0, (loser.losses || 0) - 1);
            
            await supabaseAdmin
                .from('fighters')
                .update({
                    losses: newLoserLosses
                })
                .eq('id', loserId)
                ;
            
            console.log(`✅ Records revertidos: Vencedor ${winnerId} (${newWinnerWins}-${winner.losses || 0}-${winner.draws || 0}), Perdedor ${loserId} (${loser.wins || 0}-${newLoserLosses}-${loser.draws || 0})`);
            
        } catch (error) {
            console.error('Error reverting fighter records:', error);
            throw error;
        }
    }
}

module.exports = { supabaseAnon, supabaseAdmin, SupabaseService }; 