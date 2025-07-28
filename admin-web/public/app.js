// Global variables
let socket;
let currentFight = null;
let fightTimer = null;
let currentRoundTime = 300; // 5 minutes in seconds
let isPaused = false;
let currentEventFilter = 'upcoming';
let selectedEvent = null;

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
            console.log('Adding click listener to tab:', tabId);
            tabButton.addEventListener('click', function() {
                console.log('Tab clicked:', tabId);
                navigateToTab(tabId);
            });
        } else {
            console.warn('Tab button not found:', tabId);
        }
    });
}

function activateTab(tabId) {
    console.log('Activating tab:', tabId);
    
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
        console.log('Activated tab button:', tabId);
    } else {
        console.warn('Active tab button not found:', tabId);
    }
    
    if (activeTabPane) {
        activeTabPane.classList.add('show', 'active');
        console.log('Activated tab pane:', tabId);
    } else {
        console.warn('Active tab pane not found:', tabId);
    }
    
    // Don't update URL hash here to avoid conflicts
    // The hash is already set by navigateToTab or other functions
}

function navigateToTab(tabId) {
    console.log('Navigating to tab:', tabId);
    
    // Check if it's an event hash
    if (tabId.startsWith('event-')) {
        console.log('🔍 Event hash detected in navigateToTab:', tabId);
        // Don't activate tab here, let restoreSelectedEvent handle it
        window.location.hash = tabId;
        return;
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
        await Promise.all([
            loadEvents(),
            loadFighters()
        ]);
        
        // Load fights separately for internal use in events
        try {
            const fights = await apiCall('fights');
            window.fightsData = fights;
        } catch (error) {
            console.error('Failed to load fights:', error);
        }
        
        // Check for saved event in localStorage or hash
        // Use setTimeout to ensure DOM is ready
        setTimeout(async () => {
            await restoreSelectedEvent();
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
        
        displayEvents(events);
    } catch (error) {
        console.error('Failed to load events:', error);
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

function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="event-card" onclick="selectEvent(${event.id})" data-event-id="${event.id}">
                <div class="event-title">${event.name}</div>
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
                    <button class="btn btn-danger btn-sm ms-2" onclick="deleteEvent(${event.id}); event.stopPropagation();">
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
    
    // Update title
    document.getElementById('eventDetailsTitle').textContent = event.name;
    
    // Load fights for this event
    loadEventFightsByType(event.id);
    
    // Navigate to event details tab
    navigateToTab('event-details');
}

function loadEventFights(eventId) {
    // Filter fights for this event
    const eventFights = window.fightsData ? window.fightsData.filter(fight => fight.eventId == eventId || fight.eventid == eventId) : [];
    
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
    
    const fightsHTML = eventFights.map(fight => createFightItem(fight)).join('');
    fightsContainer.innerHTML = fightsHTML;
}

function createFightItem(fight) {
    const fighter1 = window.fightersData ? window.fightersData.find(f => f.id == fight.fighter1Id || f.id == fight.fighter1id) : null;
    const fighter2 = window.fightersData ? window.fightersData.find(f => f.id == fight.fighter2Id || f.id == fight.fighter2id) : null;
    
    // Check if this is a championship fight (has a champion)
    const isChampionship = (fighter1 && fighter1.ranking === 'C') || (fighter2 && fighter2.ranking === 'C');
    const championshipClass = isChampionship ? 'championship-fight' : '';
    
    return `
        <div class="fight-item ${championshipClass}" draggable="true" data-fight-id="${fight.id}" data-fight-order="${fight.fightOrder || fight.fightorder || 0}">
            <div class="fight-order-badge">${fight.fightOrder || fight.fightorder || '?'}</div>
            <div class="fight-actions">
                <button class="btn btn-warning btn-sm" onclick="editFight(${fight.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                <button class="btn btn-danger btn-sm" onclick="deleteFight(${fight.id})">
                                <i class="fas fa-trash"></i>
                            </button>
            </div>
            <div class="fight-fighters">
                <div class="fighter">
                    <div class="fighter-name">${fighter1 ? fighter1.name : 'Lutador 1'}</div>
                    <div class="fighter-record">${fighter1 ? fighter1.record || 'N/A' : 'N/A'}</div>
                </div>
                <div class="vs-divider">VS</div>
                <div class="fighter">
                    <div class="fighter-name">${fighter2 ? fighter2.name : 'Lutador 2'}</div>
                    <div class="fighter-record">${fighter2 ? fighter2.record || 'N/A' : 'N/A'}</div>
                </div>
            </div>
            <div class="fight-details">
                <strong>${fight.weightClass || fight.weightclass}</strong> • ${fight.rounds || 3} rounds
                ${isChampionship ? '<br><span style="color: #ffd700; font-weight: bold;">🏆 Luta de Campeonato</span>' : ''}
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
    
    const eventData = {
        name: document.getElementById('eventName').value,
        date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value,
        venue: document.getElementById('eventVenue').value
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
}

// Event details form handler
async function handleEventDetailsSubmit(e) {
    e.preventDefault();
    
    const eventData = {
        name: document.getElementById('eventDetailsName').value,
        date: document.getElementById('eventDetailsDateTime').value,
        location: document.getElementById('eventDetailsLocation').value,
        venue: document.getElementById('eventDetailsVenue').value
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
        displayFighters(fighters);
        populateFighterSelects(fighters);
    } catch (error) {
        console.error('Failed to load fighters:', error);
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
        
        await loadFighters();
        resetFighterForm();
        
    } catch (error) {
        console.error('Failed to save fighter:', error);
        alert('Erro ao salvar lutador: ' + error.message);
    }
}

function editFighter(fighterId) {
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
    
    // Calculate and display record
    calculateRecord();
    
    const modal = new bootstrap.Modal(document.getElementById('fighterModal'));
    modal.show();
}

async function deleteFighter(fighterId) {
    if (!confirm('Tem certeza que deseja excluir este lutador?')) return;
    
    try {
        await apiCall(`fighters/${fighterId}`, 'DELETE');
        await loadFighters();
    } catch (error) {
        console.error('Failed to delete fighter:', error);
        alert('Erro ao excluir lutador: ' + error.message);
    }
}

function resetFighterForm() {
    document.getElementById('fighterForm').reset();
    document.getElementById('fighterId').value = '';
    document.getElementById('fighterCountry').value = '';
    calculateRecord();
}

function calculateRecord() {
    const wins = parseInt(document.getElementById('fighterWins').value) || 0;
    const losses = parseInt(document.getElementById('fighterLosses').value) || 0;
    const draws = parseInt(document.getElementById('fighterDraws').value) || 0;
    
    document.getElementById('fighterRecordDisplay').value = `${wins}-${losses}-${draws}`;
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
    
    const fightData = {
        eventid: selectedEvent.id,
        fighter1id: document.getElementById('fighter1').value,
        fighter2id: document.getElementById('fighter2').value,
        weightclass: document.getElementById('fightWeightClass').value,
        fighttype: document.getElementById('fightType').value,
        rounds: parseInt(document.getElementById('fightRounds').value),
        fightorder: 1 // Default order
    };
    
    const fightId = document.getElementById('fightId').value;
    
    try {
        if (fightId) {
            await apiCall(`fights/${fightId}`, 'PUT', fightData);
        } else {
            await apiCall('fights', 'POST', fightData);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('fightModal'));
        modal.hide();
        
        await loadEventFights(selectedEvent.id);
        resetFightForm();
        
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
    
    // Set fighters after populating selects
    setTimeout(() => {
        document.getElementById('fighter1').value = fight.fighter1Id || fight.fighter1id || '';
        document.getElementById('fighter2').value = fight.fighter2Id || fight.fighter2id || '';
    }, 100);
    
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
        await loadEventFights(selectedEvent.id);
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
    
    // Sort fights by fightOrder
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
        const mainCardHTML = mainCardFights.map(fight => createFightItem(fight)).join('');
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
        const prelimsHTML = prelimFights.map(fight => createFightItem(fight)).join('');
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
    
    fightItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.fightId);
}

function handleDragEnd(e) {
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
    
    if (targetFightItem && targetFightItem.dataset.fightId !== draggedFightId) {
        const container = targetFightItem.parentElement;
        const fightItems = Array.from(container.querySelectorAll('.fight-item'));
        const draggedItem = container.querySelector(`[data-fight-id="${draggedFightId}"]`);
        
        if (draggedItem) {
            const targetIndex = fightItems.indexOf(targetFightItem);
            const draggedIndex = fightItems.indexOf(draggedItem);
            
            // Reorder the items
            if (targetIndex > draggedIndex) {
                targetFightItem.parentNode.insertBefore(draggedItem, targetFightItem.nextSibling);
            } else {
                targetFightItem.parentNode.insertBefore(draggedItem, targetFightItem);
            }
            
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
    const fightOrder = fightItems.map((item, index) => ({
        id: parseInt(item.dataset.fightId),
        order: index + 1
    }));
    
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
        
        console.log('Championship fights detected:', championshipDescriptions);
    }
} 