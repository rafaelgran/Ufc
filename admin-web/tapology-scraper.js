const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

class TapologyFightersScraper {
    constructor() {
        this.db = new sqlite3.Database('./ufc_events.db');
        this.baseUrl = 'https://www.tapology.com/fightcenter/fighters';
        this.fighters = [];
    }

    async init() {
        console.log('🚀 Iniciando Tapology Fighters Scraper...');
        
        // Create fighters table if not exists
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS fighters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                nickname TEXT,
                record TEXT,
                weightClass TEXT,
                ranking INTEGER,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                draws INTEGER DEFAULT 0,
                ufcStatsUrl TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    }

    async scrapeFighters() {
        try {
            console.log('📊 Extraindo dados de lutadores do Tapology...');
            
            // Tapology has a fighters page with UFC fighters
            const url = 'https://www.tapology.com/fightcenter/fighters?search=UFC';
            console.log(`   📡 Acessando: ${url}`);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            const fighterCards = $('.fighterCard');
            
            console.log(`   👥 Encontrados ${fighterCards.length} lutadores no Tapology`);

            // Parse first 50 fighters to avoid overwhelming the server
            const maxFighters = Math.min(fighterCards.length, 50);
            
            for (let i = 0; i < maxFighters; i++) {
                const element = fighterCards[i];
                const fighter = this.parseFighterCard($(element));
                
                if (fighter && fighter.name) {
                    this.fighters.push(fighter);
                    console.log(`   ✅ ${fighter.name} - ${fighter.record} (${fighter.weightClass})`);
                }
                
                // Small delay to be respectful
                await this.delay(100);
            }

            console.log(`\n✅ Extração concluída! ${this.fighters.length} lutadores encontrados.`);
            return this.fighters;

        } catch (error) {
            console.error('❌ Erro ao extrair lutadores:', error.message);
            throw error;
        }
    }

    parseFighterCard($card) {
        try {
            const nameElement = $card.find('.fighterCardName a');
            const name = nameElement.text().trim();
            const profileUrl = nameElement.attr('href');
            
            const recordElement = $card.find('.fighterCardRecord');
            const record = recordElement.text().trim();
            
            const weightClassElement = $card.find('.fighterCardWeightClass');
            const weightClass = weightClassElement.text().trim();
            
            const nicknameElement = $card.find('.fighterCardNickname');
            const nickname = nicknameElement.text().trim();

            if (!name) return null;

            // Parse record (e.g., "15-3-0")
            const recordParts = record.split('-');
            const wins = parseInt(recordParts[0]) || 0;
            const losses = parseInt(recordParts[1]) || 0;
            const draws = parseInt(recordParts[2]) || 0;

            return {
                name: name,
                nickname: nickname || null,
                record: record,
                weightClass: this.normalizeWeightClass(weightClass),
                wins: wins,
                losses: losses,
                draws: draws,
                ufcStatsUrl: profileUrl ? `https://www.tapology.com${profileUrl}` : null
            };

        } catch (error) {
            console.error('   ❌ Erro ao parsear card do lutador:', error.message);
            return null;
        }
    }

    normalizeWeightClass(weightClass) {
        if (!weightClass) return 'Unknown';
        
        const mapping = {
            'Flyweight': 'Flyweight',
            'Bantamweight': 'Bantamweight',
            'Featherweight': 'Featherweight',
            'Lightweight': 'Lightweight',
            'Welterweight': 'Welterweight',
            'Middleweight': 'Middleweight',
            'Light Heavyweight': 'Light Heavyweight',
            'Heavyweight': 'Heavyweight',
            'Strawweight': 'Strawweight',
            'Women\'s Flyweight': 'Women\'s Flyweight',
            'Women\'s Bantamweight': 'Women\'s Bantamweight',
            'Women\'s Featherweight': 'Women\'s Featherweight'
        };
        
        return mapping[weightClass] || weightClass;
    }

    async saveFightersToDatabase() {
        console.log('\n💾 Salvando lutadores no banco de dados...');
        
        return new Promise((resolve, reject) => {
            // Clear existing fighters
            this.db.run('DELETE FROM fighters', (err) => {
                if (err) {
                    console.error('❌ Erro ao limpar tabela:', err);
                    reject(err);
                    return;
                }

                console.log('   🗑️ Tabela de lutadores limpa');

                // Insert new fighters
                const stmt = this.db.prepare(`
                    INSERT INTO fighters (name, nickname, record, weightClass, wins, losses, draws, ufcStatsUrl)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                let inserted = 0;
                let errors = 0;

                this.fighters.forEach((fighter, index) => {
                    stmt.run([
                        fighter.name,
                        fighter.nickname,
                        fighter.record,
                        fighter.weightClass,
                        fighter.wins,
                        fighter.losses,
                        fighter.draws,
                        fighter.ufcStatsUrl
                    ], function(err) {
                        if (err) {
                            console.error(`   ❌ Erro ao inserir ${fighter.name}:`, err.message);
                            errors++;
                        } else {
                            inserted++;
                        }

                        if (index === this.fighters.length - 1) {
                            stmt.finalize((err) => {
                                if (err) {
                                    console.error('❌ Erro ao finalizar inserção:', err);
                                    reject(err);
                                } else {
                                    console.log(`\n✅ Concluído! ${inserted} lutadores inseridos, ${errors} erros.`);
                                    resolve({ inserted, errors });
                                }
                            });
                        }
                    }.bind(this));
                });
            });
        });
    }

    async updateRankings() {
        console.log('\n📈 Atualizando rankings...');
        
        return new Promise((resolve, reject) => {
            // Simple ranking based on wins
            const stmt = this.db.prepare(`
                UPDATE fighters 
                SET ranking = (
                    SELECT rank 
                    FROM (
                        SELECT id, ROW_NUMBER() OVER (PARTITION BY weightClass ORDER BY wins DESC, losses ASC) as rank
                        FROM fighters
                    ) ranked 
                    WHERE ranked.id = fighters.id
                )
                WHERE ranking <= 15
            `);
            
            stmt.run((err) => {
                if (err) {
                    console.error('❌ Erro ao atualizar rankings:', err);
                    reject(err);
                } else {
                    console.log('   ✅ Rankings atualizados');
                    resolve();
                }
            });
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        try {
            await this.init();
            await this.scrapeFighters();
            await this.saveFightersToDatabase();
            await this.updateRankings();
            
            console.log('\n🎉 Processo concluído com sucesso!');
            console.log(`📊 Total de lutadores: ${this.fighters.length}`);
            
            // Show summary by weight class
            const summary = {};
            this.fighters.forEach(fighter => {
                if (!summary[fighter.weightClass]) {
                    summary[fighter.weightClass] = 0;
                }
                summary[fighter.weightClass]++;
            });
            
            console.log('\n📋 Resumo por categoria:');
            Object.keys(summary).forEach(weightClass => {
                console.log(`   ${weightClass}: ${summary[weightClass]} lutadores`);
            });
            
        } catch (error) {
            console.error('❌ Erro durante o processo:', error);
        } finally {
            this.db.close();
        }
    }
}

// Main execution
if (require.main === module) {
    const scraper = new TapologyFightersScraper();
    scraper.run().catch(console.error);
}

module.exports = { TapologyFightersScraper }; 