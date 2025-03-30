// Admin-Dashboard Echtzeit-Funktionalität

// Echtzeitdaten-Aktualisierung
let updateInterval;
let allBots = [];
let allUsers = [];
let systemLogs = [];

// DOM-Elemente für Statistiken
const registeredUsersElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
const activeBotsElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
const totalBotHoursElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
const activeServersElement = document.querySelector('.stat-card:nth-child(4) .stat-value');

// DOM-Elemente für Bots und Actions
const botTableBody = document.querySelector('#all-bots-content tbody');
const stopAllBotsBtn = document.getElementById('stop-all-bots'); // Wird im HTML hinzugefügt

/**
 * Initialisiere das Admin-Dashboard mit Echtzeit-Updates
 */
function initializeAdminDashboard() {
    console.log('Admin-Dashboard wird initialisiert...');
    
    // Prüfe, ob der Benutzer ein Admin ist
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') {
        console.error('Kein Admin-Zugriff!');
        window.location.href = 'index.html';
        return;
    }
    
    // Lade initiale Daten
    loadAllData();
    
    // Starte Echtzeit-Updates
    startRealTimeUpdates();
    
    // Event-Listener für "Alle Bots stoppen" Button
    if (stopAllBotsBtn) {
        stopAllBotsBtn.addEventListener('click', stopAllBots);
    }
    
    // Event-Listener für einzelne Bot-Aktionen
    document.addEventListener('click', function(event) {
        // Einzelne Bot-Aktionen
        if (event.target.classList.contains('action-btn')) {
            const action = event.target.textContent.trim();
            const row = event.target.closest('tr');
            const botId = row.getAttribute('data-bot-id');
            
            if (action === 'Stoppen') {
                stopBot(botId);
            } else if (action === 'Starten') {
                startBot(botId);
            } else if (action === 'Details') {
                showBotDetails(botId);
            } else if (action === 'Logs') {
                showBotLogs(botId);
            }
        }
    });
}

/**
 * Lädt alle Daten für das Admin-Dashboard
 */
function loadAllData() {
    // In einem echten System würden hier API-Aufrufe gemacht
    // Da wir client-seitig arbeiten, verwenden wir localStorage
    
    // Lade Benutzer
    loadUsers();
    
    // Lade Bots
    loadBots();
    
    // Lade System-Logs
    loadSystemLogs();
    
    // Aktualisiere Statistiken
    updateDashboardStats();
    
    // Aktualisiere Tabellen
    updateBotTable();
    updateUserTable();
    updateLogsTable();
}

/**
 * Lädt alle Benutzer aus der Datenbank
 */
function loadUsers() {
    try {
        // In einer realen Anwendung würde hier ein API-Aufruf stehen
        const dbData = localStorage.getItem('database');
        if (dbData) {
            const db = JSON.parse(dbData);
            allUsers = db.users || [];
        }
    } catch (error) {
        console.error('Fehler beim Laden der Benutzer:', error);
        allUsers = [];
    }
}

/**
 * Lädt alle Bots aus der Datenbank
 */
function loadBots() {
    try {
        // In einer realen Anwendung würde hier ein API-Aufruf stehen
        const dbData = localStorage.getItem('database');
        if (dbData) {
            const db = JSON.parse(dbData);
            allBots = db.bots || [];
        }
    } catch (error) {
        console.error('Fehler beim Laden der Bots:', error);
        allBots = [];
    }
}

/**
 * Lädt alle System-Logs aus der Datenbank
 */
function loadSystemLogs() {
    try {
        // In einer realen Anwendung würde hier ein API-Aufruf stehen
        const dbData = localStorage.getItem('database');
        if (dbData) {
            const db = JSON.parse(dbData);
            systemLogs = db.logs || [];
        }
    } catch (error) {
        console.error('Fehler beim Laden der Logs:', error);
        systemLogs = [];
    }
}

/**
 * Aktualisiert die Dashboard-Statistiken
 */
function updateDashboardStats() {
    if (registeredUsersElement) {
        registeredUsersElement.textContent = allUsers.length;
    }
    
    // Anzahl der aktiven Bots berechnen
    const activeBots = allBots.filter(bot => bot.status === 'online' || bot.status === 'connecting');
    if (activeBotsElement) {
        activeBotsElement.textContent = activeBots.length;
    }
    
    // Gesamte Bot-Laufzeit berechnen (in Stunden)
    const totalHours = allBots.reduce((total, bot) => {
        return total + (bot.onlineTime || 0);
    }, 0);
    if (totalBotHoursElement) {
        totalBotHoursElement.textContent = Math.round(totalHours);
    }
    
    // Aktive Server berechnen (eindeutige Server)
    const uniqueServers = new Set();
    activeBots.forEach(bot => {
        if (bot.server) {
            uniqueServers.add(bot.server);
        }
    });
    if (activeServersElement) {
        activeServersElement.textContent = uniqueServers.size;
    }
}

/**
 * Aktualisiert die Bot-Tabelle mit aktuellen Daten
 */
function updateBotTable() {
    if (!botTableBody) return;
    
    // Tabelle leeren
    botTableBody.innerHTML = '';
    
    // Sortiere Bots nach Status (online zuerst)
    const sortedBots = [...allBots].sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return 0;
    });
    
    // Alle Bots der Tabelle hinzufügen
    sortedBots.forEach(bot => {
        const row = document.createElement('tr');
        row.setAttribute('data-bot-id', bot.id);
        
        // Status-Text und -Klasse ermitteln
        let statusText = 'Offline';
        let statusClass = 'status-offline';
        
        if (bot.status === 'online') {
            statusText = 'Online';
            statusClass = 'status-online';
        } else if (bot.status === 'warning' || bot.status === 'unstable') {
            statusText = 'Verbindung instabil';
            statusClass = 'status-warning';
        } else if (bot.status === 'connecting') {
            statusText = 'Verbindet...';
            statusClass = 'status-warning';
        }
        
        // Online-Zeit formatieren
        const hours = Math.floor(bot.onlineTime || 0);
        const minutes = Math.floor(((bot.onlineTime || 0) - hours) * 60);
        const onlineTimeText = `${hours}h ${minutes}m`;
        
        // Zeile erstellen
        row.innerHTML = `
            <td>${bot.id || 'Bot-' + Math.floor(Math.random() * 1000)}</td>
            <td>${bot.owner || 'Unbekannt'}</td>
            <td>${bot.server || 'Nicht verbunden'}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>${onlineTimeText}</td>
            <td class="action-buttons">
                <button class="action-btn">Details</button>
                <button class="action-btn">Logs</button>
                ${bot.status === 'online' || bot.status === 'connecting' || bot.status === 'warning' ? 
                  '<button class="action-btn danger">Stoppen</button>' : 
                  '<button class="action-btn">Starten</button>'}
            </td>
        `;
        
        botTableBody.appendChild(row);
    });
}

/**
 * Aktualisiert die Benutzer-Tabelle
 */
function updateUserTable() {
    const userTableBody = document.querySelector('#all-users-content tbody');
    if (!userTableBody) return;
    
    // Tabelle leeren
    userTableBody.innerHTML = '';
    
    // Benutzer der Tabelle hinzufügen
    allUsers.forEach(user => {
        const row = document.createElement('tr');
        row.setAttribute('data-user-id', user.id);
        
        // Status ermitteln
        const isActive = user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const isBanned = user.banned;
        
        let statusText = isActive ? 'Aktiv' : 'Inaktiv';
        let statusClass = isActive ? 'status-online' : 'status-offline';
        
        if (isBanned) {
            statusText = 'Gesperrt';
            statusClass = 'status-offline';
        }
        
        // Registrierungsdatum formatieren
        const regDate = user.registrationDate ? new Date(user.registrationDate) : new Date();
        const formattedDate = `${regDate.getDate()}.${regDate.getMonth() + 1}.${regDate.getFullYear()}`;
        
        row.innerHTML = `
            <td>${user.username || 'Unbekannt'}</td>
            <td>${user.email || 'Keine E-Mail'}</td>
            <td>${formattedDate}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td class="action-buttons">
                <button class="action-btn">Bearbeiten</button>
                <button class="action-btn">Details</button>
                ${!isBanned ? 
                  '<button class="action-btn danger">Sperren</button>' : 
                  '<button class="action-btn">Entsperren</button>'}
            </td>
        `;
        
        userTableBody.appendChild(row);
    });
}

/**
 * Aktualisiert die Logs-Tabelle
 */
function updateLogsTable() {
    const logsTableBody = document.querySelector('#all-logs-content tbody');
    if (!logsTableBody) return;
    
    // Tabelle leeren
    logsTableBody.innerHTML = '';
    
    // Sortiere Logs nach Zeitstempel (neueste zuerst)
    const sortedLogs = [...systemLogs].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Max. 100 Logs anzeigen
    const limitedLogs = sortedLogs.slice(0, 100);
    
    // Logs der Tabelle hinzufügen
    limitedLogs.forEach(log => {
        const row = document.createElement('tr');
        
        // Zeitstempel formatieren
        const logDate = new Date(log.timestamp);
        const formattedDate = `${logDate.getDate()}.${logDate.getMonth() + 1}.${logDate.getFullYear()} ${logDate.getHours()}:${logDate.getMinutes()}:${logDate.getSeconds()}`;
        
        // Status-Klasse ermitteln
        let statusClass = 'status-online'; // Info = grün
        
        if (log.type === 'error') {
            statusClass = 'status-offline';
        } else if (log.type === 'warning') {
            statusClass = 'status-warning';
        }
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><span class="status ${statusClass}">${log.type || 'Info'}</span></td>
            <td>${log.source || 'System'}</td>
            <td>${log.message || 'Keine Nachricht'}</td>
        `;
        
        logsTableBody.appendChild(row);
    });
}

/**
 * Startet die Echtzeit-Aktualisierung der Daten
 */
function startRealTimeUpdates() {
    // Bestehende Intervalle stoppen
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Neue Daten alle 5 Sekunden laden
    updateInterval = setInterval(() => {
        loadAllData();
    }, 5000);
}

/**
 * Stoppt die Echtzeit-Aktualisierung der Daten
 */
function stopRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

/**
 * Stoppt alle aktiven Bots
 */
function stopAllBots() {
    const activeBots = allBots.filter(bot => 
        bot.status === 'online' || 
        bot.status === 'connecting' || 
        bot.status === 'warning'
    );
    
    if (activeBots.length === 0) {
        showToast('Keine aktiven Bots zum Stoppen vorhanden', 'info');
        return;
    }
    
    // Bestätigung anfordern
    if (confirm(`Möchten Sie wirklich alle ${activeBots.length} aktiven Bots stoppen?`)) {
        // In einem echten System würde hier ein API-Aufruf zum Stoppen aller Bots erfolgen
        const timestamp = new Date().toISOString();
        
        // Status aller Bots aktualisieren
        allBots = allBots.map(bot => {
            if (bot.status === 'online' || bot.status === 'connecting' || bot.status === 'warning') {
                return {
                    ...bot,
                    status: 'offline',
                    lastStatusChange: timestamp
                };
            }
            return bot;
        });
        
        // Datenbank aktualisieren
        updateDatabase();
        
        // Log-Eintrag erstellen
        addSystemLog('Administrator hat alle Bots gestoppt', 'info', 'System');
        
        // UI aktualisieren
        updateDashboardStats();
        updateBotTable();
        
        showToast(`${activeBots.length} Bots wurden erfolgreich gestoppt`, 'success');
    }
}

/**
 * Stoppt einen einzelnen Bot
 * @param {string} botId - Die ID des zu stoppenden Bots
 */
function stopBot(botId) {
    // Bot finden
    const botIndex = allBots.findIndex(bot => bot.id === botId);
    if (botIndex === -1) {
        showToast('Bot nicht gefunden', 'error');
        return;
    }
    
    // In einem echten System würde hier ein API-Aufruf zum Stoppen des Bots erfolgen
    const timestamp = new Date().toISOString();
    
    // Bot-Status aktualisieren
    allBots[botIndex] = {
        ...allBots[botIndex],
        status: 'offline',
        lastStatusChange: timestamp
    };
    
    // Datenbank aktualisieren
    updateDatabase();
    
    // Log-Eintrag erstellen
    addSystemLog(`Administrator hat Bot ${botId} gestoppt`, 'info', 'System');
    
    // UI aktualisieren
    updateDashboardStats();
    updateBotTable();
    
    showToast(`Bot ${botId} wurde erfolgreich gestoppt`, 'success');
}

/**
 * Startet einen einzelnen Bot
 * @param {string} botId - Die ID des zu startenden Bots
 */
function startBot(botId) {
    // Bot finden
    const botIndex = allBots.findIndex(bot => bot.id === botId);
    if (botIndex === -1) {
        showToast('Bot nicht gefunden', 'error');
        return;
    }
    
    // In einem echten System würde hier ein API-Aufruf zum Starten des Bots erfolgen
    const timestamp = new Date().toISOString();
    
    // Bot-Status aktualisieren
    allBots[botIndex] = {
        ...allBots[botIndex],
        status: 'connecting',
        lastStatusChange: timestamp
    };
    
    // Datenbank aktualisieren
    updateDatabase();
    
    // Log-Eintrag erstellen
    addSystemLog(`Administrator hat Bot ${botId} gestartet`, 'info', 'System');
    
    // UI aktualisieren
    updateDashboardStats();
    updateBotTable();
    
    showToast(`Bot ${botId} wird gestartet...`, 'success');
    
    // In einer realen Anwendung würde der Bot hier starten
    // Hier simulieren wir den Verbindungsaufbau nach 2 Sekunden
    setTimeout(() => {
        const botIndex = allBots.findIndex(bot => bot.id === botId);
        if (botIndex !== -1) {
            allBots[botIndex].status = 'online';
            updateDatabase();
            updateDashboardStats();
            updateBotTable();
        }
    }, 2000);
}

/**
 * Zeigt Details zu einem Bot an
 * @param {string} botId - Die ID des Bots
 */
function showBotDetails(botId) {
    // Bot finden
    const bot = allBots.find(bot => bot.id === botId);
    if (!bot) {
        showToast('Bot nicht gefunden', 'error');
        return;
    }
    
    // Details in einem modalen Dialog anzeigen
    alert(`
        Bot-ID: ${bot.id}
        Besitzer: ${bot.owner || 'Unbekannt'}
        Server: ${bot.server || 'Nicht verbunden'}
        Status: ${bot.status || 'Unbekannt'}
        Erstellt am: ${bot.createdAt ? new Date(bot.createdAt).toLocaleString() : 'Unbekannt'}
        Online-Zeit: ${formatDuration(bot.onlineTime || 0)}
    `);
}

/**
 * Zeigt Logs zu einem Bot an
 * @param {string} botId - Die ID des Bots
 */
function showBotLogs(botId) {
    // In einer realen Anwendung würden hier die Logs des Bots geladen
    // Hier zeigen wir eine einfache Meldung an
    alert(`Logs für Bot ${botId} werden geladen...`);
}

/**
 * Aktualisiert die Datenbank im localStorage
 */
function updateDatabase() {
    try {
        let db = {
            users: allUsers,
            bots: allBots,
            logs: systemLogs
        };
        
        localStorage.setItem('database', JSON.stringify(db));
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Datenbank:', error);
    }
}

/**
 * Fügt einen neuen Log-Eintrag hinzu
 * @param {string} message - Die Log-Nachricht
 * @param {string} type - Der Log-Typ (info, warning, error)
 * @param {string} source - Die Quelle des Logs
 */
function addSystemLog(message, type = 'info', source = 'System') {
    const newLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        type,
        source,
        message
    };
    
    systemLogs.unshift(newLog);
    
    // Max. 1000 Logs behalten
    if (systemLogs.length > 1000) {
        systemLogs = systemLogs.slice(0, 1000);
    }
    
    // Datenbank aktualisieren
    updateDatabase();
    
    // Logs-Tabelle aktualisieren, falls sichtbar
    updateLogsTable();
}

/**
 * Generiert eine zufällige ID
 * @returns {string} - Eine zufällige ID
 */
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Formatiert eine Zeitdauer in Stunden in einen lesbaren String
 * @param {number} hours - Die Zeitdauer in Stunden
 * @returns {string} - Die formatierte Zeitdauer
 */
function formatDuration(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
}

/**
 * Zeigt eine Toast-Benachrichtigung an
 * @param {string} message - Die anzuzeigende Nachricht
 * @param {string} type - Der Typ der Benachrichtigung (success, error, warning, info)
 * @param {number} duration - Die Anzeigedauer in Millisekunden
 */
function showToast(message, type = 'info', duration = 3000) {
    // Prüfen, ob die Toast-Funktion aus script.js existiert
    if (typeof window.showToast === 'function') {
        window.showToast(message, type, duration);
        return;
    }
    
    // Wenn nicht, zeigen wir einen einfachen Alert an
    alert(message);
}

/**
 * Initialisiert die Datenbank mit Beispieldaten, wenn sie noch nicht existiert
 */
function initializeDatabaseIfNeeded() {
    if (!localStorage.getItem('database')) {
        const timestamp = new Date().toISOString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
        
        // Beispieldaten erstellen
        const db = {
            users: [
                {
                    id: 'admin_id',
                    username: 'Administrator',
                    email: 'admin@herobrine-bot.de',
                    role: 'admin',
                    registrationDate: twoDaysAgo,
                    lastLogin: timestamp,
                    bots: ['admin-bot-1', 'admin-bot-2'],
                    premium: true
                },
                {
                    id: 'user_1',
                    username: 'MaxMustermann',
                    email: 'max@example.com',
                    role: 'user',
                    registrationDate: yesterday,
                    lastLogin: timestamp,
                    bots: ['max-bot-1'],
                    premium: false
                },
                {
                    id: 'user_2',
                    username: 'AnnaBeispiel',
                    email: 'anna@example.com',
                    role: 'user',
                    registrationDate: yesterday,
                    lastLogin: timestamp,
                    bots: ['anna-bot-1'],
                    premium: true
                },
                {
                    id: 'user_3',
                    username: 'ThomasTest',
                    email: 'thomas@example.com',
                    role: 'user',
                    registrationDate: twoDaysAgo,
                    lastLogin: twoDaysAgo,
                    bots: ['tom-bot-1'],
                    premium: false
                },
                {
                    id: 'user_4',
                    username: 'SarahSample',
                    email: 'sarah@example.com',
                    role: 'user',
                    registrationDate: timestamp,
                    lastLogin: timestamp,
                    bots: ['sarah-bot-1'],
                    premium: false
                },
                {
                    id: 'user_5',
                    username: 'PeterBeispiel',
                    email: 'peter@example.com',
                    role: 'user',
                    registrationDate: twoDaysAgo,
                    lastLogin: yesterday,
                    bots: ['peter-bot-1'],
                    premium: false,
                    banned: true,
                    banReason: 'Verstoß gegen Nutzungsbedingungen'
                }
            ],
            bots: [
                {
                    id: 'admin-bot-1',
                    owner: 'Administrator',
                    ownerId: 'admin_id',
                    name: 'AdminBot1',
                    server: 'mc.admin-server.net',
                    status: 'online',
                    createdAt: twoDaysAgo,
                    lastStatusChange: timestamp,
                    onlineTime: 48.5
                },
                {
                    id: 'admin-bot-2',
                    owner: 'Administrator',
                    ownerId: 'admin_id',
                    name: 'AdminBot2',
                    server: 'play.minecraft.net',
                    status: 'offline',
                    createdAt: yesterday,
                    lastStatusChange: yesterday,
                    onlineTime: 0.0
                },
                {
                    id: 'max-bot-1',
                    owner: 'MaxMustermann',
                    ownerId: 'user_1',
                    name: 'MaxBot1',
                    server: 'mc.example.com',
                    status: 'online',
                    createdAt: yesterday,
                    lastStatusChange: timestamp,
                    onlineTime: 2.5
                },
                {
                    id: 'anna-bot-1',
                    owner: 'AnnaBeispiel',
                    ownerId: 'user_2',
                    name: 'AnnaBot',
                    server: 'play.minecraft.net',
                    status: 'online',
                    createdAt: yesterday,
                    lastStatusChange: timestamp,
                    onlineTime: 4.2
                },
                {
                    id: 'tom-bot-1',
                    owner: 'ThomasTest',
                    ownerId: 'user_3',
                    name: 'TomBot',
                    server: 'mc.hypixel.net',
                    status: 'warning',
                    createdAt: twoDaysAgo,
                    lastStatusChange: timestamp,
                    onlineTime: 0.75
                },
                {
                    id: 'sarah-bot-1',
                    owner: 'SarahSample',
                    ownerId: 'user_4',
                    name: 'SarahBot',
                    server: 'mineplex.com',
                    status: 'online',
                    createdAt: timestamp,
                    lastStatusChange: timestamp,
                    onlineTime: 1.33
                },
                {
                    id: 'peter-bot-1',
                    owner: 'PeterBeispiel',
                    ownerId: 'user_5',
                    name: 'PeterBot',
                    server: 'mc.server.de',
                    status: 'offline',
                    createdAt: twoDaysAgo,
                    lastStatusChange: yesterday,
                    onlineTime: 0.0
                }
            ],
            logs: [
                {
                    id: 'log_1',
                    timestamp: timestamp,
                    type: 'info',
                    source: 'System',
                    message: 'Administrator hat sich angemeldet'
                },
                {
                    id: 'log_2',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    type: 'warning',
                    source: 'Bot:AnnaBot',
                    message: 'Bot hat mehrere Chat-Nachrichten in kurzer Zeit erhalten'
                },
                {
                    id: 'log_3',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    type: 'info',
                    source: 'System',
                    message: 'Neuer Benutzer SarahSample hat sich registriert'
                },
                {
                    id: 'log_4',
                    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    type: 'error',
                    source: 'Bot:TomBot',
                    message: 'Verbindung zum Server verloren, versuche erneut zu verbinden'
                },
                {
                    id: 'log_5',
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    type: 'info',
                    source: 'System',
                    message: 'PeterBeispiel hat Bot gestoppt'
                }
            ]
        };
        
        // In localStorage speichern
        localStorage.setItem('database', JSON.stringify(db));
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    // Überprüfen, ob wir uns auf der Admin-Seite befinden
    if (window.location.pathname.includes('admin.html')) {
        // Initialisiere die Datenbank, falls noch nicht vorhanden
        initializeDatabaseIfNeeded();
        
        // Admin-Dashboard initialisieren
        initializeAdminDashboard();
    }
});