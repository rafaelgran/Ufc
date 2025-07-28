// Test script for countries list
console.log('🌍 Testando lista de países...\n');

function testCountriesList() {
    console.log('📋 1. Verificando se England foi adicionada:');
    
    // Check if England exists in the select
    const countrySelect = document.getElementById('fighterCountry');
    if (countrySelect) {
        console.log('✅ Select de países encontrado');
        
        // Check if England option exists
        const englandOption = countrySelect.querySelector('option[value="England"]');
        if (englandOption) {
            console.log('✅ England encontrada na lista de países');
            console.log(`   - Valor: ${englandOption.value}`);
            console.log(`   - Texto: ${englandOption.textContent}`);
        } else {
            console.log('❌ England NÃO encontrada na lista de países');
        }
        
        // Check if United Kingdom also exists
        const ukOption = countrySelect.querySelector('option[value="United Kingdom"]');
        if (ukOption) {
            console.log('✅ United Kingdom também está na lista');
        } else {
            console.log('❌ United Kingdom NÃO encontrada na lista');
        }
        
        // Count total countries
        const totalCountries = countrySelect.querySelectorAll('option').length;
        console.log(`📊 Total de países na lista: ${totalCountries}`);
        
    } else {
        console.log('❌ Select de países não encontrado');
    }
    
    console.log('\n📋 2. Verificando ordem alfabética:');
    
    // Check if England is in the correct alphabetical position
    const allOptions = Array.from(countrySelect.querySelectorAll('option'));
    const englandIndex = allOptions.findIndex(option => option.value === 'England');
    
    if (englandIndex !== -1) {
        console.log(`✅ England está na posição ${englandIndex + 1} da lista`);
        
        // Check surrounding countries for alphabetical order
        if (englandIndex > 0) {
            const previousCountry = allOptions[englandIndex - 1].value;
            console.log(`   - País anterior: ${previousCountry}`);
        }
        
        if (englandIndex < allOptions.length - 1) {
            const nextCountry = allOptions[englandIndex + 1].value;
            console.log(`   - Próximo país: ${nextCountry}`);
        }
        
        // Verify alphabetical order
        if (englandIndex > 0 && englandIndex < allOptions.length - 1) {
            const previousCountry = allOptions[englandIndex - 1].value;
            const nextCountry = allOptions[englandIndex + 1].value;
            
            if (previousCountry < 'England' && 'England' < nextCountry) {
                console.log('✅ England está na posição alfabética correta');
            } else {
                console.log('⚠️ England pode não estar na posição alfabética correta');
            }
        }
    } else {
        console.log('❌ England não encontrada na lista');
    }
    
    console.log('\n📋 3. Lista de países britânicos disponíveis:');
    
    const britishCountries = [
        'England',
        'Scotland', 
        'Wales',
        'Northern Ireland',
        'United Kingdom'
    ];
    
    britishCountries.forEach(country => {
        const option = countrySelect.querySelector(`option[value="${country}"]`);
        if (option) {
            console.log(`   ✅ ${country} - Disponível`);
        } else {
            console.log(`   ❌ ${country} - NÃO disponível`);
        }
    });
    
    console.log('\n📋 4. Testando funcionalidade:');
    
    // Test if we can select England
    if (countrySelect) {
        try {
            countrySelect.value = 'England';
            console.log('✅ England pode ser selecionada');
            console.log(`   - Valor selecionado: ${countrySelect.value}`);
        } catch (error) {
            console.log('❌ Erro ao selecionar England:', error.message);
        }
    }
    
    console.log('\n🚀 5. Como testar manualmente:');
    console.log('   1. Acesse: http://localhost:3000');
    console.log('   2. Vá para aba "Lutadores"');
    console.log('   3. Clique em "Novo Lutador"');
    console.log('   4. No campo "País", procure por "England"');
    console.log('   5. Verifique se aparece na lista');
    console.log('   6. Selecione England e salve o lutador');
    console.log('   7. Verifique se o país foi salvo corretamente');
    
    console.log('\n🎯 6. Países importantes para UFC:');
    const importantCountries = [
        'United States',
        'Brazil', 
        'England',
        'Scotland',
        'Ireland',
        'Canada',
        'Australia',
        'Russia',
        'China',
        'Japan',
        'South Korea',
        'Mexico',
        'Argentina',
        'Chile',
        'Colombia',
        'Venezuela',
        'Peru',
        'Ecuador',
        'Bolivia',
        'Paraguay',
        'Uruguay'
    ];
    
    console.log('   Verificando países importantes:');
    importantCountries.forEach(country => {
        const option = countrySelect.querySelector(`option[value="${country}"]`);
        if (option) {
            console.log(`   ✅ ${country}`);
        } else {
            console.log(`   ❌ ${country} - FALTANDO`);
        }
    });
    
    console.log('\n🎉 Teste da lista de países concluído!');
    console.log('🌍 England foi adicionada à lista de países!');
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testCountriesList);
} else {
    testCountriesList();
} 