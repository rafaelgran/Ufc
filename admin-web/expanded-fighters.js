const sqlite3 = require('sqlite3').verbose();

// Expanded UFC fighters data based on real information
const expandedFighters = [
    // Bantamweight
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
        name: 'Cory Sandhagen',
        nickname: 'The Sandman',
        record: '17-4-0',
        weightClass: 'Bantamweight',
        wins: 17,
        losses: 4,
        draws: 0,
        ranking: 3
    },
    {
        name: 'Umar Nurmagomedov',
        nickname: 'Young Eagle',
        record: '17-0-0',
        weightClass: 'Bantamweight',
        wins: 17,
        losses: 0,
        draws: 0,
        ranking: 4
    },
    {
        name: 'Marlon Vera',
        nickname: 'Chito',
        record: '23-8-1',
        weightClass: 'Bantamweight',
        wins: 23,
        losses: 8,
        draws: 1,
        ranking: 5
    },

    // Featherweight
    {
        name: 'Ilia Topuria',
        nickname: 'El Matador',
        record: '15-0-0',
        weightClass: 'Featherweight',
        wins: 15,
        losses: 0,
        draws: 0,
        ranking: 1
    },
    {
        name: 'Alexander Volkanovski',
        nickname: 'The Great',
        record: '26-4-0',
        weightClass: 'Featherweight',
        wins: 26,
        losses: 4,
        draws: 0,
        ranking: 2
    },
    {
        name: 'Max Holloway',
        nickname: 'Blessed',
        record: '25-7-0',
        weightClass: 'Featherweight',
        wins: 25,
        losses: 7,
        draws: 0,
        ranking: 3
    },
    {
        name: 'Brian Ortega',
        nickname: 'T-City',
        record: '16-3-0',
        weightClass: 'Featherweight',
        wins: 16,
        losses: 3,
        draws: 0,
        ranking: 4
    },
    {
        name: 'Yair Rodriguez',
        nickname: 'El Pantera',
        record: '16-4-0',
        weightClass: 'Featherweight',
        wins: 16,
        losses: 4,
        draws: 0,
        ranking: 5
    },

    // Lightweight
    {
        name: 'Islam Makhachev',
        nickname: 'The Eagle',
        record: '25-1-0',
        weightClass: 'Lightweight',
        wins: 25,
        losses: 1,
        draws: 0,
        ranking: 1
    },
    {
        name: 'Charles Oliveira',
        nickname: 'Do Bronx',
        record: '34-10-0',
        weightClass: 'Lightweight',
        wins: 34,
        losses: 10,
        draws: 0,
        ranking: 2
    },
    {
        name: 'Justin Gaethje',
        nickname: 'The Highlight',
        record: '25-4-0',
        weightClass: 'Lightweight',
        wins: 25,
        losses: 4,
        draws: 0,
        ranking: 3
    },
    {
        name: 'Dustin Poirier',
        nickname: 'The Diamond',
        record: '30-8-0',
        weightClass: 'Lightweight',
        wins: 30,
        losses: 8,
        draws: 0,
        ranking: 4
    },
    {
        name: 'Arman Tsarukyan',
        nickname: 'Ahalkalakets',
        record: '21-3-0',
        weightClass: 'Lightweight',
        wins: 21,
        losses: 3,
        draws: 0,
        ranking: 5
    },

    // Welterweight
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
        name: 'Belal Muhammad',
        nickname: 'Remember the Name',
        record: '23-3-0',
        weightClass: 'Welterweight',
        wins: 23,
        losses: 3,
        draws: 0,
        ranking: 2
    },
    {
        name: 'Shavkat Rakhmonov',
        nickname: 'Nomad',
        record: '17-0-0',
        weightClass: 'Welterweight',
        wins: 17,
        losses: 0,
        draws: 0,
        ranking: 3
    },
    {
        name: 'Kamaru Usman',
        nickname: 'The Nigerian Nightmare',
        record: '20-4-0',
        weightClass: 'Welterweight',
        wins: 20,
        losses: 4,
        draws: 0,
        ranking: 4
    },
    {
        name: 'Colby Covington',
        nickname: 'Chaos',
        record: '17-4-0',
        weightClass: 'Welterweight',
        wins: 17,
        losses: 4,
        draws: 0,
        ranking: 5
    },

    // Middleweight
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
        name: 'Sean Strickland',
        nickname: 'Tarzan',
        record: '28-5-0',
        weightClass: 'Middleweight',
        wins: 28,
        losses: 5,
        draws: 0,
        ranking: 3
    },
    {
        name: 'Robert Whittaker',
        nickname: 'The Reaper',
        record: '25-7-0',
        weightClass: 'Middleweight',
        wins: 25,
        losses: 7,
        draws: 0,
        ranking: 4
    },
    {
        name: 'Jared Cannonier',
        nickname: 'The Killa Gorilla',
        record: '17-6-0',
        weightClass: 'Middleweight',
        wins: 17,
        losses: 6,
        draws: 0,
        ranking: 5
    },

    // Light Heavyweight
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
        name: 'Jamahal Hill',
        nickname: 'Sweet Dreams',
        record: '12-1-0',
        weightClass: 'Light Heavyweight',
        wins: 12,
        losses: 1,
        draws: 0,
        ranking: 3
    },
    {
        name: 'Magomed Ankalaev',
        nickname: 'Wolf',
        record: '18-1-1',
        weightClass: 'Light Heavyweight',
        wins: 18,
        losses: 1,
        draws: 1,
        ranking: 4
    },
    {
        name: 'Jan Blachowicz',
        nickname: 'Legendary Polish Power',
        record: '29-10-1',
        weightClass: 'Light Heavyweight',
        wins: 29,
        losses: 10,
        draws: 1,
        ranking: 5
    },

    // Heavyweight
    {
        name: 'Tom Aspinall',
        nickname: 'The Hulk',
        record: '14-3-0',
        weightClass: 'Heavyweight',
        wins: 14,
        losses: 3,
        draws: 0,
        ranking: 1
    },
    {
        name: 'Curtis Blaydes',
        nickname: 'Razor',
        record: '18-4-0',
        weightClass: 'Heavyweight',
        wins: 18,
        losses: 4,
        draws: 0,
        ranking: 2
    },
    {
        name: 'Ciryl Gane',
        nickname: 'Bon Gamin',
        record: '12-2-0',
        weightClass: 'Heavyweight',
        wins: 12,
        losses: 2,
        draws: 0,
        ranking: 3
    },
    {
        name: 'Sergei Pavlovich',
        nickname: 'Polar Bear',
        record: '18-2-0',
        weightClass: 'Heavyweight',
        wins: 18,
        losses: 2,
        draws: 0,
        ranking: 4
    },
    {
        name: 'Alexander Volkov',
        nickname: 'Drago',
        record: '37-10-0',
        weightClass: 'Heavyweight',
        wins: 37,
        losses: 10,
        draws: 0,
        ranking: 5
    },

    // Flyweight
    {
        name: 'Brandon Moreno',
        nickname: 'The Assassin Baby',
        record: '21-7-2',
        weightClass: 'Flyweight',
        wins: 21,
        losses: 7,
        draws: 2,
        ranking: 1
    },
    {
        name: 'Brandon Royval',
        nickname: 'Raw Dawg',
        record: '16-6-0',
        weightClass: 'Flyweight',
        wins: 16,
        losses: 6,
        draws: 0,
        ranking: 2
    },
    {
        name: 'Amir Albazi',
        nickname: 'The Prince',
        record: '17-1-0',
        weightClass: 'Flyweight',
        wins: 17,
        losses: 1,
        draws: 0,
        ranking: 3
    },
    {
        name: 'Kai Kara-France',
        nickname: 'Don\'t Blink',
        record: '24-11-0',
        weightClass: 'Flyweight',
        wins: 24,
        losses: 11,
        draws: 0,
        ranking: 4
    },
    {
        name: 'Matheus Nicolau',
        nickname: 'The Buraka',
        record: '19-4-1',
        weightClass: 'Flyweight',
        wins: 19,
        losses: 4,
        draws: 1,
        ranking: 5
    }
];

async function insertExpandedFighters() {
    const db = new sqlite3.Database('./ufc_events.db');
    
    return new Promise((resolve, reject) => {
        console.log('🗑️ Limpando tabela de lutadores...');
        
        db.run('DELETE FROM fighters', (err) => {
            if (err) {
                reject(err);
                return;
            }

            console.log('✅ Tabela limpa. Inserindo lutadores expandidos...');

            const stmt = db.prepare(`
                INSERT INTO fighters (name, nickname, record, weightClass, wins, losses, draws, ranking)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let inserted = 0;
            let errors = 0;

            expandedFighters.forEach((fighter, index) => {
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
                        errors++;
                    } else {
                        inserted++;
                        if (inserted % 10 === 0) {
                            console.log(`   📊 Progresso: ${inserted}/${expandedFighters.length} lutadores inseridos`);
                        }
                    }

                    if (index === expandedFighters.length - 1) {
                        stmt.finalize((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log(`\n🎉 Concluído! ${inserted} lutadores inseridos, ${errors} erros.`);
                                
                                // Show summary by weight class
                                const summary = {};
                                expandedFighters.forEach(f => {
                                    if (!summary[f.weightClass]) {
                                        summary[f.weightClass] = 0;
                                    }
                                    summary[f.weightClass]++;
                                });
                                
                                console.log('\n📋 Resumo por categoria:');
                                Object.keys(summary).forEach(weightClass => {
                                    console.log(`   ${weightClass}: ${summary[weightClass]} lutadores`);
                                });
                                
                                resolve({ inserted, errors });
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
    console.log('🚀 Inserindo lutadores UFC expandidos...');
    console.log(`📊 Total de lutadores: ${expandedFighters.length}`);
    
    insertExpandedFighters()
        .then(({ inserted, errors }) => {
            console.log(`\n✅ Processo finalizado! ${inserted} lutadores inseridos com sucesso.`);
            if (errors > 0) {
                console.log(`⚠️ ${errors} erros encontrados.`);
            }
        })
        .catch(err => {
            console.error('❌ Erro:', err);
        });
}

module.exports = { expandedFighters, insertExpandedFighters }; 