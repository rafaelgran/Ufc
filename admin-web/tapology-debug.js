const axios = require('axios');
const cheerio = require('cheerio');

async function debugTapology() {
    console.log('🔍 Debugando estrutura do Tapology...');
    
    try {
        // Test different URLs
        const urls = [
            'https://www.tapology.com/fightcenter/fighters?search=UFC',
            'https://www.tapology.com/fightcenter/fighters',
            'https://www.tapology.com/fightcenter/fighters?search=Conor+McGregor',
            'https://www.tapology.com/fightcenter/fighters?search=Israel+Adesanya'
        ];

        for (const url of urls) {
            console.log(`\n📡 Testando: ${url}`);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            console.log(`   📄 Tamanho da resposta: ${response.data.length} caracteres`);
            
            // Try different selectors
            const selectors = [
                '.fighterCard',
                '.fighter-card',
                '.fighter',
                'tr',
                '.fighter-name',
                'a[href*="/fighter/"]',
                '.fighter-list-item'
            ];

            for (const selector of selectors) {
                const elements = $(selector);
                if (elements.length > 0) {
                    console.log(`   ✅ Encontrados ${elements.length} elementos com selector: ${selector}`);
                    
                    // Show first few elements
                    elements.slice(0, 3).each((index, element) => {
                        const text = $(element).text().trim().substring(0, 100);
                        console.log(`      ${index + 1}. ${text}...`);
                    });
                }
            }

            // Look for any links that might be fighters
            const fighterLinks = $('a[href*="/fighter/"]');
            console.log(`   🔗 Links de lutadores encontrados: ${fighterLinks.length}`);
            
            if (fighterLinks.length > 0) {
                fighterLinks.slice(0, 5).each((index, element) => {
                    const href = $(element).attr('href');
                    const text = $(element).text().trim();
                    console.log(`      ${index + 1}. ${text} -> ${href}`);
                });
            }

            // Look for any table rows that might contain fighter data
            const tableRows = $('tr');
            console.log(`   📊 Linhas de tabela encontradas: ${tableRows.length}`);
            
            // Check if there are any UFC-related elements
            const ufcElements = $('*:contains("UFC")');
            console.log(`   🥊 Elementos contendo "UFC": ${ufcElements.length}`);

            await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between requests
        }

    } catch (error) {
        console.error('❌ Erro ao debugar Tapology:', error.message);
    }
}

async function testSpecificFighterPage() {
    console.log('\n🎯 Testando página específica de lutador...');
    
    try {
        const url = 'https://www.tapology.com/fighter/Conor-McGregor';
        console.log(`📡 Acessando: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        
        console.log(`📄 Tamanho da resposta: ${response.data.length} caracteres`);
        
        // Look for fighter information
        const name = $('h1, .fighter-name, .name').first().text().trim();
        const record = $('.record, .fight-record, .stats').first().text().trim();
        const weightClass = $('.weight-class, .division, .category').first().text().trim();
        
        console.log(`   👤 Nome: ${name}`);
        console.log(`   📊 Record: ${record}`);
        console.log(`   ⚖️ Categoria: ${weightClass}`);
        
        // Look for any structured data
        const scripts = $('script[type="application/ld+json"]');
        console.log(`   📜 Scripts JSON-LD encontrados: ${scripts.length}`);
        
        scripts.each((index, element) => {
            try {
                const jsonData = JSON.parse($(element).html());
                console.log(`      Script ${index + 1}:`, JSON.stringify(jsonData, null, 2).substring(0, 200) + '...');
            } catch (e) {
                console.log(`      Script ${index + 1}: Erro ao parsear JSON`);
            }
        });

    } catch (error) {
        console.error('❌ Erro ao testar página específica:', error.message);
    }
}

async function runDebug() {
    console.log('🚀 Iniciando debug completo do Tapology...\n');
    
    await debugTapology();
    await testSpecificFighterPage();
    
    console.log('\n📋 Recomendações baseadas no debug:');
    console.log('1. Verificar se o site mudou sua estrutura');
    console.log('2. Tentar diferentes URLs de busca');
    console.log('3. Verificar se há proteção anti-bot');
    console.log('4. Considerar usar uma API alternativa');
}

if (require.main === module) {
    runDebug().catch(console.error);
}

module.exports = { debugTapology, testSpecificFighterPage }; 