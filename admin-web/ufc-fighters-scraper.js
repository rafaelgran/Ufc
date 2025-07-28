const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

class UFCFightersScraper {
    constructor() {
        this.db = new sqlite3.Database('./ufc_events.db');
        this.baseUrl = 'https://www.ufcstats.com/statistics/fighters';
        this.fighters = [];
    }

    async init() {
        console.log('🚀 Iniciando UFC Fighters Scraper...');
        
        // Create fighters table if not exists
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS fighters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                nickname TEXT,
                record TEXT,
                weightClass TEXT,
                ranking INTEGER,
                wins INTEGER,
                losses INTEGER,
                draws INTEGER,
                ufcStatsUrl TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    }

    async scrapeFighters() {
        try {
            console.log('📊 Extraindo dados de lutadores do UFC Stats...');
            
            // UFC Stats has fighters organized by weight classes
            const weightClasses = [
                'flyweight',
                'bantamweight', 
                'featherweight',
                'lightweight',
                'welterweight',
                'middleweight',
                'light-heavyweight',
                'heavyweight'
            ];

            for (const weightClass of weightClasses) {
                console.log(`\n🏆 Processando categoria: ${weightClass.toUpperCase()}`);
                await this.scrapeWeightClass(weightClass);
                // Small delay to be respectful to the server
                await this.delay(1000);
            }

            console.log(`\n✅ Extração concluída! ${this.fighters.length} lutadores encontrados.`);
            return this.fighters;

        } catch (error) {
            console.error('❌ Erro ao extrair lutadores:', error.message);
            throw error;
        }
    }

    async scrapeWeightClass(weightClass) {
        try {
            const url = `${this.baseUrl}?char=a&page=all&weight=${weightClass}`;
            console.log(`   📡 Acessando: ${url}`);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const fighterRows = $('.b-statistics__table-row');

            console.log(`   👥 Encontrados ${fighterRows.length} lutadores na categoria ${weightClass}`);

            fighterRows.each((index, element) => {
                if (index === 0) return; // Skip header row
                
                const $row = $(element);
                const fighter = this.parseFighterRow($row, weightClass);
                
                if (fighter && fighter.name) {
                    this.fighters.push(fighter);
                }
            });

        } catch (error) {
            console.error(`   ❌ Erro ao processar categoria ${weightClass}:`, error.message);
        }
    }

    parseFighterRow($row, weightClass) {
        try {
            const name = $row.find('.b-statistics__table-col:nth-child(1) a').text().trim();
            const nickname = $row.find('.b-statistics__table-col:nth-child(2)').text().trim();
            const record = $row.find('.b-statistics__table-col:nth-child(3)').text().trim();
            const wins = $row.find('.b-statistics__table-col:nth-child(4)').text().trim();
            const losses = $row.find('.b-statistics__table-col:nth-child(5)').text().trim();
            const draws = $row.find('.b-statistics__table-col:nth-child(6)').text().trim();
            const ufcStatsUrl = $row.find('.b-statistics__table-col:nth-child(1) a').attr('href');

            if (!name) return null;

            // Parse record (e.g., "15-3-0")
            const recordParts = record.split('-');
            const parsedWins = parseInt(wins) || 0;
            const parsedLosses = parseInt(losses) || 0;
            const parsedDraws = parseInt(draws) || 0;

            return {
                name: name,
                nickname: nickname || null,
                record: record,
                weightClass: this.normalizeWeightClass(weightClass),
                wins: parsedWins,
                losses: parsedLosses,
                draws: parsedDraws,
                ufcStatsUrl: ufcStatsUrl || null
            };

        } catch (error) {
            console.error('   ❌ Erro ao parsear linha do lutador:', error.message);
            return null;
        }
    }

    normalizeWeightClass(weightClass) {
        const mapping = {
            'flyweight': 'Flyweight',
            'bantamweight': 'Bantamweight',
            'featherweight': 'Featherweight',
            'lightweight': 'Lightweight',
            'welterweight': 'Welterweight',
            'middleweight': 'Middleweight',
            'light-heavyweight': 'Light Heavyweight',
            'heavyweight': 'Heavyweight'
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

                        // Progress indicator
                        if ((index + 1) % 50 === 0) {
                            console.log(`   📊 Progresso: ${index + 1}/${this.fighters.length} lutadores processados`);
                        }

                        // Check if all fighters have been processed
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

    async getTopRankedFighters() {
        console.log('\n🏆 Extraindo lutadores top ranked...');
        
        // Get top 15 fighters from each weight class
        const topFighters = [];
        
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT name, nickname, record, weightClass, wins, losses, draws
                FROM fighters 
                WHERE wins > 0
                ORDER BY weightClass, wins DESC, losses ASC
                LIMIT 120
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Group by weight class and assign rankings
                    const grouped = {};
                    rows.forEach(fighter => {
                        if (!grouped[fighter.weightClass]) {
                            grouped[fighter.weightClass] = [];
                        }
                        grouped[fighter.weightClass].push(fighter);
                    });

                    // Assign rankings (top 15 per weight class)
                    Object.keys(grouped).forEach(weightClass => {
                        grouped[weightClass].slice(0, 15).forEach((fighter, index) => {
                            topFighters.push({
                                ...fighter,
                                ranking: index + 1
                            });
                        });
                    });

                    console.log(`   📊 ${topFighters.length} lutadores top ranked extraídos`);
                    resolve(topFighters);
                }
            });
        });
    }

    async updateRankings() {
        console.log('\n📈 Atualizando rankings...');
        
        const topFighters = await this.getTopRankedFighters();
        
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('UPDATE fighters SET ranking = ? WHERE name = ? AND weightClass = ?');
            
            let updated = 0;
            topFighters.forEach((fighter, index) => {
                stmt.run([fighter.ranking, fighter.name, fighter.weightClass], function(err) {
                    if (err) {
                        console.error(`   ❌ Erro ao atualizar ranking de ${fighter.name}:`, err.message);
                    } else {
                        updated++;
                    }

                    if (index === topFighters.length - 1) {
                        stmt.finalize((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log(`   ✅ ${updated} rankings atualizados`);
                                resolve(updated);
                            }
                        });
                    }
                });
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

// Sample data for testing (when scraping fails)
const sampleFighters = [
    {
        name: 'Israel Adesanya',
        nickname: 'The Last Stylebender',
        record: '24-3-0',
        weightClass: 'Middleweight',
        wins: 24,
        losses: 3,
        draws: 0,
        ranking: 1
    },
    {
        name: 'Dricus Du Plessis',
        nickname: 'Stillknocks',
        record: '21-2-0',
        weightClass: 'Middleweight',
        wins: 21,
        losses: 2,
        draws: 0,
        ranking: 2
    },
    {
        name: 'Alex Pereira',
        nickname: 'Poatan',
        record: '9-2-0',
        weightClass: 'Light Heavyweight',
        wins: 9,
        losses: 2,
        draws: 0,
        ranking: 1
    },
    {
        name: 'Jiri Prochazka',
        nickname: 'BJP',
        record: '29-4-1',
        weightClass: 'Light Heavyweight',
        wins: 29,
        losses: 4,
        draws: 1,
        ranking: 2
    },
    {
        name: 'Sean O\'Malley',
        nickname: 'Sugar',
        record: '17-1-0',
        weightClass: 'Bantamweight',
        wins: 17,
        losses: 1,
        draws: 0,
        ranking: 1
    },
    {
        name: 'Merab Dvalishvili',
        nickname: 'The Machine',
        record: '16-4-0',
        weightClass: 'Bantamweight',
        wins: 16,
        losses: 4,
        draws: 0,
        ranking: 2
    },
    {
        name: 'Leon Edwards',
        nickname: 'Rocky',
        record: '22-3-0',
        weightClass: 'Welterweight',
        wins: 22,
        losses: 3,
        draws: 0,
        ranking: 1
    },
    {
        name: 'Kamaru Usman',
        nickname: 'The Nigerian Nightmare',
        record: '20-4-0',
        weightClass: 'Welterweight',
        wins: 20,
        losses: 4,
        draws: 0,
        ranking: 2
    },
    {
        name: 'Conor McGregor',
        nickname: 'The Notorious',
        record: '22-6-0',
        weightClass: 'Lightweight',
        wins: 22,
        losses: 6,
        draws: 0,
        ranking: 1
    },
    {
        name: 'Michael Chandler',
        nickname: 'Iron',
        record: '23-8-0',
        weightClass: 'Lightweight',
        wins: 23,
        losses: 8,
        draws: 0,
        ranking: 2
    }
];

// Function to insert sample data
async function insertSampleFighters() {
    const db = new sqlite3.Database('./ufc_events.db');
    
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM fighters', (err) => {
            if (err) {
                reject(err);
                return;
            }

            const stmt = db.prepare(`
                INSERT INTO fighters (name, nickname, record, weightClass, wins, losses, draws, ranking)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            sampleFighters.forEach((fighter, index) => {
                const recordParts = fighter.record.split('-');
                stmt.run([
                    fighter.name,
                    fighter.nickname,
                    fighter.record,
                    fighter.weightClass,
                    fighter.wins,
                    fighter.losses,
                    fighter.draws,
                    fighter.ranking
                ], function(err) {
                    if (err) {
                        console.error(`❌ Erro ao inserir ${fighter.name}:`, err.message);
                    } else {
                        console.log(`✅ ${fighter.name} inserido`);
                    }

                    if (index === sampleFighters.length - 1) {
                        stmt.finalize((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log(`\n🎉 ${sampleFighters.length} lutadores de exemplo inseridos!`);
                                resolve();
                            }
                        });
                    }
                });
            });
        });
    }).finally(() => {
        db.close();
    });
}

// Main execution
if (require.main === module) {
    const scraper = new UFCFightersScraper();
    
    // Check if user wants to use sample data or scrape
    const useSample = process.argv.includes('--sample');
    
    if (useSample) {
        console.log('🎯 Usando dados de exemplo...');
        insertSampleFighters()
            .then(() => console.log('✅ Dados de exemplo inseridos com sucesso!'))
            .catch(err => console.error('❌ Erro:', err));
    } else {
        console.log('🌐 Iniciando web scraping do UFC Stats...');
        scraper.run()
            .catch(err => {
                console.error('❌ Erro no scraping, usando dados de exemplo...');
                return insertSampleFighters();
            })
            .then(() => console.log('✅ Processo finalizado!'));
    }
}

module.exports = { UFCFightersScraper, insertSampleFighters }; 