const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Database operations for Supabase
class SupabaseService {
    // Events operations
    async getAllEvents() {
        try {
            const { data, error } = await supabase
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
            
            const { data, error } = await supabase
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
                // Converter datetime-local para formato ISO
                const date = new Date(mappedData.date);
                if (!isNaN(date.getTime())) {
                    mappedData.date = date.toISOString();
                }
            }
            
            const { data, error } = await supabase
                .from('events')
                .update(mappedData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async deleteEvent(id) {
        try {
            const { error } = await supabase
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
            const { data, error } = await supabase
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
            
            const { data, error } = await supabase
                .from('fighters')
                .insert([mappedData])
                .select();
            
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
            
            const { data, error } = await supabase
                .from('fighters')
                .update(mappedData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating fighter:', error);
            throw error;
        }
    }

    async deleteFighter(id) {
        try {
            const { error } = await supabase
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
            const { data, error } = await supabase
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
            
            const { data, error } = await supabase
                .from('fights')
                .insert([mappedData])
                .select();
            
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
            
            const { data, error } = await supabase
                .from('fights')
                .update(mappedData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating fight:', error);
            throw error;
        }
    }

    async deleteFight(id) {
        try {
            const { error } = await supabase
                .from('fights')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting fight:', error);
            throw error;
        }
    }

    async updateFightOrder(fightId, newOrder) {
        try {
            const { data, error } = await supabase
                .from('fights')
                .update({ fightorder: newOrder }) // Corrigido para fightorder (lowercase)
                .eq('id', fightId)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating fight order:', error);
            throw error;
        }
    }

    async updateFightStatus(id, status) {
        try {
            const { data, error } = await supabase
                .from('fights')
                .update({ status: status })
                .eq('id', id)
                .select();
            
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
            const { data, error } = await supabase
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
}

module.exports = { supabase, SupabaseService }; 