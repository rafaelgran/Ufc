// Script de debug para verificar campos de imagem
console.log('🔍 Debug: Verificando campos de imagem...');

// Verificar se estamos na página correta
console.log('📍 URL atual:', window.location.href);

// Verificar elementos do DOM
const eventImageFile = document.getElementById('eventImageFile');
const eventImageUrl = document.getElementById('eventImageUrl');
const eventImagePreview = document.getElementById('eventImagePreview');
const eventImagePreviewImg = document.getElementById('eventImagePreviewImg');

console.log('📁 eventImageFile:', eventImageFile);
console.log('🔗 eventImageUrl:', eventImageUrl);
console.log('👁️ eventImagePreview:', eventImagePreview);
console.log('🖼️ eventImagePreviewImg:', eventImagePreviewImg);

// Verificar se o modal de eventos existe
const eventModal = document.getElementById('eventModal');
console.log('📋 eventModal:', eventModal);

// Verificar se o formulário de eventos existe
const eventForm = document.getElementById('eventForm');
console.log('📝 eventForm:', eventForm);

// Verificar se há algum erro no console
console.log('⚠️ Verifique se há erros no console do navegador');

// Função para testar se os campos funcionam
function testImageFields() {
    console.log('🧪 Testando campos de imagem...');
    
    if (eventImageFile) {
        console.log('✅ Campo de upload encontrado');
        eventImageFile.addEventListener('change', function() {
            console.log('📁 Arquivo selecionado:', this.files[0]);
        });
    } else {
        console.log('❌ Campo de upload NÃO encontrado');
    }
    
    if (eventImageUrl) {
        console.log('✅ Campo de URL encontrado');
        eventImageUrl.addEventListener('input', function() {
            console.log('🔗 URL digitada:', this.value);
        });
    } else {
        console.log('❌ Campo de URL NÃO encontrado');
    }
}

// Executar teste quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testImageFields);
} else {
    testImageFields();
}

console.log('🎯 Para abrir o modal de eventos, clique em "Novo Evento"'); 