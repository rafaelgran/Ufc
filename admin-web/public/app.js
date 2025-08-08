// Global variables
let socket;
let currentFight = null;
let fightTimer = null;
let currentRoundTime = 300; // 5 minutes in seconds
let isPaused = false;
let currentEventFilter = 'upcoming';
let selectedEvent = null;

let currentControlFight = null;
let fightTimerInterval = null;
let fightStartTime = null;
let totalFightTime = 0; // Tempo total da luta em segundos

// Tab management
const TAB_ANCHORS = {
    'events': '#events',
    'fighters': '#fighters', 
    'live': '#live',
    'event-details': '#event-details'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    loadData();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Initialize tab management
    initializeTabManagement();
    
    // Form event listeners
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }
    
    const eventDetailsForm = document.getElementById('eventDetailsForm');
    if (eventDetailsForm) {
        eventDetailsForm.addEventListener('submit', handleEventDetailsSubmit);
    }
    
    const fighterForm = document.getElementById('fighterForm');
    if (fighterForm) {
        fighterForm.addEventListener('submit', handleFighterSubmit);
    }
    
    const fightForm = document.getElementById('fightForm');
    if (fightForm) {
        fightForm.addEventListener('submit', handleFightSubmit);
    }
    
    // Initialize record calculation when fighter modal is shown
    const fighterModal = document.getElementById('fighterModal');
    if (fighterModal) {
        fighterModal.addEventListener('shown.bs.modal', function () {
            calculateRecord();
        });
    }
    
    // Fight modal event listeners
    const fightWeightClass = document.getElementById('fightWeightClass');
    if (fightWeightClass) {
        fightWeightClass.addEventListener('change', filterFightersByWeightClass);
    }
    
    // Live control event listeners
    const liveFightSelect = document.getElementById('liveFightSelect');
    if (liveFightSelect) {
        liveFightSelect.addEventListener('change', handleLiveFightSelect);
    }
    
    const startFightBtn = document.getElementById('startFightBtn');
    if (startFightBtn) {
        startFightBtn.addEventListener('click', startFight);
    }
    
    const pauseFightBtn = document.getElementById('pauseFightBtn');
    if (pauseFightBtn) {
        pauseFightBtn.addEventListener('click', pauseFight);
    }
    
    const resumeFightBtn = document.getElementById('resumeFightBtn');
    if (resumeFightBtn) {
        resumeFightBtn.addEventListener('click', resumeFight);
    }
    
    const endFightBtn = document.getElementById('endFightBtn');
    if (endFightBtn) {
        endFightBtn.addEventListener('click', endFight);
    }
    
    // Event listener para preview de imagem do evento (arquivo)
    const eventImageFile = document.getElementById('eventImageFile');
    if (eventImageFile) {
        eventImageFile.addEventListener('change', function() {
            const file = this.files[0];
            const previewDiv = document.getElementById('eventImagePreview');
            const previewImg = document.getElementById('eventImagePreviewImg');
            
            if (file) {
                // Validar tipo de arquivo
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas arquivos de imagem.');
                    this.value = '';
                    return;
                }
                
                // Validar tamanho (máximo 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 2MB.');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewDiv.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewDiv.style.display = 'none';
            }
        });
    }
    

    
    // Event listeners para campos de imagem na página de detalhes
    const eventDetailsImageFile = document.getElementById('eventDetailsImageFile');
    if (eventDetailsImageFile) {
        eventDetailsImageFile.addEventListener('change', function() {
            const file = this.files[0];
            const previewDiv = document.getElementById('eventDetailsImagePreview');
            const previewImg = document.getElementById('eventDetailsImagePreviewImg');
            
            if (file) {
                // Validar tipo de arquivo
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas arquivos de imagem.');
                    this.value = '';
                    return;
                }
                
                // Validar tamanho (máximo 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 2MB.');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewDiv.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewDiv.style.display = 'none';
            }
        });
    }
    

});

// Tab management functions
function initializeTabManagement() {
    console.log('Initializing tab management...');
    
    // Check if there's a hash in the URL
    const hash = window.location.hash.substring(1);
    console.log('Current hash:', hash);
    
    // Check if it's an event hash
    if (hash.startsWith('event-')) {
        console.log('🔍 Event hash detected on init:', hash);
        // Don't activate tab here, let restoreSelectedEvent handle it
        return;
    }
    
    if (hash && TAB_ANCHORS[hash]) {
        // Activate the tab from the URL hash
        console.log('Activating tab from hash:', hash);
        activateTab(hash);
    } else {
        // Default to events tab
        console.log('No valid hash, defaulting to events tab');
        activateTab('events');
    }
    
    // Listen for hash changes (only for direct URL access)
    window.addEventListener('hashchange', function() {
        const newHash = window.location.hash.substring(1);
        console.log('Hash changed to:', newHash);
        
        // Check if it's an event hash
        if (newHash.startsWith('event-')) {
            console.log('🔍 Event hash detected:', newHash);
            // Don't activate tab here, let restoreSelectedEvent handle it
            return;
        }
        
        // Only activate tab if it's a direct URL access (not from navigateToTab)
        if (newHash && TAB_ANCHORS[newHash]) {
            console.log('Direct URL access detected, activating tab:', newHash);
            activateTab(newHash);
        }
    });
    
    // Add click listeners to tab buttons
    Object.keys(TAB_ANCHORS).forEach(tabId => {
        const tabButton = document.getElementById(`${tabId}-tab`);
        if (tabButton) {
            tabButton.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToTab(tabId);
            });
        } else {
            console.warn('Tab button not found:', tabId);
        }
    });
}

function activateTab(tabId) {
    // Remove active class from all tabs
    Object.keys(TAB_ANCHORS).forEach(id => {
        const tabButton = document.getElementById(`${id}-tab`);
        const tabPane = document.getElementById(id);
        
        if (tabButton) {
            tabButton.classList.remove('active');
            tabButton.setAttribute('aria-selected', 'false');
        }
        
        if (tabPane) {
            tabPane.classList.remove('show', 'active');
        }
    });
    
    // Activate the selected tab
    const activeTabButton = document.getElementById(`${tabId}-tab`);
    const activeTabPane = document.getElementById(tabId);
    
    if (activeTabButton) {
        activeTabButton.classList.add('active');
        activeTabButton.setAttribute('aria-selected', 'true');
    } else {
        console.warn('Active tab button not found:', tabId);
    }
    
    if (activeTabPane) {
        activeTabPane.classList.add('show', 'active');
    } else {
        console.warn('Active tab pane not found:', tabId);
    }
    
    // Don't update URL hash here to avoid conflicts
    // The hash is already set by navigateToTab or other functions
}

function navigateToTab(tabId) {
    console.log('Navigating to tab:', tabId);
    
    // Check if it's an event hash (for specific event navigation)
    if (tabId.startsWith('event-') && tabId !== 'event-details') {
        console.log('🔍 Event hash detected in navigateToTab:', tabId);
        // Don't activate tab here, let restoreSelectedEvent handle it
        window.location.hash = tabId;
        return;
    }
    
    // Clear any selected event when navigating to other tabs
    if (tabId === 'events' || tabId === 'fighters') {
        selectedEvent = null;
        localStorage.removeItem('selectedEventId');
    }
    
    // Update URL hash and activate tab directly
    window.location.hash = tabId;
    activateTab(tabId);
}

// Socket.io initialization
function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('fightUpdate', (data) => {
        console.log('Fight update received:', data);
            updateLiveFightDisplay(data);
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// API helper function
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`/api/${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response has content (for DELETE operations that return 204)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return null; // For empty responses like DELETE
        }
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Load all data
async function loadData() {
    try {
        console.log('=== LOADING ALL DATA ===');
        
        // Load all data in parallel
        const [events, fighters, fights] = await Promise.all([
            apiCall('events'),
            apiCall('fighters'),
            apiCall('fights')
        ]);
        
        // Store data globally
        window.eventsData = events;
        window.fightersData = fighters;
        window.fightsData = fights;
        
        console.log('Data loaded:', {
            events: events.length,
            fighters: fighters.length,
            fights: fights.length
        });
        
        // Display events after all data is loaded
        displayEvents(events);
        
        // Display fighters
        displayFighters(fighters);
        
        // Handle navigation based on current hash
        // Use setTimeout to ensure DOM is ready
        setTimeout(async () => {
            await handleInitialNavigation();
        }, 100);
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Handle initial navigation based on current hash
async function handleInitialNavigation() {
    try {
        const hash = window.location.hash;
        console.log('🔍 Handling initial navigation for hash:', hash);
        
        // Handle event-specific navigation
        if (hash.startsWith('#event-')) {
            await restoreSelectedEvent();
            return;
        }
        
        // Handle tab navigation
        const tabId = hash.replace('#', '');
        if (tabId && ['events', 'fighters', 'event-details'].includes(tabId)) {
            console.log('✅ Activating tab:', tabId);
            activateTab(tabId);
            return;
        }
        
        // Handle empty hash or invalid hash
        if (!hash || hash === '#') {
            // Check if there's a saved event in localStorage
            const savedEventId = localStorage.getItem('selectedEventId');
            if (savedEventId) {
                console.log('🔍 Found saved event, restoring...');
                await restoreSelectedEvent();
            } else {
                console.log('✅ No saved state, going to events tab');
                window.location.hash = 'events';
                activateTab('events');
            }
            return;
        }
        
        // Fallback to events tab for unknown hashes
        console.log('⚠️ Unknown hash, falling back to events tab');
        window.location.hash = 'events';
        activateTab('events');
        
    } catch (error) {
        console.error('❌ Error handling initial navigation:', error);
        // Fallback to events tab
        window.location.hash = 'events';
        activateTab('events');
    }
}

// Restore selected event from localStorage or hash
async function restoreSelectedEvent() {
    try {
        let eventId = null;
        
        // Check hash first (priority)
        const hash = window.location.hash;
        if (hash.startsWith('#event-')) {
            eventId = hash.replace('#event-', '');
            console.log('🔍 Event ID found in hash:', eventId);
        } else {
            // Check localStorage
            eventId = localStorage.getItem('selectedEventId');
            if (eventId) {
                console.log('🔍 Event ID found in localStorage:', eventId);
                // Update hash to match localStorage
                window.location.hash = `event-${eventId}`;
            }
        }
        
        if (eventId && window.eventsData) {
            const event = window.eventsData.find(e => e.id == eventId);
            if (event) {
                console.log('✅ Restoring event:', event.name);
                selectedEvent = event;
                navigateToEventDetails(event);
                activateTab('event-details');
                return;
            } else {
                console.log('❌ Event not found in data, clearing saved state');
                localStorage.removeItem('selectedEventId');
                window.location.hash = 'events';
                activateTab('events');
            }
        }
        
        // If no event to restore, go to events tab
        if (!eventId) {
            activateTab('events');
        }
    } catch (error) {
        console.error('❌ Error restoring selected event:', error);
        // Fallback to events tab
        navigateToTab('events');
    }
}

// Events management
async function loadEvents() {
    try {
        console.log('=== LOADING EVENTS ===');
        const events = await apiCall('events');
        console.log('API response events:', events);
        
        // Store events globally for use in other functions
        window.eventsData = events;
        
        // Note: displayEvents is now called by loadData() after all data is loaded
        return events;
    } catch (error) {
        console.error('Failed to load events:', error);
        return [];
    }
}

function displayEvents(events) {
    console.log('=== DISPLAY EVENTS ===');
    console.log('Events data:', events);
    console.log('Events length:', events.length);
    
    const container = document.getElementById('eventsList');
    console.log('Container element:', container);
    
    if (events.length === 0) {
        console.log('No events found, showing empty message');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>Nenhum evento encontrado.</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#eventModal">
                    <i class="fas fa-plus me-2"></i>Criar Primeiro Evento
                </button>
            </div>
        `;
        return;
    }
    
    // Filter events based on current filter
    const filteredEvents = filterEventsByType(events, currentEventFilter);
    
    if (filteredEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>Nenhum evento ${currentEventFilter === 'upcoming' ? 'futuro' : 'passado'} encontrado.</p>
            </div>
        `;
        return;
    }
    
    console.log('Creating cards for events');
    const eventsHTML = filteredEvents.map(event => createEventCard(event)).join('');
    container.innerHTML = eventsHTML;
    console.log('=== DISPLAY EVENTS COMPLETE ===');
}

function filterEventsByType(events, filterType) {
    const now = new Date();
    
    return events.filter(event => {
        const eventDate = new Date(event.date);
        
        if (filterType === 'upcoming') {
            return eventDate > now;
        } else {
            return eventDate <= now;
        }
    });
}

// Função auxiliar para obter o sobrenome de um lutador
function getFighterLastName(fullName) {
    if (!fullName) return 'N/A';
    const nameParts = fullName.trim().split(' ');
    return nameParts.length > 1 ? nameParts.slice(1).join(' ') : fullName;
}

// Função auxiliar para obter a luta principal de um evento
function getMainEventFight(eventId) {
    if (!window.fightsData) return null;
    
    const eventFights = window.fightsData.filter(fight => 
        fight.eventId == eventId || fight.eventid == eventId
    );
    
    // Buscar lutas do card principal
    const mainCardFights = eventFights.filter(fight => 
        fight.fightType === 'main' || fight.fighttype === 'main'
    );
    
    // Ordenar por fightorder e pegar a primeira (luta principal)
    mainCardFights.sort((a, b) => (a.fightOrder || a.fightorder || 0) - (b.fightOrder || b.fightorder || 0));
    
    return mainCardFights.length > 0 ? mainCardFights[0] : null;
}

function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Obter a luta principal
    const mainFight = getMainEventFight(event.id);
    let mainFightHtml = '';
    
    if (mainFight) {
        // Buscar dados dos lutadores
        const fighter1 = window.fightersData ? window.fightersData.find(f => 
            f.id == mainFight.fighter1Id || f.id == mainFight.fighter1id
        ) : null;
        const fighter2 = window.fightersData ? window.fightersData.find(f => 
            f.id == mainFight.fighter2Id || f.id == mainFight.fighter2id
        ) : null;
        
        if (fighter1 && fighter2) {
            const fighter1LastName = getFighterLastName(fighter1.name);
            const fighter2LastName = getFighterLastName(fighter2.name);
            const weightClass = mainFight.weightClass || mainFight.weightclass || 'N/A';
            
            mainFightHtml = `
                <div class="main-fight-info">
                    <div class="main-fight-title">
                        <i class="fas fa-crown me-1" style="color: #ffd700;"></i>Luta Principal
                    </div>
                    <div class="main-fight-fighters">
                        ${fighter1LastName} vs ${fighter2LastName}
                    </div>
                    <div class="main-fight-weight">
                        ${weightClass}
                    </div>
                </div>
            `;
        }
    }
    
    const imageHtml = event.image ? `
        <div class="event-image">
            <img src="${event.image}" alt="${event.name}" class="img-fluid rounded" style="max-height: 150px; width: 100%; object-fit: cover;">
        </div>
    ` : '';
    
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="event-card" onclick="selectEvent(${event.id})" data-event-id="${event.id}">
                ${imageHtml}
                <div class="event-title">${event.name}</div>
                ${mainFightHtml}
                <div class="event-date">
                    <i class="fas fa-calendar me-2"></i>${formattedDate}
                </div>
                <div class="event-location">
                    <i class="fas fa-map-marker-alt me-2"></i>${event.location || 'Local não definido'}
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary btn-sm" onclick="selectEvent(${event.id}); event.stopPropagation();">
                        <i class="fas fa-eye me-1"></i>Ver Detalhes
                    </button>
                    <button class="btn btn-secondary btn-sm ms-2" onclick="deleteEvent(${event.id}); event.stopPropagation();">
                        <i class="fas fa-trash me-1"></i>Excluir
                    </button>
                </div>
            </div>
        </div>
    `;
}

function selectEvent(eventId) {
    // Find event data
    const event = window.eventsData.find(e => e.id == eventId);
    if (!event) return;
    
    selectedEvent = event;
    
    // Save selected event to localStorage
    localStorage.setItem('selectedEventId', eventId);
    
    // Navigate to event details page with hash
    navigateToEventDetails(event);
    
    // Update URL hash and activate tab
    window.location.hash = `event-${eventId}`;
    activateTab('event-details');
}

function navigateToEventDetails(event) {
    // Fill the sidebar form
    document.getElementById('eventDetailsId').value = event.id;
    document.getElementById('eventDetailsName').value = event.name;
    
    // Tratar formato de data para datetime-local
    let dateValue = event.date;
    if (dateValue) {
        // Se a data vem do Supabase, pode estar em formato ISO
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            // Converter para formato datetime-local (YYYY-MM-DDTHH:MM)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            // Fallback para o formato antigo
            dateValue = event.date.replace(' ', 'T');
        }
    }
    document.getElementById('eventDetailsDateTime').value = dateValue;
    
    document.getElementById('eventDetailsLocation').value = event.location || '';
    document.getElementById('eventDetailsVenue').value = event.venue || '';
    
    // Update image fields
    document.getElementById('eventDetailsImageFile').value = '';
    
    // Update title
    document.getElementById('eventDetailsTitle').textContent = event.name;
    
    // Update event image if exists
    const eventImageContainer = document.getElementById('eventDetailsImage');
    if (eventImageContainer) {
        if (event.image) {
            eventImageContainer.innerHTML = `
                <img src="${event.image}" alt="${event.name}" class="img-fluid rounded mb-3" style="max-height: 200px; width: 100%; object-fit: cover;">
            `;
            eventImageContainer.style.display = 'block';
        } else {
            eventImageContainer.style.display = 'none';
        }
    }
    
    // Load fights for this event
    loadEventFightsByType(event.id);
    
    // Navigate to event details tab
    navigateToTab('event-details');
}

async function loadEventFights(eventId, forceReload = false) {
    try {
        let eventFights;
        
        if (forceReload) {
            // Recarregar dados do servidor
            console.log('🔄 Recarregando dados das lutas do servidor...');
            const fights = await apiCall('fights');
            window.fightsData = fights;
            eventFights = fights.filter(fight => fight.eventId == eventId || fight.eventid == eventId);
        } else {
            // Usar dados em cache
            eventFights = window.fightsData ? window.fightsData.filter(fight => fight.eventId == eventId || fight.eventid == eventId) : [];
        }
        
        const fightsContainer = document.getElementById('eventFightsList');
        
        if (eventFights.length === 0) {
            fightsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-fist-raised"></i>
                    <p>Nenhuma luta cadastrada para este evento</p>
                    <button class="btn btn-primary btn-sm" onclick="addFightToEvent(${eventId})">
                        <i class="fas fa-plus me-2"></i>Adicionar Luta
                    </button>
                </div>
            `;
            return;
        }
        
        // Sort fights by fightOrder first, then by type (main first, then prelim)
        eventFights.sort((a, b) => {
            const orderA = a.fightOrder || a.fightorder || 0;
            const orderB = b.fightOrder || b.fightorder || 0;
            
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            
            // If same order, main fights come first
            const typeA = a.fightType || a.fighttype || '';
            const typeB = b.fightType || b.fighttype || '';
            
            if (typeA === 'main' && typeB !== 'main') return -1;
            if (typeA !== 'main' && typeB === 'main') return 1;
            return 0;
        });
        
        const fightsHTML = eventFights.map((fight, index) => 
            createFightItem(fight, index + 1)
        ).join('');
        fightsContainer.innerHTML = fightsHTML;
        
    } catch (error) {
        console.error('Error loading event fights:', error);
    }
}

function createFightItem(fight, displayNumber = null) {
    const fighter1 = window.fightersData ? window.fightersData.find(f => f.id == fight.fighter1Id || f.id == fight.fighter1id) : null;
    const fighter2 = window.fightersData ? window.fightersData.find(f => f.id == fight.fighter2Id || f.id == fight.fighter2id) : null;
    
    // Check if this is a championship fight (has a champion)
    const isChampionship = (fighter1 && fighter1.ranking === 'C') || (fighter2 && fighter2.ranking === 'C');
    const championshipClass = isChampionship ? 'championship-fight' : '';
    
    // Use displayNumber if provided, otherwise use the original fight order
    const orderNumber = displayNumber !== null ? displayNumber : (fight.fightOrder || fight.fightorder || '?');
    
    // Status indicators for live control
    const isLive = fight.is_live || false;
    const isFinished = fight.is_finished || false;
    const liveStatus = isLive ? '<span class="badge bg-danger ms-2">AO VIVO</span>' : '';
    const finishedStatus = isFinished ? '<span class="badge bg-success ms-2">FINALIZADA</span>' : '';
    
    // Result display for finished fights
    let resultDisplay = '';
    let winnerDisplay = '';
    
    if (isFinished && fight.result_type && fight.winner_id) {
        // Get winner fighter
        const winner = window.fightersData ? window.fightersData.find(f => f.id == fight.winner_id) : null;
        
        // Format result text
        let resultText = '';
        switch (fight.result_type) {
            case 'DE': resultText = 'Decision'; break;
            case 'KO': resultText = 'KO'; break;
            case 'TKO': resultText = 'TKO'; break;
            case 'SUB': resultText = 'Submission'; break;
            case 'Draw': resultText = 'Draw'; break;
            case 'DQ': resultText = 'Disqualification'; break;
            case 'NC': resultText = 'No Contest'; break;
            default: resultText = fight.result_type;
        }
        
        // Create result display
        resultDisplay = `<span class="text-success fw-bold">R${fight.final_round} - ${resultText}</span>`;
        
        // Create winner display with check mark
        if (winner) {
            // Check if winner is fighter1 or fighter2
            const isWinnerFighter1 = (fight.winner_id == fight.fighter1Id || fight.winner_id == fight.fighter1id);
            const isWinnerFighter2 = (fight.winner_id == fight.fighter2Id || fight.winner_id == fight.fighter2id);
            
            winnerDisplay = `
                <div class="fight-fighters">
                    <div class="fighter">
                        <div class="fighter-name ${isWinnerFighter1 ? 'text-success fw-bold' : ''}">
                            ${fighter1 ? fighter1.name : 'Lutador 1'}
                            ${isWinnerFighter1 ? ' <i class="fas fa-check text-success"></i>' : ''}
            </div>
                        <div class="fighter-record">${fighter1 ? `${fighter1.wins || 0}-${fighter1.losses || 0}-${fighter1.draws || 0}` : 'N/A'}</div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="fighter">
                        <div class="fighter-name ${isWinnerFighter2 ? 'text-success fw-bold' : ''}">
                            ${fighter2 ? fighter2.name : 'Lutador 2'}
                            ${isWinnerFighter2 ? ' <i class="fas fa-check text-success"></i>' : ''}
                        </div>
                        <div class="fighter-record">${fighter2 ? `${fighter2.wins || 0}-${fighter2.losses || 0}-${fighter2.draws || 0}` : 'N/A'}</div>
                    </div>
                </div>
            `;
        }
    }
    
    // Use winner display if available, otherwise use normal display
    const fightersDisplay = winnerDisplay || `
            <div class="fight-fighters">
                <div class="fighter">
                    <div class="fighter-name">${fighter1 ? fighter1.name : 'Lutador 1'}</div>
                    <div class="fighter-record">${fighter1 ? `${fighter1.wins || 0}-${fighter1.losses || 0}-${fighter1.draws || 0}` : 'N/A'}</div>
                </div>
                <div class="vs-divider">VS</div>
                <div class="fighter">
                    <div class="fighter-name">${fighter2 ? fighter2.name : 'Lutador 2'}</div>
                    <div class="fighter-record">${fighter2 ? `${fighter2.wins || 0}-${fighter2.losses || 0}-${fighter2.draws || 0}` : 'N/A'}</div>
                </div>
            </div>
    `;
    
    return `
        <div class="fight-item ${championshipClass}" draggable="true" data-fight-id="${fight.id}" data-fight-order="${fight.fightOrder || fight.fightorder || 0}">
            <div class="fight-order-badge">${orderNumber}</div>
            <div class="fight-actions">
                <button class="btn btn-info btn-sm" onclick="openFightControl(${fight.id})" title="Controle da Luta">
                    <i class="fas fa-gamepad"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="editFight(${fight.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                                        <button class="btn btn-secondary btn-sm" onclick="deleteFight(${fight.id})">
                                <i class="fas fa-trash"></i>
                            </button>
            </div>
            ${fightersDisplay}
            <div class="fight-details">
                <strong>${fight.weightClass || fight.weightclass}</strong> • ${fight.rounds || 3} rounds
                ${resultDisplay ? `<br>${resultDisplay}` : ''}
                ${isChampionship ? '<br><span style="color: #ffd700; font-weight: bold;">🏆 Luta de Campeonato</span>' : ''}
                ${liveStatus}
                ${finishedStatus}
            </div>
        </div>
    `;
}

function filterEvents(filterType) {
    currentEventFilter = filterType;
    
    // Update filter buttons
    document.querySelectorAll('.filter-switch button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide event details when switching filters
    document.getElementById('eventDetails').style.display = 'none';
    selectedEvent = null;
    
    // Reload events display
    displayEvents(window.eventsData);
}

function addFightToEvent(fightType = null) {
    // Set the fight type if provided
    if (fightType) {
        document.getElementById('fightType').value = fightType;
    }
    
    // Clear the weight class to reset fighter filters
    document.getElementById('fightWeightClass').value = '';
    filterFightersByWeightClass();
    
    // Open the fight modal
    const fightModal = new bootstrap.Modal(document.getElementById('fightModal'));
    fightModal.show();
}

// Event form handlers
async function handleEventSubmit(e) {
    e.preventDefault();
    
    // Processar imagem
    let imageData = null;
    const imageFile = document.getElementById('eventImageFile').files[0];
    
    if (imageFile) {
        // Converter arquivo para base64
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
        };
        reader.readAsDataURL(imageFile);
        
        // Aguardar a conversão
        await new Promise((resolve) => {
            reader.onload = function(e) {
                imageData = e.target.result;
                resolve();
            };
        });
    }
    
    const eventData = {
        name: document.getElementById('eventName').value,
        date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value,
        venue: document.getElementById('eventVenue').value,
        image: imageData
    };
    
    const eventId = document.getElementById('eventId').value;
    
    try {
        if (eventId) {
            // Update existing event
            await apiCall(`events/${eventId}`, 'PUT', eventData);
        } else {
            // Create new event
            await apiCall('events', 'POST', eventData);
        }
        
        // Close modal and reload data
        const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
        modal.hide();
        
        await loadEvents();
        resetEventForm();
        
    } catch (error) {
        console.error('Failed to save event:', error);
        alert('Erro ao salvar evento: ' + error.message);
    }
}

function editEvent(eventId) {
    const event = window.eventsData.find(e => e.id == eventId);
    if (!event) return;
    
    // Populate form
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventName').value = event.name;
    
    // Tratar formato de data para datetime-local
    let dateValue = event.date;
    if (dateValue) {
        // Se a data vem do Supabase, pode estar em formato ISO
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            // Converter para formato datetime-local (YYYY-MM-DDTHH:MM)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            // Fallback para o formato antigo
            dateValue = event.date.replace(' ', 'T');
        }
    }
    document.getElementById('eventDate').value = dateValue;
    
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventVenue').value = event.venue || '';
    
    // Limpar arquivo selecionado
    document.getElementById('eventImageFile').value = '';
    
    // Atualizar preview da imagem se existir
    if (event.image) {
        document.getElementById('eventImagePreviewImg').src = event.image;
        document.getElementById('eventImagePreview').style.display = 'block';
    } else {
        document.getElementById('eventImagePreview').style.display = 'none';
    }
    
    // Update modal title
    document.getElementById('eventModalTitle').textContent = 'Editar Evento';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

async function deleteEvent(eventId) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    
    try {
        console.log('🗑️ Deletando evento ID:', eventId);
        await apiCall(`events/${eventId}`, 'DELETE');
        console.log('✅ Evento deletado com sucesso');
        
        // Check if deleted event was the selected one
        const selectedEventId = localStorage.getItem('selectedEventId');
        if (selectedEventId == eventId) {
            console.log('🗑️ Deleted event was selected, clearing state');
            localStorage.removeItem('selectedEventId');
            selectedEvent = null;
            window.location.hash = 'events';
            activateTab('events');
        }
        
        await loadEvents();
        alert('Evento excluído com sucesso!');
    } catch (error) {
        console.error('❌ Failed to delete event:', error);
        alert('Erro ao excluir evento: ' + error.message);
    }
}

async function deleteCurrentEvent() {
    const eventId = document.getElementById('eventDetailsId').value;
    if (!eventId) {
        alert('Nenhum evento selecionado para excluir.');
        return;
    }
    
    if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        console.log('🗑️ Deletando evento atual ID:', eventId);
        await apiCall(`events/${eventId}`, 'DELETE');
        console.log('✅ Evento deletado com sucesso');
        
        // Recarregar eventos
        await loadEvents();
        
        // Voltar para a lista de eventos e limpar estado
        selectedEvent = null;
        localStorage.removeItem('selectedEventId');
        window.location.hash = 'events';
        activateTab('events');
        
        alert('Evento excluído com sucesso!');
    } catch (error) {
        console.error('❌ Failed to delete current event:', error);
        alert('Erro ao excluir evento: ' + error.message);
    }
}

function resetEventForm() {
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    document.getElementById('eventModalTitle').textContent = 'Novo Evento';
    document.getElementById('eventImagePreview').style.display = 'none';
    document.getElementById('eventImageFile').value = '';
}

// Event details form handler
async function handleEventDetailsSubmit(e) {
    e.preventDefault();
    
    // Processar imagem
    let imageData = null;
    const imageFile = document.getElementById('eventDetailsImageFile').files[0];
    
    if (imageFile) {
        // Converter arquivo para base64
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
        };
        reader.readAsDataURL(imageFile);
        
        // Aguardar a conversão
        await new Promise((resolve) => {
            reader.onload = function(e) {
                imageData = e.target.result;
                resolve();
            };
        });
    }
    
    const eventData = {
        name: document.getElementById('eventDetailsName').value,
        date: document.getElementById('eventDetailsDateTime').value,
        location: document.getElementById('eventDetailsLocation').value,
        venue: document.getElementById('eventDetailsVenue').value,
        image: imageData
    };
    
    const eventId = document.getElementById('eventDetailsId').value;
    
    try {
        if (eventId) {
            // Update existing event
            await apiCall(`events/${eventId}`, 'PUT', eventData);
        } else {
            // Create new event
            const newEvent = await apiCall('events', 'POST', eventData);
            document.getElementById('eventDetailsId').value = newEvent.id;
            selectedEvent = newEvent;
            
            // Save new event to localStorage and update hash
            localStorage.setItem('selectedEventId', newEvent.id);
            window.location.hash = `event-${newEvent.id}`;
        }
        
        // Reload events and update display
        await loadEvents();
        navigateToEventDetails(selectedEvent);
        
        alert(eventId ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
        
    } catch (error) {
        console.error('Failed to save event details:', error);
        alert('Erro ao salvar evento: ' + error.message);
    }
}

function createNewEvent() {
    // Clear the form
    document.getElementById('eventDetailsForm').reset();
    document.getElementById('eventDetailsId').value = '';
    
    // Clear title
    document.getElementById('eventDetailsTitle').textContent = 'Novo Evento';
    
    // Clear fights lists
    document.getElementById('mainCardFightsList').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-crown"></i>
            <p>Nenhuma luta no card principal</p>
            <button class="btn btn-primary btn-sm" onclick="addFightToEvent('main')">
                <i class="fas fa-plus me-2"></i>Adicionar Luta
            </button>
        </div>
    `;
    document.getElementById('prelimsFightsList').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-list"></i>
            <p>Nenhuma luta preliminar</p>
            <button class="btn btn-primary btn-sm" onclick="addFightToEvent('prelim')">
                <i class="fas fa-plus me-2"></i>Adicionar Luta
            </button>
        </div>
    `;
    
    // Update counters
    document.getElementById('main-card-count').textContent = '0';
    document.getElementById('prelims-count').textContent = '0';
    
    // Clear selected event and saved state
    selectedEvent = null;
    localStorage.removeItem('selectedEventId');
    window.location.hash = 'event-details';
    
    // Navigate to event details tab
    activateTab('event-details');
}

// Fighters management
async function loadFighters() {
    try {
        const fighters = await apiCall('fighters');
        window.fightersData = fighters;
        
        // Note: displayFighters is now called by loadData() after all data is loaded
        populateFighterSelects(fighters);
        return fighters;
    } catch (error) {
        console.error('Failed to load fighters:', error);
        return [];
    }
}

function displayFighters(fighters) {
    // Store fighters data globally for filtering
    window.fightersData = fighters;
    
    if (fighters.length === 0) {
        document.getElementById('fightersList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <p>Nenhum lutador cadastrado.</p>
                <button class="btn btn-primary" onclick="openFighterModal()">
                    <i class="fas fa-plus me-2"></i>Adicionar Primeiro Lutador
                </button>
            </div>
        `;
        updateCategoryCounts(fighters);
        return;
    }
    
    // Update category counts and display all fighters initially
    updateCategoryCounts(fighters);
    displayFightersByCategory('all', fighters);
    
    // Add event listeners to category buttons
    addCategoryEventListeners();
}

function updateCategoryCounts(fighters) {
    // Count fighters by category
    const counts = {
        'all': fighters.length,
        'Bantamweight': 0,
        'Featherweight': 0,
        'Flyweight': 0,
        'Heavyweight': 0,
        'Light Heavyweight': 0,
        'Lightweight': 0,
        'Middleweight': 0,
        'Welterweight': 0,
        'Women\'s Bantamweight': 0,
        'Women\'s Flyweight': 0,
        'Women\'s Strawweight': 0
    };
    
    fighters.forEach(fighter => {
        const weightClass = fighter.weightClass || fighter.weightclass;
        if (weightClass && counts.hasOwnProperty(weightClass)) {
            counts[weightClass]++;
        }
    });
    
    // Update badge counts
    Object.keys(counts).forEach(category => {
        const badge = document.getElementById(`${category}-count`);
        if (badge) {
            badge.textContent = counts[category];
        }
    });
}

function displayFightersByCategory(category, fighters = null) {
    const container = document.getElementById('fightersList');
    const titleElement = document.getElementById('fightersCategoryTitle');
    
    // Use provided fighters or global fighters data
    const allFighters = fighters || window.fightersData || [];
    
    // Filter fighters by category
    let filteredFighters = allFighters;
    if (category !== 'all') {
        filteredFighters = allFighters.filter(fighter => {
            const weightClass = fighter.weightClass || fighter.weightclass;
            return weightClass === category;
        });
    }
    
    // Update title
    if (category === 'all') {
        titleElement.innerHTML = '<i class="fas fa-users me-2"></i>Todos os Lutadores';
    } else {
        titleElement.innerHTML = `<i class="fas fa-weight me-2"></i>${category}`;
    }
    
    if (filteredFighters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <p>Nenhum lutador encontrado nesta categoria.</p>
                <button class="btn btn-primary" onclick="openFighterModal()">
                    <i class="fas fa-plus me-2"></i>Adicionar Lutador
                </button>
            </div>
        `;
        return;
    }
    
    // Sort fighters by ranking (ranked first, then alphabetically)
    filteredFighters.sort((a, b) => {
        if (a.ranking && b.ranking) {
            // If both have rankings, champion (C) comes first, then by number
            if (a.ranking === 'C' && b.ranking === 'C') return 0;
            if (a.ranking === 'C') return -1;
            if (b.ranking === 'C') return 1;
            return parseInt(a.ranking) - parseInt(b.ranking);
        } else if (a.ranking) {
            return -1;
        } else if (b.ranking) {
            return 1;
        } else {
            return a.name.localeCompare(b.name);
        }
    });
    
    // Create fighters table
    const fightersTable = filteredFighters.map(fighter => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="fighter-info">
                        <div class="fighter-name">${fighter.name}</div>
                        ${fighter.nickname ? `<div class="fighter-nickname">"${fighter.nickname}"</div>` : ''}
                    </div>
                </div>
            </td>
            <td>${fighter.weightClass || fighter.weightclass || 'N/A'}</td>
            <td>${fighter.country || 'N/A'}</td>
            <td>${fighter.wins || 0}-${fighter.losses || 0}-${fighter.draws || 0}</td>
            <td>
                ${fighter.ranking ? 
                    (fighter.ranking === 'C' ? 
                        '<span class="badge bg-warning text-dark">C</span>' : 
                        `<span class="badge bg-primary">${fighter.ranking}</span>`
                    ) : 
                    '<span class="text-muted">-</span>'
                }
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-warning" onclick="editFighter(${fighter.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteFighter(${fighter.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>País</th>
                        <th>Record</th>
                        <th>Ranking</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${fightersTable}
                </tbody>
            </table>
        </div>
    `;
}

function addCategoryEventListeners() {
    const categoryButtons = document.querySelectorAll('#fightersCategoriesList .list-group-item');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get category from data attribute
            const category = this.getAttribute('data-category');
            
            // Display fighters for selected category
            displayFightersByCategory(category);
        });
    });
}

function openFighterModal() {
    // Get the currently active category
    const activeCategoryButton = document.querySelector('#fightersCategoriesList .list-group-item.active');
    const currentCategory = activeCategoryButton ? activeCategoryButton.getAttribute('data-category') : '';
    
    // Set the weight class if a specific category is selected (not "all")
    if (currentCategory && currentCategory !== 'all') {
        document.getElementById('fighterWeightClass').value = currentCategory;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('fighterModal'));
    modal.show();
}

async function handleFighterSubmit(e) {
    e.preventDefault();
    
    const rankingValue = document.getElementById('fighterRanking').value;
    let ranking = null;
    
    if (rankingValue) {
        if (rankingValue === 'C') {
            ranking = 'C';
        } else {
            ranking = parseInt(rankingValue);
        }
    }
    
    const fighterData = {
        name: document.getElementById('fighterName').value,
        nickname: document.getElementById('fighterNickname').value,
        wins: parseInt(document.getElementById('fighterWins').value) || 0,
        losses: parseInt(document.getElementById('fighterLosses').value) || 0,
        draws: parseInt(document.getElementById('fighterDraws').value) || 0,
        weightclass: document.getElementById('fighterWeightClass').value, // Use lowercase for Supabase
        country: document.getElementById('fighterCountry').value,
        ranking: ranking
    };
    
    const fighterId = document.getElementById('fighterId').value;
    
    try {
        if (fighterId) {
            await apiCall(`fighters/${fighterId}`, 'PUT', fighterData);
        } else {
            await apiCall('fighters', 'POST', fighterData);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('fighterModal'));
        modal.hide();
        
        // Reload fighters data
        const fighters = await loadFighters();
        
        // Get the currently active category
        const activeCategoryButton = document.querySelector('#fightersCategoriesList .list-group-item.active');
        const currentCategory = activeCategoryButton ? activeCategoryButton.getAttribute('data-category') : 'all';
        
        // Update the display for the current category
        displayFightersByCategory(currentCategory, fighters);
        
        // Update category counts
        updateCategoryCounts(fighters);
        
        resetFighterForm();
        
    } catch (error) {
        console.error('Failed to save fighter:', error);
        alert('Erro ao salvar lutador: ' + error.message);
    }
}

async function editFighter(fighterId) {
    const fighter = window.fightersData.find(f => f.id == fighterId);
    if (!fighter) return;
    
    document.getElementById('fighterId').value = fighter.id;
    document.getElementById('fighterName').value = fighter.name;
    document.getElementById('fighterNickname').value = fighter.nickname || '';
    document.getElementById('fighterWins').value = fighter.wins || 0;
    document.getElementById('fighterLosses').value = fighter.losses || 0;
    document.getElementById('fighterDraws').value = fighter.draws || 0;
    // Handle both weightClass and weightclass from Supabase
    document.getElementById('fighterWeightClass').value = fighter.weightClass || fighter.weightclass || '';
    document.getElementById('fighterCountry').value = fighter.country || '';
    document.getElementById('fighterRanking').value = fighter.ranking || '';
    
    // Calculate and display record using the fighter's manual values
    await calculateRecordFromFighter(fighter);
    
    const modal = new bootstrap.Modal(document.getElementById('fighterModal'));
    modal.show();
}

async function deleteFighter(fighterId) {
    if (!confirm('Tem certeza que deseja excluir este lutador?')) return;
    
    try {
        await apiCall(`fighters/${fighterId}`, 'DELETE');
        
        // Reload fighters data
        const fighters = await loadFighters();
        
        // Get the currently active category
        const activeCategoryButton = document.querySelector('#fightersCategoriesList .list-group-item.active');
        const currentCategory = activeCategoryButton ? activeCategoryButton.getAttribute('data-category') : 'all';
        
        // Update the display for the current category
        displayFightersByCategory(currentCategory, fighters);
        
        // Update category counts
        updateCategoryCounts(fighters);
        
    } catch (error) {
        console.error('Failed to delete fighter:', error);
        alert('Erro ao excluir lutador: ' + error.message);
    }
}

async function resetFighterForm() {
    document.getElementById('fighterForm').reset();
    document.getElementById('fighterId').value = '';
    document.getElementById('fighterCountry').value = '';
    await calculateRecord();
}

// Wrapper function for async calculateRecord
function calculateRecordWrapper() {
    calculateRecord().catch(error => {
        console.error('Error in calculateRecordWrapper:', error);
    });
}

// Calculate record using fighter's original manual values (for edit mode)
async function calculateRecordFromFighter(fighter) {
    const wins = fighter.wins || 0;
    const losses = fighter.losses || 0;
    const draws = fighter.draws || 0;
    
    // Get fighter ID to calculate record from fights
    const fighterId = fighter.id;
    
    if (fighterId) {
        try {
            // Get fighter's fights
            const response = await fetch(`/api/fighters/${fighterId}/fights`);
            const fights = await response.json();
            
            // Calculate record from finished fights
            let fightWins = 0;
            let fightLosses = 0;
            let fightDraws = 0;
            
            fights.forEach(fight => {
                if (fight.is_finished && fight.winner_id) {
                    if (fight.winner_id == fighterId) {
                        fightWins++;
                    } else if (fight.fighter1id == fighterId || fight.fighter2id == fighterId) {
                        fightLosses++;
                    }
                }
                // Note: Draws are not currently tracked in the database, so fightDraws remains 0
            });
            
            // Total record = manual record + fight record
            const totalWins = wins + fightWins;
            const totalLosses = losses + fightLosses;
            const totalDraws = draws + fightDraws;
            
            document.getElementById('fighterRecordDisplay').value = `${totalWins}-${totalLosses}-${totalDraws}`;
            
            // Update breakdown text
            const breakdownText = `Manual: ${wins}-${losses}-${draws} | Lutas: ${fightWins}-${fightLosses}-${fightDraws}`;
            document.getElementById('recordBreakdown').textContent = breakdownText;
            
            // Add tooltip or info about the breakdown
            const recordInfo = `Manual: ${wins}-${losses}-${draws} | Fights: ${fightWins}-${fightLosses}-${fightDraws}`;
            document.getElementById('fighterRecordDisplay').title = recordInfo;
            
        } catch (error) {
            console.error('Error calculating fighter record:', error);
            // Fallback to manual record only
            document.getElementById('fighterRecordDisplay').value = `${wins}-${losses}-${draws}`;
            document.getElementById('recordBreakdown').textContent = `Manual: ${wins}-${losses}-${draws} | Lutas: 0-0-0`;
        }
    } else {
        document.getElementById('fighterRecordDisplay').value = `${wins}-${losses}-${draws}`;
        document.getElementById('recordBreakdown').textContent = `Manual: ${wins}-${losses}-${draws} | Lutas: 0-0-0`;
    }
}

async function calculateRecord() {
    const wins = parseInt(document.getElementById('fighterWins').value) || 0;
    const losses = parseInt(document.getElementById('fighterLosses').value) || 0;
    const draws = parseInt(document.getElementById('fighterDraws').value) || 0;
    
    // Get fighter ID to calculate record from fights
    const fighterId = document.getElementById('fighterId').value;
    
    if (fighterId) {
        try {
            // Get fighter's fights
            const response = await fetch(`/api/fighters/${fighterId}/fights`);
            const fights = await response.json();
            
            // Calculate record from finished fights
            let fightWins = 0;
            let fightLosses = 0;
            let fightDraws = 0;
            
            fights.forEach(fight => {
                if (fight.is_finished && fight.winner_id) {
                    if (fight.winner_id == fighterId) {
                        fightWins++;
                    } else if (fight.fighter1id == fighterId || fight.fighter2id == fighterId) {
                        fightLosses++;
                    }
                }
                // Note: Draws are not currently tracked in the database, so fightDraws remains 0
            });
            
            // Total record = manual record + fight record
            const totalWins = wins + fightWins;
            const totalLosses = losses + fightLosses;
            const totalDraws = draws + fightDraws;
            
            document.getElementById('fighterRecordDisplay').value = `${totalWins}-${totalLosses}-${totalDraws}`;
            
            // Update breakdown text
            const breakdownText = `Manual: ${wins}-${losses}-${draws} | Lutas: ${fightWins}-${fightLosses}-${fightDraws}`;
            document.getElementById('recordBreakdown').textContent = breakdownText;
            
            // Add tooltip or info about the breakdown
            const recordInfo = `Manual: ${wins}-${losses}-${draws} | Fights: ${fightWins}-${fightLosses}-${fightDraws}`;
            document.getElementById('fighterRecordDisplay').title = recordInfo;
            
        } catch (error) {
            console.error('Error calculating fighter record:', error);
            // Fallback to manual record only
            document.getElementById('fighterRecordDisplay').value = `${wins}-${losses}-${draws}`;
            document.getElementById('recordBreakdown').textContent = `Manual: ${wins}-${losses}-${draws} | Lutas: 0-0-0`;
        }
    } else {
        // No fighter ID (new fighter), just show manual record
        document.getElementById('fighterRecordDisplay').value = `${wins}-${losses}-${draws}`;
        document.getElementById('recordBreakdown').textContent = `Manual: ${wins}-${losses}-${draws} | Lutas: 0-0-0`;
    }
}

function populateFighterSelects(fighters) {
    const fighterSelects = ['fighter1', 'fighter2'];
    
    fighterSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Selecione...</option>';
        fighters.forEach(fighter => {
        const option = document.createElement('option');
                option.value = fighter.id;
            option.textContent = fighter.name;
        select.appendChild(option);
    });
}
    });
}

async function handleFightSubmit(e) {
    e.preventDefault();
    
    // Check if selectedEvent exists
    if (!selectedEvent) {
        alert('Erro: Nenhum evento selecionado. Por favor, selecione um evento primeiro.');
        return;
    }
    
    // Calculate the next fightorder for this event
    const eventFights = window.fightsData ? window.fightsData.filter(fight => 
        fight.eventId == selectedEvent.id || fight.eventid == selectedEvent.id
    ) : [];
    
    const nextFightOrder = eventFights.length > 0 
        ? Math.max(...eventFights.map(f => f.fightorder || f.fightOrder || 0)) + 1 
        : 1;
    
    const fightData = {
        eventid: selectedEvent.id,
        fighter1id: document.getElementById('fighter1').value,
        fighter2id: document.getElementById('fighter2').value,
        weightclass: document.getElementById('fightWeightClass').value,
        fighttype: document.getElementById('fightType').value,
        rounds: parseInt(document.getElementById('fightRounds').value),
        fightorder: nextFightOrder
    };
    
    const fightId = document.getElementById('fightId').value;
    
    try {
        let savedFight;
        if (fightId) {
            savedFight = await apiCall(`fights/${fightId}`, 'PUT', fightData);
        } else {
            savedFight = await apiCall('fights', 'POST', fightData);
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('fightModal'));
        modal.hide();
        
        // Reload fights data globally
        const fights = await apiCall('fights');
        window.fightsData = fights;
        
        // Reload event fights to update the display
        loadEventFightsByType(selectedEvent.id);
        
        // Reset form
        resetFightForm();
        
        console.log('✅ Luta salva com sucesso:', savedFight);
        
    } catch (error) {
        console.error('Failed to save fight:', error);
        alert('Erro ao salvar luta: ' + error.message);
    }
}

async function editFight(fightId) {
    const fight = window.fightsData.find(f => f.id == fightId);
    if (!fight) return;
    
    document.getElementById('fightId').value = fight.id;
    document.getElementById('fightWeightClass').value = fight.weightClass || fight.weightclass || '';
    document.getElementById('fightType').value = fight.fightType || fight.fighttype || '';
    document.getElementById('fightRounds').value = fight.rounds || 3;
    
    // Populate fighter selects based on weight class first
    filterFightersByWeightClass();
    
    // Set fighters after populating selects with a more robust approach
    const setFighters = () => {
        const fighter1Select = document.getElementById('fighter1');
        const fighter2Select = document.getElementById('fighter2');
        const fighter1Id = fight.fighter1Id || fight.fighter1id || '';
        const fighter2Id = fight.fighter2Id || fight.fighter2id || '';
        
        // Check if selects are populated
        if (fighter1Select.options.length > 1 && fighter2Select.options.length > 1) {
            fighter1Select.value = fighter1Id;
            fighter2Select.value = fighter2Id;
            console.log('✅ Lutadores definidos na modal:', { fighter1Id, fighter2Id });
        } else {
            // If selects are not populated yet, try again after a short delay
            setTimeout(setFighters, 50);
        }
    };
    
    // Start the process
    setFighters();
    
    const modal = new bootstrap.Modal(document.getElementById('fightModal'));
    modal.show();
}

async function deleteFight(fightId) {
    if (!confirm('Tem certeza que deseja excluir esta luta?')) return;
    
    // Check if selectedEvent exists
    if (!selectedEvent) {
        alert('Erro: Nenhum evento selecionado. Por favor, selecione um evento primeiro.');
        return;
    }
    
    try {
        await apiCall(`fights/${fightId}`, 'DELETE');
        await loadEventFights(selectedEvent.id, true);
    } catch (error) {
        console.error('Failed to delete fight:', error);
        alert('Erro ao excluir luta: ' + error.message);
    }
}

function resetFightForm() {
    document.getElementById('fightForm').reset();
    document.getElementById('fightId').value = '';
    document.getElementById('fightRounds').value = '3';
}

function filterFightersByWeightClass() {
    const weightClass = document.getElementById('fightWeightClass').value;
    const fighter1Select = document.getElementById('fighter1');
    const fighter2Select = document.getElementById('fighter2');
    
    if (!weightClass) {
        fighter1Select.innerHTML = '<option value="">Selecione a categoria primeiro...</option>';
        fighter2Select.innerHTML = '<option value="">Selecione a categoria primeiro...</option>';
        return;
    }
    
    const filteredFighters = window.fightersData.filter(fighter => {
        const fighterWeightClass = fighter.weightClass || fighter.weightclass;
        return fighterWeightClass === weightClass;
    });
    
    // Populate fighter selects
    const fighterOptions = filteredFighters.map(fighter => 
        `<option value="${fighter.id}">${fighter.name}</option>`
    ).join('');
    
    fighter1Select.innerHTML = '<option value="">Selecione...</option>' + fighterOptions;
    fighter2Select.innerHTML = '<option value="">Selecione...</option>' + fighterOptions;
}

// Utility functions
function getStatusClass(status) {
    switch (status) {
        case 'upcoming': return 'status-upcoming';
        case 'scheduled': return 'status-scheduled';
        case 'live': return 'status-live';
        case 'finished': return 'status-finished';
        default: return 'status-upcoming';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'upcoming': return 'Próximo';
        case 'scheduled': return 'Agendado';
        case 'live': return 'Ao Vivo';
        case 'finished': return 'Finalizado';
        default: return 'Próximo';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Live control functions (placeholder for now)
function handleLiveFightSelect() {
    // Implementation for live fight selection
}

function startFight() {
    // Implementation for starting a fight
}

function pauseFight() {
    // Implementation for pausing a fight
}

function resumeFight() {
    // Implementation for resuming a fight
}

function endFight() {
    // Implementation for ending a fight
}

function updateLiveFightDisplay(data) {
    // Implementation for updating live fight display
} 

function loadEventFightsByType(eventId) {
    // Filter fights for this event
    const eventFights = window.fightsData ? window.fightsData.filter(fight => fight.eventId == eventId || fight.eventid == eventId) : [];
    
    // Separate fights by type
    const mainCardFights = eventFights.filter(fight => fight.fightType === 'main' || fight.fighttype === 'main');
    const prelimFights = eventFights.filter(fight => fight.fightType === 'prelim' || fight.fighttype === 'prelim');
    
    // Sort fights by fightOrder within each type
    mainCardFights.sort((a, b) => (a.fightOrder || a.fightorder || 0) - (b.fightOrder || b.fightorder || 0));
    prelimFights.sort((a, b) => (a.fightOrder || a.fightorder || 0) - (b.fightOrder || b.fightorder || 0));
    
    // Update counters
    document.getElementById('main-card-count').textContent = mainCardFights.length;
    document.getElementById('prelims-count').textContent = prelimFights.length;
    
    // Display main card fights
    const mainCardContainer = document.getElementById('mainCardFightsList');
    if (mainCardFights.length === 0) {
        mainCardContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-crown"></i>
                <p>Nenhuma luta no card principal</p>
                <button class="btn btn-primary btn-sm" onclick="addFightToEvent('main')">
                    <i class="fas fa-plus me-2"></i>Adicionar Luta
                </button>
            </div>
        `;
    } else {
        // Create main card fights with sequential numbering starting from 1
        const mainCardHTML = mainCardFights.map((fight, index) => 
            createFightItem(fight, index + 1)
        ).join('');
        mainCardContainer.innerHTML = mainCardHTML;
        initializeDragAndDrop(mainCardContainer, 'main');
    }
    
    // Display prelim fights
    const prelimsContainer = document.getElementById('prelimsFightsList');
    if (prelimFights.length === 0) {
        prelimsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list"></i>
                <p>Nenhuma luta preliminar</p>
                <button class="btn btn-primary btn-sm" onclick="addFightToEvent('prelim')">
                    <i class="fas fa-plus me-2"></i>Adicionar Luta
                </button>
            </div>
        `;
    } else {
        // Create prelim fights with sequential numbering continuing from main card
        const prelimsHTML = prelimFights.map((fight, index) => 
            createFightItem(fight, mainCardFights.length + index + 1)
        ).join('');
        prelimsContainer.innerHTML = prelimsHTML;
        initializeDragAndDrop(prelimsContainer, 'prelim');
    }
    
    // Check for championship fights and update event description
    checkAndUpdateChampionshipFights(eventId, eventFights);
} 

function goBackToEvents() {
    selectedEvent = null;
    
    // Clear localStorage and hash
    localStorage.removeItem('selectedEventId');
    window.location.hash = 'events';
    activateTab('events');
} 

// Drag and Drop functionality
function initializeDragAndDrop(container, fightType) {
    const fightItems = container.querySelectorAll('.fight-item');
    
    console.log(`Initializing drag and drop for ${fightType}:`, { 
        containerId: container.id, 
        fightItemsCount: fightItems.length 
    });
    
    fightItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
        
        console.log('Added drag listeners to fight item:', item.dataset.fightId);
    });
}

function handleDragStart(e) {
    console.log('Drag start:', e.target.dataset.fightId);
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.fightId);
}

function handleDragEnd(e) {
    console.log('Drag end:', e.target.dataset.fightId);
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.closest('.fight-item')?.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.closest('.fight-item')?.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const draggedFightId = e.dataTransfer.getData('text/plain');
    const targetFightItem = e.target.closest('.fight-item');
    
    console.log('Drop event:', { draggedFightId, targetFightItem: targetFightItem?.dataset.fightId });
    
    if (targetFightItem && targetFightItem.dataset.fightId !== draggedFightId) {
        const container = targetFightItem.parentElement;
        const fightItems = Array.from(container.querySelectorAll('.fight-item'));
        const draggedItem = container.querySelector(`[data-fight-id="${draggedFightId}"]`);
        
        console.log('Container:', container.id, 'Fight items count:', fightItems.length);
        
        if (draggedItem) {
            const targetIndex = fightItems.indexOf(targetFightItem);
            const draggedIndex = fightItems.indexOf(draggedItem);
            
            console.log('Reordering:', { targetIndex, draggedIndex });
            
            // Reorder the items
            if (targetIndex > draggedIndex) {
                targetFightItem.parentNode.insertBefore(draggedItem, targetFightItem.nextSibling);
            } else {
                targetFightItem.parentNode.insertBefore(draggedItem, targetFightItem);
            }
            
            // Determine fight type based on container ID
            const fightType = container.id === 'mainCardFightsList' ? 'main' : 'prelim';
            
            // Update fight order in database
            updateFightOrder(container, fightType);
        }
    }
    
    // Remove drag-over class
    document.querySelectorAll('.fight-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

async function updateFightOrder(container, fightType) {
    const fightItems = Array.from(container.querySelectorAll('.fight-item'));
    
    // Get all fights for this event to calculate proper order
    const eventFights = window.fightsData ? window.fightsData.filter(fight => 
        fight.eventId == selectedEvent.id || fight.eventid == selectedEvent.id
    ) : [];
    
    // Get the dragged fights (those in this container)
    const draggedFightIds = fightItems.map(item => parseInt(item.dataset.fightId));
    
    // Calculate new order based on container position
    let newOrder = 1;
    const fightOrder = [];
    
    // First, handle main card fights (they come first)
    if (fightType === 'main') {
        // Add main card fights in their new order
        fightItems.forEach((item, index) => {
            const fightId = parseInt(item.dataset.fightId);
            fightOrder.push({
                id: fightId,
                order: newOrder++
            });
        });
        
        // Add prelim fights after main card (keep their existing order)
        const prelimFights = eventFights.filter(fight => 
            (fight.fightType === 'prelim' || fight.fighttype === 'prelim') &&
            !draggedFightIds.includes(fight.id)
        );
        prelimFights.sort((a, b) => (a.fightOrder || a.fightorder || 0) - (b.fightOrder || b.fightorder || 0));
        
        prelimFights.forEach(fight => {
            fightOrder.push({
                id: fight.id,
                order: newOrder++
            });
        });
    } else {
        // Handle prelim fights
        // Add main card fights first (keep their existing order)
        const mainCardFights = eventFights.filter(fight => 
            (fight.fightType === 'main' || fight.fighttype === 'main') &&
            !draggedFightIds.includes(fight.id)
        );
        mainCardFights.sort((a, b) => (a.fightOrder || a.fightorder || 0) - (b.fightOrder || b.fightorder || 0));
        
        mainCardFights.forEach(fight => {
            fightOrder.push({
                id: fight.id,
                order: newOrder++
            });
        });
        
        // Add prelim fights in their new order
        fightItems.forEach((item, index) => {
            const fightId = parseInt(item.dataset.fightId);
            fightOrder.push({
                id: fightId,
                order: newOrder++
            });
        });
    }
    
    console.log('Updating fight order:', { fightType, fightOrder, eventId: selectedEvent?.id });
    
    try {
        await apiCall(`events/${selectedEvent.id}/fight-order`, 'PUT', { fightOrder });
        
        // Update the order badges
        fightItems.forEach((item, index) => {
            const badge = item.querySelector('.fight-order-badge');
            if (badge) {
                badge.textContent = index + 1;
            }
            item.dataset.fightOrder = index + 1;
        });
        
        // Reload fights data
        const fights = await apiCall('fights');
        window.fightsData = fights;
        
        console.log('Fight order updated successfully');
        
    } catch (error) {
        console.error('Failed to update fight order:', error);
        alert('Erro ao atualizar ordem das lutas: ' + error.message);
    }
}

// Championship fight detection and event description update
function checkAndUpdateChampionshipFights(eventId, eventFights) {
    const championshipFights = eventFights.filter(fight => {
        const fighter1 = window.fightersData?.find(f => f.id == fight.fighter1Id);
        const fighter2 = window.fightersData?.find(f => f.id == fight.fighter2Id);
        return (fighter1 && fighter1.ranking === 'C') || (fighter2 && fighter2.ranking === 'C');
    });
    
    if (championshipFights.length > 0) {
        // Update event description to show championship fights
        const championshipDescriptions = championshipFights.map(fight => {
            const fighter1 = window.fightersData?.find(f => f.id == fight.fighter1Id);
            const fighter2 = window.fightersData?.find(f => f.id == fight.fighter2Id);
            const champion = fighter1?.ranking === 'C' ? fighter1 : fighter2;
            const challenger = fighter1?.ranking === 'C' ? fighter2 : fighter1;
            return `${champion?.name} vs ${challenger?.name} (${fight.weightClass})`;
        });
        
        const eventDescription = `🏆 Championship: ${championshipDescriptions.join(', ')}`;
        
        // Log championship fights detected
        console.log('Championship fights detected:', championshipDescriptions);
    }
}

// ===== FUNÇÕES PARA CONTROLE DE LIVE ACTIVITIES =====

// Abrir modal de controle da luta
async function openFightControl(fightId) {
    try {
        // Buscar dados da luta
        const fight = window.fightsData.find(f => f.id === fightId);
        if (!fight) {
            alert('Luta não encontrada');
            return;
        }
        
        currentControlFight = fight;
        document.getElementById('controlFightId').value = fightId;
        
        // Popular informações da luta
        populateFightControlInfo(fight);
        
        // Popular selects
        populateFightControlSelects(fight);
        

        

        
        // Atualizar estado dos botões
        updateControlButtons(fight);
        
        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('fightControlModal'));
        modal.show();
        

        
    } catch (error) {
        console.error('Error opening fight control:', error);
        alert('Erro ao abrir controle da luta');
    }
}

// Popular informações da luta
function populateFightControlInfo(fight) {
    const fighter1 = window.fightersData.find(f => f.id === fight.fighter1Id || f.id === fight.fighter1id);
    const fighter2 = window.fightersData.find(f => f.id === fight.fighter2Id || f.id === fight.fighter2id);
    
    // Calcular tempo total da luta
    const rounds = fight.rounds || 3;
    let timeString;
    if (rounds === 5) {
        timeString = "30min 20seg";
    } else {
        timeString = "17min 20seg";
    }
    
    const infoHtml = `
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <h6 class="text-warning mb-2">Lutador 1</h6>
                    <div class="text-white">
                        <strong>Nome:</strong> ${fighter1 ? fighter1.name : 'N/A'}<br>
                        <strong>Record:</strong> ${fighter1 ? `${fighter1.wins || 0}-${fighter1.losses || 0}-${fighter1.draws || 0}` : 'N/A'}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <h6 class="text-warning mb-2">Lutador 2</h6>
                    <div class="text-white">
                        <strong>Nome:</strong> ${fighter2 ? fighter2.name : 'N/A'}<br>
                        <strong>Record:</strong> ${fighter2 ? `${fighter2.wins || 0}-${fighter2.losses || 0}-${fighter2.draws || 0}` : 'N/A'}
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <div class="mb-3">
                    <h6 class="text-warning mb-2">Detalhes da Luta</h6>
                    <div class="text-white">
                        <strong>Categoria:</strong> ${fight.weightClass || fight.weightclass}<br>
                        <strong>Rounds:</strong> ${fight.rounds || 3}<br>
                        <strong>Duração:</strong> ${timeString}<br>
                        <strong>Status:</strong> 
                        ${fight.is_live ? '<span class="badge bg-danger">IN PROGRESS</span>' : ''}
                        ${fight.is_finished ? '<span class="badge bg-success">FINALIZADA</span>' : ''}
                        ${!fight.is_live && !fight.is_finished ? '<span class="badge bg-secondary">AGUARDANDO</span>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('fightControlInfo').innerHTML = infoHtml;
}

// Popular selects do formulário
function populateFightControlSelects(fight) {
    const fighter1 = window.fightersData.find(f => f.id === fight.fighter1Id || f.id === fight.fighter1id);
    const fighter2 = window.fightersData.find(f => f.id === fight.fighter2Id || f.id === fight.fighter2id);
    
    // Popular select de vencedor
    const winnerSelect = document.getElementById('winnerSelect');
    winnerSelect.innerHTML = '<option value="">Selecione...</option>';
    
    if (fighter1) {
        winnerSelect.innerHTML += `<option value="${fighter1.id}">${fighter1.name}</option>`;
    }
    if (fighter2) {
        winnerSelect.innerHTML += `<option value="${fighter2.id}">${fighter2.name}</option>`;
    }
    
    // Gerar opções de round baseadas no número real de rounds da luta
    const finalRoundSelect = document.getElementById('finalRound');
    const maxRounds = fight.rounds || 3;
    
    finalRoundSelect.innerHTML = '<option value="">Selecione...</option>';
    for (let i = 1; i <= maxRounds; i++) {
        finalRoundSelect.innerHTML += `<option value="${i}">Round ${i}</option>`;
    }
    
    // Se já tem resultado, preencher
    if (fight.result_type) {
        document.getElementById('resultType').value = fight.result_type;
        handleResultTypeChange(); // Aplicar lógica de habilitação/desabilitação
    }
    if (fight.final_round) {
        document.getElementById('finalRound').value = fight.final_round;
    }
    if (fight.final_time) {
        document.getElementById('finalTime').value = fight.final_time;
    }
    if (fight.winner_id) {
        document.getElementById('winnerSelect').value = fight.winner_id;
    }
    
    // Adicionar event listeners para os selects
    document.getElementById('resultType').addEventListener('change', handleResultTypeChange);
    document.getElementById('finalRound').addEventListener('change', handleFinalRoundChange);
}

// Função para lidar com mudança no tipo de resultado
function handleResultTypeChange() {
    const resultType = document.getElementById('resultType').value;
    const finalRoundSelect = document.getElementById('finalRound');
    const finalTimeInput = document.getElementById('finalTime');
    
    // Obter o número de rounds da luta atual
    const fightId = document.getElementById('controlFightId').value;
    const currentFight = window.fightsData.find(f => f.id === parseInt(fightId));
    const maxRounds = currentFight ? (currentFight.rounds || 3) : 3;
    
    if (resultType === 'DE') {
        // Para decisão, preencher automaticamente com o número real de rounds da luta
        finalRoundSelect.value = maxRounds;
        finalTimeInput.value = '05:00';
        
        // Não desabilitar os campos - apenas preencher automaticamente
        finalRoundSelect.disabled = false;
        finalTimeInput.disabled = false;
    } else {
        // Para outros tipos, habilitar os campos
        finalRoundSelect.disabled = false;
        finalTimeInput.disabled = false;
        
        // Limpar valores se não estavam preenchidos
        if (!finalRoundSelect.value) {
            finalRoundSelect.value = '';
        }
        if (!finalTimeInput.value) {
            finalTimeInput.value = '';
        }
    }
}

// Função para lidar com mudança no round final
function handleFinalRoundChange() {
    const finalRound = document.getElementById('finalRound').value;
    const finalTimeInput = document.getElementById('finalTime');
    
    if (finalRound) {
        // Se round final foi selecionado, definir tempo padrão do round
        finalTimeInput.value = '05:00';
    }
}



// Atualizar estado dos botões
function updateControlButtons(fight) {
    const startBtn = document.getElementById('startLiveBtn');
    const stopBtn = document.getElementById('stopLiveBtn');
    
    if (fight.is_live) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
    } else {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
    }
}

// Iniciar luta ao vivo
async function startFightLive() {
    try {
        const fightId = document.getElementById('controlFightId').value;
        
        // Buscar dados da luta para calcular o tempo total
        const fight = window.fightsData.find(f => f.id === parseInt(fightId));
        if (!fight) {
            alert('Luta não encontrada');
            return;
        }
        
        // Calcular tempo total da luta baseado no número de rounds
        const rounds = fight.rounds || 3;
        if (rounds === 5) {
            totalFightTime = 30 * 60 + 20; // 30min 20seg para 5 rounds
        } else {
            totalFightTime = 17 * 60 + 20; // 17min 20seg para 3 rounds
        }
        
        // Iniciar cronômetro da luta
        fightStartTime = new Date();
        startFightTimer();
        
        const response = await apiCall(`fights/${fightId}/start-live`, 'POST');
        
        if (response) {
            // Atualizar dados da luta
            const fightIndex = window.fightsData.findIndex(f => f.id === parseInt(fightId));
            if (fightIndex !== -1) {
                window.fightsData[fightIndex] = { ...window.fightsData[fightIndex], ...response };
            }
            
            // Atualizar interface
            updateControlButtons(response);
            
            // Atualizar informações da luta
            populateFightControlInfo(response);
            
            // Recarregar lutas do evento
            if (selectedEvent) {
                await loadEventFights(selectedEvent.id, true);
            }
        }
    } catch (error) {
        console.error('Error starting fight live:', error);
        alert('Erro ao iniciar luta ao vivo');
    }
}

// Parar luta ao vivo
async function stopFightLive() {
    try {
        const fightId = document.getElementById('controlFightId').value;
        
        // Parar timer
        stopFightTimer();
        fightStartTime = null;
        
        const response = await apiCall(`fights/${fightId}/stop-live`, 'POST');
        
        if (response) {
            // Atualizar dados da luta
            const fightIndex = window.fightsData.findIndex(f => f.id === parseInt(fightId));
            if (fightIndex !== -1) {
                window.fightsData[fightIndex] = { ...window.fightsData[fightIndex], ...response };
            }
            
            // Atualizar interface
            updateControlButtons(response);
            
            // Atualizar informações da luta
            populateFightControlInfo(response);
            
            // Recarregar lutas do evento
            if (selectedEvent) {
                await loadEventFights(selectedEvent.id, true);
            }
        }
    } catch (error) {
        console.error('Error stopping fight live:', error);
        alert('Erro ao parar luta ao vivo');
    }
}





// Salvar resultado da luta
async function saveFightResult() {
    try {
        const fightId = document.getElementById('controlFightId').value;
        const resultType = document.getElementById('resultType').value;
        const finalRound = document.getElementById('finalRound').value;
        const finalTime = document.getElementById('finalTime').value;
        const winnerId = document.getElementById('winnerSelect').value;
        
        // Validações
        if (!resultType || !finalRound || !finalTime || !winnerId) {
            alert('Por favor, preencha todos os campos do resultado');
            return;
        }
        
        // Se for decisão dos juízes, o round final deve ser o último
        if (resultType === 'DE') {
            const fight = window.fightsData.find(f => f.id === parseInt(fightId));
            const maxRounds = fight ? (fight.rounds || 3) : 3;
            if (parseInt(finalRound) !== maxRounds) {
                alert(`Para decisão dos juízes, o round final deve ser o último round da luta (${maxRounds})`);
                return;
            }
        }
        
        const resultData = {
            resultType: resultType,
            finalRound: parseInt(finalRound),
            finalTime: finalTime,
            winnerId: parseInt(winnerId)
        };
        
        const response = await apiCall(`fights/${fightId}/save-result`, 'POST', resultData);
        
        if (response) {
            // Atualizar dados da luta
            const fightIndex = window.fightsData.findIndex(f => f.id === parseInt(fightId));
            if (fightIndex !== -1) {
                window.fightsData[fightIndex] = { ...window.fightsData[fightIndex], ...response };
            }
            

            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('fightControlModal'));
            modal.hide();
            
            // Recarregar lutas do evento
            if (selectedEvent) {
                await loadEventFights(selectedEvent.id, true);
            }
            
            alert('Resultado salvo com sucesso!');
        }
    } catch (error) {
        console.error('Error saving fight result:', error);
        alert('Erro ao salvar resultado da luta');
    }
}

// Limpar resultado da luta
async function clearFightResult() {
    if (confirm('Tem certeza que deseja limpar o resultado da luta? Esta ação irá remover todos os dados salvos.')) {
        try {
            const fightId = document.getElementById('controlFightId').value;
            
            if (!fightId) {
                alert('ID da luta não encontrado');
                return;
            }
            
            // Chamar API para limpar resultado no banco de dados
            const response = await apiCall(`fights/${fightId}/clear-result`, 'POST');
            
            if (response) {
                // Atualizar dados da luta no frontend
                const fightIndex = window.fightsData.findIndex(f => f.id === parseInt(fightId));
                if (fightIndex !== -1) {
                    window.fightsData[fightIndex] = { ...window.fightsData[fightIndex], ...response };
                }
                
                // Limpar campos do formulário
                document.getElementById('resultType').value = '';
                document.getElementById('finalRound').value = '';
                document.getElementById('finalTime').value = '';
                document.getElementById('winnerSelect').value = '';
                
                // Parar timer da luta se estiver rodando
                stopFightTimer();
                
                // Resetar cronômetro da luta
                const fightTimerElement = document.getElementById('fightTimer');
                if (fightTimerElement) {
                    fightTimerElement.textContent = '00:00';
                }
                
                // Resetar botões de controle ao vivo
                document.getElementById('startLiveBtn').style.display = 'inline-block';
                document.getElementById('stopLiveBtn').style.display = 'none';
                
                // Recarregar lutas do evento para atualizar a interface
                if (selectedEvent) {
                    await loadEventFights(selectedEvent.id, true);
                }
                
                alert('Resultado da luta foi limpo com sucesso!');
            }
            
        } catch (error) {
            console.error('Error clearing fight result:', error);
            alert('Erro ao limpar resultado da luta');
        }
    }
}

// Event listener para mudança no tipo de resultado
document.addEventListener('DOMContentLoaded', function() {
    const resultTypeSelect = document.getElementById('resultType');
    if (resultTypeSelect) {
        resultTypeSelect.addEventListener('change', handleResultTypeChange);
    }
    
    const finalRoundSelect = document.getElementById('finalRound');
    if (finalRoundSelect) {
        finalRoundSelect.addEventListener('change', handleFinalRoundChange);
    }
}); 

// Iniciar timer da luta (cronômetro total)
function startFightTimer() {
    stopFightTimer(); // Parar timer anterior se existir
    
    fightTimerInterval = setInterval(() => {
        if (fightStartTime) {
            const elapsed = Math.floor((new Date() - fightStartTime) / 1000);
            const remaining = Math.max(0, totalFightTime - elapsed);
            
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            
            // Atualizar o display do cronômetro da luta
            const fightTimerElement = document.getElementById('fightTimer');
            if (fightTimerElement) {
                fightTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Se o tempo acabou, parar o timer
            if (remaining <= 0) {
                stopFightTimer();
            }
        }
    }, 1000);
}

// Parar timer da luta
function stopFightTimer() {
    if (fightTimerInterval) {
        clearInterval(fightTimerInterval);
        fightTimerInterval = null;
    }
} 