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
        // Aus dem localStorage laden (afk_bot_db und registered_users kombinieren)
        const afkBotDbData = localStorage.getItem('afk_bot_db');
        const registeredUsersData = localStorage.getItem('registered_users');
        let combinedUsers = [];
        
        // Hauptdatenbank (neue Implementierung)
        if (afkBotDbData) {
            const db = JSON.parse(afkBotDbData);
            if (Array.isArray(db.users)) {
                // Format der Benutzer in der Admin-Tabelle anpassen
                combinedUsers = db.users.map(user => ({
                    id: user.uid,
                    username: user.username,
                    email: user.email,
                    registrationDate: user.created_at,
                    lastLogin: user.last_login,
                    isPremium: user.isPremium,
                    verified: user.verified,
                    banned: user.banned || false,
                    role: user.role
                }));
            }
        }
        
        // Ältere registrierte Benutzer (falls vorhanden und nicht bereits in der Hauptdatenbank)
        if (registeredUsersData) {
            const oldUsers = JSON.parse(registeredUsersData);
            if (Array.isArray(oldUsers)) {
                // Benutzer hinzufügen, die noch nicht in combinedUsers sind
                for (const oldUser of oldUsers) {
                    if (!combinedUsers.some(u => u.email === oldUser.email)) {
                        combinedUsers.push({
                            id: oldUser.uid,
                            username: oldUser.username,
                            email: oldUser.email,
                            registrationDate: oldUser.created_at,
                            lastLogin: null,
                            isPremium: false,
                            verified: oldUser.verified,
                            banned: false,
                            role: oldUser.role
                        });
                    }
                }
            }
        }
        
        allUsers = combinedUsers;
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
        // Neue Datenbank-Struktur verwenden (afk_bot_db)
        const dbData = localStorage.getItem('afk_bot_db');
        if (dbData) {
            const db = JSON.parse(dbData);
            if (Array.isArray(db.bots)) {
                // Format der Bots an die Admin-Tabelle anpassen
                allBots = db.bots.map(bot => {
                    // Zugehörigen Benutzer finden
                    const ownerInfo = db.users?.find(user => user.uid === bot.user_id);
                    
                    return {
                        id: bot.id,
                        owner: ownerInfo ? ownerInfo.username : 'Unbekannt',
                        ownerId: bot.user_id,
                        server: bot.server_address,
                        port: bot.server_port,
                        status: bot.status,
                        createdAt: bot.created_at,
                        lastActive: bot.last_active,
                        onlineTime: bot.total_online_time || 0,
                        username: bot.username
                    };
                });
            } else {
                allBots = [];
            }
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
        // Neue Datenbank-Struktur verwenden (afk_bot_db)
        const dbData = localStorage.getItem('afk_bot_db');
        if (dbData) {
            const db = JSON.parse(dbData);
            if (Array.isArray(db.logs)) {
                systemLogs = db.logs.map(log => ({
                    id: log.id,
                    timestamp: log.timestamp,
                    type: log.type,
                    source: log.bot_id ? `Bot ${log.bot_id}` : 'System',
                    message: log.message
                }));
            } else {
                systemLogs = [];
            }
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
        // Jeden aktiven Bot einzeln stoppen
        const timestamp = new Date().toISOString();
        const stoppedBots = [];
        
        // Aktive Bots durchgehen und jeden einzeln stoppen
        for (const bot of activeBots) {
            try {
                // MinecraftBot-Modul verwenden, um den Bot tatsächlich zu stoppen
                if (typeof window.minecraftBot !== 'undefined' && typeof window.minecraftBot.stopBot === 'function') {
                    window.minecraftBot.stopBot(bot.id);
                } else if (typeof stopMinecraftBot === 'function') {
                    // Alternative Funktion, falls vorhanden
                    stopMinecraftBot(bot.id);
                }
                
                // Zu den erfolgreich gestoppten Bots hinzufügen
                stoppedBots.push(bot.id);
            } catch (error) {
                console.error(`Fehler beim Stoppen des Bots ${bot.id}:`, error);
            }
        }
        
        // Status aller Bots aktualisieren, auch wenn das Stoppen fehlschlug
        // (die UI sollte immer mit dem tatsächlichen Zustand übereinstimmen)
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
        addSystemLog(`Administrator hat alle ${activeBots.length} Bots gestoppt`, 'info', 'System');
        
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
    
    try {
        // MinecraftBot-Modul verwenden, um den Bot tatsächlich zu stoppen
        // Importieren der externen Funktion, falls vorhanden
        if (typeof window.minecraftBot !== 'undefined' && typeof window.minecraftBot.stopBot === 'function') {
            window.minecraftBot.stopBot(botId);
        } else if (typeof stopMinecraftBot === 'function') {
            // Alternative Funktion, falls vorhanden
            stopMinecraftBot(botId);
        }
    } catch (error) {
        console.error('Fehler beim Stoppen des Bots:', error);
    }
    
    // In jedem Fall den Bot-Status in der UI aktualisieren
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
    
    const bot = allBots[botIndex];
    const timestamp = new Date().toISOString();
    
    // Bot-Status auf 'connecting' setzen
    allBots[botIndex] = {
        ...bot,
        status: 'connecting',
        lastStatusChange: timestamp
    };
    
    // UI aktualisieren, bevor wir den Bot starten
    updateDatabase();
    updateDashboardStats();
    updateBotTable();
    
    // Log-Eintrag erstellen
    addSystemLog(`Administrator hat Bot ${botId} gestartet`, 'info', 'System');
    
    // Fortschritt anzeigen
    showToast(`Bot ${botId} wird gestartet...`, 'success');
    
    try {
        // MinecraftBot-Modul verwenden, um den Bot tatsächlich zu starten
        if (typeof window.minecraftBot !== 'undefined' && typeof window.minecraftBot.startBot === 'function') {
            // Konfiguration für den Bot erstellen
            const botConfig = {
                username: bot.username || `HerobrineBot_${Math.floor(Math.random() * 1000)}`,
                server: bot.server,
                port: bot.port || 25565,
                autoReconnect: true,
                antiAFK: true
            };
            
            // Bot starten
            window.minecraftBot.startBot(botConfig)
                .then(result => {
                    if (result && result.success) {
                        // Bot wurde erfolgreich gestartet
                        const botIndex = allBots.findIndex(b => b.id === botId);
                        if (botIndex !== -1) {
                            allBots[botIndex].status = 'online';
                            allBots[botIndex].lastStatusChange = new Date().toISOString();
                            updateDatabase();
                            updateDashboardStats();
                            updateBotTable();
                            showToast(`Bot ${botId} ist jetzt online`, 'success');
                        }
                    } else {
                        // Fehler beim Starten des Bots
                        throw new Error(result?.error || 'Unbekannter Fehler');
                    }
                })
                .catch(error => {
                    console.error('Fehler beim Starten des Bots:', error);
                    const botIndex = allBots.findIndex(b => b.id === botId);
                    if (botIndex !== -1) {
                        allBots[botIndex].status = 'error';
                        updateDatabase();
                        updateDashboardStats();
                        updateBotTable();
                    }
                    showToast(`Fehler beim Starten des Bots: ${error.message}`, 'error');
                });
        } else if (typeof startMinecraftBot === 'function') {
            // Alternative Funktion, falls vorhanden
            startMinecraftBot(botId, bot.username, bot.server, bot.port || 25565)
                .then(() => {
                    // Nach erfolgreicher Ausführung den Status aktualisieren
                    const botIndex = allBots.findIndex(b => b.id === botId);
                    if (botIndex !== -1) {
                        allBots[botIndex].status = 'online';
                        updateDatabase();
                        updateDashboardStats();
                        updateBotTable();
                    }
                })
                .catch(error => {
                    console.error('Fehler beim Starten des Bots:', error);
                    showToast(`Fehler beim Starten des Bots: ${error.message}`, 'error');
                });
        } else {
            // Wenn keine der Funktionen verfügbar ist, simulieren wir den Start
            console.warn('Keine Bot-Start-Funktion gefunden, simuliere Bot-Start...');
            setTimeout(() => {
                const botIndex = allBots.findIndex(b => b.id === botId);
                if (botIndex !== -1) {
                    allBots[botIndex].status = 'online';
                    updateDatabase();
                    updateDashboardStats();
                    updateBotTable();
                    showToast(`Bot ${botId} ist jetzt online (simuliert)`, 'success');
                }
            }, 2000);
        }
    } catch (error) {
        console.error('Fehler beim Starten des Bots:', error);
        showToast(`Fehler beim Starten des Bots: ${error.message}`, 'error');
        
        // Status auf 'error' setzen
        const botIndex = allBots.findIndex(b => b.id === botId);
        if (botIndex !== -1) {
            allBots[botIndex].status = 'error';
            updateDatabase();
            updateDashboardStats();
            updateBotTable();
        }
    }
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
        // Aktuelle Daten aus dem afk_bot_db laden
        const dbData = localStorage.getItem('afk_bot_db');
        let db = dbData ? JSON.parse(dbData) : { users: [], bots: [], logs: [] };
        
        // Benutzer aktualisieren
        if (Array.isArray(allUsers) && allUsers.length > 0) {
            // Format der Benutzer für die Datenbank anpassen
            db.users = allUsers.map(user => ({
                uid: user.id,
                username: user.username,
                email: user.email,
                created_at: user.registrationDate,
                last_login: user.lastLogin,
                isPremium: user.isPremium || false,
                verified: user.verified || false,
                banned: user.banned || false,
                role: user.role || 'user'
            }));
        }
        
        // Bots aktualisieren
        if (Array.isArray(allBots) && allBots.length > 0) {
            // Format der Bots für die Datenbank anpassen
            db.bots = allBots.map(bot => ({
                id: bot.id,
                user_id: bot.ownerId,
                username: bot.username || 'Bot-' + Math.floor(Math.random() * 10000),
                server_address: bot.server,
                server_port: bot.port || 25565,
                status: bot.status || 'offline',
                created_at: bot.createdAt || new Date().toISOString(),
                last_active: bot.lastActive || null,
                total_online_time: bot.onlineTime || 0
            }));
        }
        
        // Logs aktualisieren
        if (Array.isArray(systemLogs) && systemLogs.length > 0) {
            // Format der Logs für die Datenbank anpassen
            db.logs = systemLogs.map(log => ({
                id: log.id,
                timestamp: log.timestamp,
                type: log.type || 'info',
                bot_id: log.source && log.source.startsWith('Bot ') ? log.source.replace('Bot ', '') : null,
                message: log.message
            }));
        }
        
        // In localStorage speichern
        localStorage.setItem('afk_bot_db', JSON.stringify(db));
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
 * Diese Funktion wird jetzt nicht mehr verwendet, da die Daten im afk_bot_db sind
 */
function initializeDatabaseIfNeeded() {
    // Diese Funktion wird nicht mehr benötigt, da wir die Daten aus afk_bot_db verwenden
    // Stattdessen stellen wir sicher, dass die vorhandenen Daten richtig geladen werden
    loadAllData();
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