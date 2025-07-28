const axios = require('axios');
const cheerio = require('cheerio');

async function testUFCAccess() {
    console.log('🧪 Testando acesso ao UFC Stats...');
    
    try {
        // Test UFC Stats main page
        const response = await axios.get('https://www.ufcstats.com/statistics/fighters?char=a&page=all&weight=middleweight', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        console.log('✅ Conseguiu acessar UFC Stats!');
        console.log(`📄 Tamanho da resposta: ${response.data.length} caracteres`);

        const $ = cheerio.load(response.data);
        const fighterRows = $('.b-statistics__table-row');
        
        console.log(`👥 Encontrados ${fighterRows.length} elementos na tabela`);
        
        // Try to parse first few fighters
        let parsedCount = 0;
        fighterRows.each((index, element) => {
            if (index === 0) return; // Skip header
            if (parsedCount >= 5) return; // Only parse first 5
            
            const $row = $(element);
            const name = $row.find('.b-statistics__table-col:nth-child(1) a').text().trim();
            const nickname = $row.find('.b-statistics__table-col:nth-child(2)').text().trim();
            const record = $row.find('.b-statistics__table-col:nth-child(3)').text().trim();
            
            if (name) {
                console.log(`   ${parsedCount + 1}. ${name} (${nickname}) - ${record}`);
                parsedCount++;
            }
        });

        if (parsedCount > 0) {
            console.log(`\n✅ Parseamento funcionou! ${parsedCount} lutadores extraídos.`);
            return true;
        } else {
            console.log('❌ Nenhum lutador foi parseado corretamente.');
            return false;
        }

    } catch (error) {
        console.error('❌ Erro ao acessar UFC Stats:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Dica: O site pode estar bloqueando requisições automatizadas.');
        } else if (error.code === 'ENOTFOUND') {
            console.log('💡 Dica: Verifique sua conexão com a internet.');
        }
        
        return false;
    }
}

async function testAlternativeSources() {
    console.log('\n🔍 Testando fontes alternativas...');
    
    const sources = [
        {
            name: 'Sherdog',
            url: 'https://www.sherdog.com/fighter/Conor-McGregor-29642'
        },
        {
            name: 'Tapology',
            url: 'https://www.tapology.com/fightcenter/fighters'
        }
    ];

    for (const source of sources) {
        try {
            console.log(`\n📡 Testando ${source.name}...`);
            const response = await axios.get(source.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 5000
            });
            
            console.log(`✅ ${source.name} acessível (${response.data.length} caracteres)`);
            
        } catch (error) {
            console.log(`❌ ${source.name} não acessível: ${error.message}`);
        }
    }
}

async function runTests() {
    console.log('🚀 Iniciando testes de acesso a APIs UFC...\n');
    
    const ufcAccess = await testUFCAccess();
    
    if (!ufcAccess) {
        await testAlternativeSources();
    }
    
    console.log('\n📋 Recomendações:');
    
    if (ufcAccess) {
        console.log('✅ UFC Stats está acessível - você pode usar o scraper completo');
        console.log('💡 Execute: node ufc-fighters-scraper.js');
    } else {
        console.log('❌ UFC Stats não está acessível - use dados de exemplo');
        console.log('💡 Execute: node ufc-fighters-scraper.js --sample');
        console.log('💡 Ou considere usar uma API paga como SportsData.io');
    }
    
    console.log('\n🔗 APIs UFC disponíveis:');
    console.log('   • UFC Stats (gratuita, web scraping)');
    console.log('   • SportsData.io (paga, API estruturada)');
    console.log('   • Sherdog (gratuita, web scraping)');
    console.log('   • Tapology (gratuita, web scraping)');
}

if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testUFCAccess, testAlternativeSources }; 