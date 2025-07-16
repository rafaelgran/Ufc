// Global variables
let socket;
let currentFight = null;
let fightTimer = null;
let currentRoundTime = 300; // 5 minutes in seconds
let isPaused = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    loadData();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Form event listeners
    document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
    document.getElementById('fighterForm').addEventListener('submit', handleFighterSubmit);
    document.getElementById('fightForm').addEventListener('submit', handleFightSubmit);
    
    // Live control event listeners
    document.getElementById('liveFightSelect').addEventListener('change', handleLiveFightSelect);
    document.getElementById('startFightBtn').addEventListener('click', startFight);
    document.getElementById('pauseFightBtn').addEventListener('click', pauseFight);
    document.getElementById('resumeFightBtn').addEventListener('click', resumeFight);
    document.getElementById('endFightBtn').addEventListener('click', endFight);
});

// Socket.io initialization
function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('fightUpdate', (data) => {
        console.log('Fight update received:', data);
        if (currentFight && currentFight.id === data.fightId) {
            updateLiveFightDisplay(data);
        }
    });
}

// Load all data
async function loadData() {
    await Promise.all([
        loadEvents(),
        loadFighters(),
        loadFights(),
        loadLiveFights()
    ]);
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}

// API functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showAlert('Erro na operação: ' + error.message, 'danger');
        throw error;
    }
}

// Events management
async function loadEvents() {
    try {
        const events = await apiCall('events');
        displayEvents(events);
        populateEventSelects(events);
    } catch (error) {
        console.error('Failed to load events:', error);
    }
}

function displayEvents(events) {
    const container = document.getElementById('eventsList');
    
    if (events.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum evento encontrado.</p>';
        return;
    }
    
    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Data</th>
                    <th>Local</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${events.map(event => `
                    <tr>
                        <td>${event.name}</td>
                        <td>${formatDate(event.date)}</td>
                        <td>${event.location || 'N/A'}</td>
                        <td><span class="status-badge status-${event.status}">${getStatusText(event.status)}</span></td>
                        <td>
                            <button class="btn btn-sm btn-warning me-1" onclick="editEvent('${event.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('eventName').value,
        date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value,
        venue: document.getElementById('eventVenue').value,
        mainEvent: document.getElementById('eventMainEvent').value
    };
    
    try {
        await apiCall('events', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('Evento criado com sucesso!', 'success');
        document.getElementById('eventForm').reset();
        loadEvents();
    } catch (error) {
        console.error('Failed to create event:', error);
    }
}

// Fighters management
async function loadFighters() {
    try {
        const fighters = await apiCall('fighters');
        displayFighters(fighters);
        populateFighterSelects(fighters);
    } catch (error) {
        console.error('Failed to load fighters:', error);
    }
}

function displayFighters(fighters) {
    const container = document.getElementById('fightersList');
    
    if (fighters.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum lutador encontrado.</p>';
        return;
    }
    
    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Apelido</th>
                    <th>Record</th>
                    <th>Categoria</th>
                    <th>Ranking</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${fighters.map(fighter => `
                    <tr>
                        <td>${fighter.name}</td>
                        <td>${fighter.nickname || 'N/A'}</td>
                        <td>${fighter.record || 'N/A'}</td>
                        <td>${fighter.weightClass || 'N/A'}</td>
                        <td>${fighter.ranking || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning me-1" onclick="editFighter('${fighter.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFighter('${fighter.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

async function handleFighterSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('fighterName').value,
        nickname: document.getElementById('fighterNickname').value,
        record: document.getElementById('fighterRecord').value,
        weightClass: document.getElementById('fighterWeightClass').value,
        ranking: document.getElementById('fighterRanking').value || null,
        photo: document.getElementById('fighterPhoto').value
    };
    
    try {
        await apiCall('fighters', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('Lutador adicionado com sucesso!', 'success');
        document.getElementById('fighterForm').reset();
        loadFighters();
    } catch (error) {
        console.error('Failed to create fighter:', error);
    }
}

// Fights management
async function loadFights() {
    try {
        const fights = await apiCall('fights');
        displayFights(fights);
    } catch (error) {
        console.error('Failed to load fights:', error);
    }
}

function displayFights(fights) {
    const container = document.getElementById('fightsList');
    
    if (fights.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma luta encontrada.</p>';
        return;
    }
    
    const table = `
        <table class="table">
            <thead>
                <tr>
                    <th>Lutador 1</th>
                    <th>VS</th>
                    <th>Lutador 2</th>
                    <th>Categoria</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${fights.map(fight => `
                    <tr>
                        <td>${fight.fighter1Name}</td>
                        <td class="text-center"><strong>VS</strong></td>
                        <td>${fight.fighter2Name}</td>
                        <td>${fight.weightClass}</td>
                        <td><span class="status-badge status-${fight.status}">${getStatusText(fight.status)}</span></td>
                        <td>
                            <button class="btn btn-sm btn-success me-1" onclick="startFightFromList('${fight.id}')">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFight('${fight.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

async function handleFightSubmit(e) {
    e.preventDefault();
    
    const formData = {
        eventId: document.getElementById('fightEvent').value,
        fighter1Id: document.getElementById('fighter1').value,
        fighter2Id: document.getElementById('fighter2').value,
        weightClass: document.getElementById('fightWeightClass').value,
        rounds: parseInt(document.getElementById('fightRounds').value)
    };
    
    try {
        await apiCall('fights', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('Luta criada com sucesso!', 'success');
        document.getElementById('fightForm').reset();
        loadFights();
        loadLiveFights();
    } catch (error) {
        console.error('Failed to create fight:', error);
    }
}

// Live fights management
async function loadLiveFights() {
    try {
        const fights = await apiCall('fights');
        populateLiveFightSelect(fights.filter(f => f.status !== 'finished'));
    } catch (error) {
        console.error('Failed to load live fights:', error);
    }
}

function populateLiveFightSelect(fights) {
    const select = document.getElementById('liveFightSelect');
    select.innerHTML = '<option value="">Selecione uma luta...</option>';
    
    fights.forEach(fight => {
        const option = document.createElement('option');
        option.value = fight.id;
        option.textContent = `${fight.fighter1Name} vs ${fight.fighter2Name}`;
        select.appendChild(option);
    });
}

async function handleLiveFightSelect(e) {
    const fightId = e.target.value;
    
    if (!fightId) {
        document.getElementById('liveFightControl').style.display = 'none';
        currentFight = null;
        return;
    }
    
    try {
        const fights = await apiCall('fights');
        const fight = fights.find(f => f.id === fightId);
        
        if (fight) {
            currentFight = fight;
            displayLiveFight(fight);
            document.getElementById('liveFightControl').style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to load fight details:', error);
    }
}

function displayLiveFight(fight) {
    document.getElementById('liveFighter1Name').textContent = fight.fighter1Name;
    document.getElementById('liveFighter1Record').textContent = fight.fighter1Record || 'N/A';
    document.getElementById('liveFighter1Photo').src = fight.fighter1Photo || 'https://via.placeholder.com/80';
    
    document.getElementById('liveFighter2Name').textContent = fight.fighter2Name;
    document.getElementById('liveFighter2Record').textContent = fight.fighter2Record || 'N/A';
    document.getElementById('liveFighter2Photo').src = fight.fighter2Photo || 'https://via.placeholder.com/80';
    
    document.getElementById('liveStatus').textContent = getStatusText(fight.status);
    document.getElementById('liveStatus').className = `status-badge status-${fight.status}`;
    
    updateTimerDisplay(fight.roundTime || '05:00');
    
    updateControlButtons(fight.status);
}

function updateControlButtons(status) {
    const startBtn = document.getElementById('startFightBtn');
    const pauseBtn = document.getElementById('pauseFightBtn');
    const resumeBtn = document.getElementById('resumeFightBtn');
    
    startBtn.style.display = status === 'scheduled' ? 'inline-block' : 'none';
    pauseBtn.style.display = status === 'live' ? 'inline-block' : 'none';
    resumeBtn.style.display = status === 'paused' ? 'inline-block' : 'none';
}

// Timer functions
function updateTimerDisplay(timeString) {
    document.getElementById('liveTimer').textContent = timeString;
}

function startFight() {
    if (!currentFight) return;
    
    currentRoundTime = 300; // 5 minutes
    isPaused = false;
    
    updateFightStatus('live');
    startTimer();
}

function pauseFight() {
    isPaused = true;
    updateFightStatus('paused');
    if (fightTimer) {
        clearInterval(fightTimer);
    }
}

function resumeFight() {
    isPaused = false;
    updateFightStatus('live');
    startTimer();
}

function endFight() {
    if (fightTimer) {
        clearInterval(fightTimer);
    }
    
    const winner = prompt('Quem venceu? (1 para Lutador 1, 2 para Lutador 2)');
    const method = prompt('Método da vitória? (ex: KO, Submission, Decision)');
    
    if (winner && method) {
        const winnerId = winner === '1' ? currentFight.fighter1Id : currentFight.fighter2Id;
        updateFightStatus('finished', winnerId, method);
    }
}

function startTimer() {
    if (fightTimer) {
        clearInterval(fightTimer);
    }
    
    fightTimer = setInterval(() => {
        if (!isPaused) {
            currentRoundTime--;
            
            if (currentRoundTime <= 0) {
                // Round ended
                if (currentFight.currentRound < currentFight.rounds) {
                    currentFight.currentRound++;
                    currentRoundTime = 300; // Reset to 5 minutes
                    updateFightStatus('live');
                } else {
                    // Fight ended
                    clearInterval(fightTimer);
                    updateFightStatus('finished');
                }
            }
            
            const minutes = Math.floor(currentRoundTime / 60);
            const seconds = currentRoundTime % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            updateTimerDisplay(timeString);
        }
    }, 1000);
}

async function updateFightStatus(status, winner = null, method = null) {
    if (!currentFight) return;
    
    const updateData = {
        status,
        currentRound: currentFight.currentRound,
        roundTime: `${Math.floor(currentRoundTime / 60).toString().padStart(2, '0')}:${(currentRoundTime % 60).toString().padStart(2, '0')}`,
        winner,
        method
    };
    
    try {
        await apiCall(`fights/${currentFight.id}/status`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        currentFight = { ...currentFight, ...updateData };
        displayLiveFight(currentFight);
        
        if (status === 'finished') {
            showAlert('Luta finalizada!', 'success');
            loadLiveFights();
        }
    } catch (error) {
        console.error('Failed to update fight status:', error);
    }
}

// Utility functions
function populateEventSelects(events) {
    const select = document.getElementById('fightEvent');
    select.innerHTML = '<option value="">Selecione um evento...</option>';
    
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.name;
        select.appendChild(option);
    });
}

function populateFighterSelects(fighters) {
    const selects = [document.getElementById('fighter1'), document.getElementById('fighter2')];
    
    selects.forEach(select => {
        select.innerHTML = '<option value="">Selecione um lutador...</option>';
        
        fighters.forEach(fighter => {
            const option = document.createElement('option');
            option.value = fighter.id;
            option.textContent = fighter.name;
            select.appendChild(option);
        });
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getStatusText(status) {
    const statusMap = {
        'scheduled': 'Agendado',
        'live': 'Ao Vivo',
        'paused': 'Pausado',
        'finished': 'Finalizado'
    };
    return statusMap[status] || status;
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Placeholder functions for edit/delete operations
function editEvent(id) {
    showAlert('Funcionalidade de edição será implementada em breve.', 'info');
}

function deleteEvent(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        apiCall(`events/${id}`, { method: 'DELETE' })
            .then(() => {
                showAlert('Evento excluído com sucesso!', 'success');
                loadEvents();
            })
            .catch(error => {
                console.error('Failed to delete event:', error);
            });
    }
}

function editFighter(id) {
    showAlert('Funcionalidade de edição será implementada em breve.', 'info');
}

function deleteFighter(id) {
    if (confirm('Tem certeza que deseja excluir este lutador?')) {
        apiCall(`fighters/${id}`, { method: 'DELETE' })
            .then(() => {
                showAlert('Lutador excluído com sucesso!', 'success');
                loadFighters();
            })
            .catch(error => {
                console.error('Failed to delete fighter:', error);
            });
    }
}

function deleteFight(id) {
    if (confirm('Tem certeza que deseja excluir esta luta?')) {
        apiCall(`fights/${id}`, { method: 'DELETE' })
            .then(() => {
                showAlert('Luta excluída com sucesso!', 'success');
                loadFights();
                loadLiveFights();
            })
            .catch(error => {
                console.error('Failed to delete fight:', error);
            });
    }
}

function startFightFromList(id) {
    // Switch to live tab and select the fight
    const liveTab = document.getElementById('live-tab');
    const tab = new bootstrap.Tab(liveTab);
    tab.show();
    
    document.getElementById('liveFightSelect').value = id;
    handleLiveFightSelect({ target: { value: id } });
} 