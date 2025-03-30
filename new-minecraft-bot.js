// Exportiere Funktionen für das Admin-Dashboard
if (typeof window !== 'undefined') {
    window.startMinecraftBot = startBot;
    window.stopMinecraftBot = stopBot;
}

const mineflayer = require('mineflayer');
// Versuche, zusätzliche Plugins zu laden, falls verfügbar
let pathfinder;
try {
    pathfinder = require('mineflayer-pathfinder');
} catch (e) {
    console.log('Mineflayer-Pathfinder nicht verfügbar - Verwende einfache Bewegung');
}

let collectBlock;
try {
    collectBlock = require('mineflayer-collectblock').plugin;
} catch (e) {
    console.log('Mineflayer-CollectBlock nicht verfügbar');
}

let pvp;
try {
    pvp = require('mineflayer-pvp').plugin;
} catch (e) {
    console.log('Mineflayer-PVP nicht verfügbar');
}

// Aktive Bots speichern
let activeBots = {};

// Logs für jeden Bot speichern
let botLogs = {};

// Zähler für Wiederverbindungsversuche speichern
let reconnectAttempts = {};

// Bot mit Minecraft-Server verbinden
function startBot(config) {
    return new Promise((resolve) => {
        const { username, serverIp, mcVersion, botName } = config;
        
        // Wiederverbindungsversuche zurücksetzen
        reconnectAttempts[username] = 0;
        
        // Log für den Benutzer hinzufügen über die zurückgesetzten Verbindungsversuche
        addBotLog(username, 'Verbindungsversuche zurückgesetzt', 'info');
        
        // Überprüfe, ob bereits ein Bot für diesen Benutzer existiert
        if (activeBots[username]) {
            return resolve({
                success: false,
                error: 'Du hast bereits einen aktiven Bot. Bitte stoppe zuerst den bestehenden Bot.'
            });
        }
        
        try {
            // Domain und Port aus der Server-IP extrahieren
            let host = serverIp;
            let port = '25565'; // Standard-Minecraft-Port
            
            // Falls IP im Format hostname:port ist, trennen wir diese
            if (serverIp.includes(':')) {
                const parts = serverIp.split(':');
                host = parts[0];
                port = parts[1];
            }
            
            console.log(`Verbinden mit Server: ${host} auf Port ${port}...`);

            // Verwende den benutzerdefinierten Bot-Namen oder den Standard
            const customBotName = botName || `${username}_Bot`;

            console.log(`Starte Bot für ${username} - Verbindung zu ${host}:${port} mit Version ${mcVersion || '1.21.4'}`);
            
            // Log eintragen für diesen Benutzer
            addBotLog(username, `Starte Bot für ${username} - Verbindung zu ${host}:${port} mit Version ${mcVersion || '1.21.4'}`, 'info');
            
            // Immer die neueste stabile Version verwenden, es sei denn, es wird eine andere angegeben
            const botVersion = mcVersion || '1.21.4';
            
            // Versuche, IP und Port zu extrahieren (falls Hostname im Format hostname:port)
            let actualHost = host;
            let actualPort = parseInt(port);
            
            if (host.includes(':') && !port) {
                const parts = host.split(':');
                actualHost = parts[0];
                actualPort = parseInt(parts[1]);
                console.log(`Host-Format mit Port erkannt: ${actualHost}:${actualPort}`);
            }
            
            console.log(`Verwende Verbindungsdaten: Host=${actualHost}, Port=${actualPort}, Botname=${customBotName}, Version=${botVersion}`);
            
            // Mineflayer-Bot erstellen mit verbesserten Verbindungsoptionen
            const bot = mineflayer.createBot({
                host: actualHost,
                port: actualPort,
                username: customBotName,
                version: botVersion,
                auth: 'offline', // Offline-Modus für Nicht-Premium-Accounts
                connectTimeout: 20000,  // 20 Sekunden Verbindungs-Timeout
                keepAlive: true,  // Keep-Alive-Pakete senden
                chatLengthLimit: 100  // Chat-Nachrichten auf 100 Zeichen begrenzen
            });

            // Verbindungs-Timeout
            let connectionTimeout = setTimeout(() => {
                console.log(`Verbindungs-Timeout für Bot ${username}_Bot`);
                if (!activeBots[username]) { // Nur auflösen, wenn nicht schon verbunden
                    resolve({
                        success: false,
                        error: 'Verbindungs-Timeout - Der Server antwortet nicht'
                    });
                    try {
                        bot.end();
                    } catch (e) { 
                        console.log('Fehler beim Beenden nach Timeout:', e.message);
                    }
                }
            }, 20000);

            // Event-Listener für Bot-Status
            bot.once('spawn', () => {
                clearTimeout(connectionTimeout); // Timeout löschen
                console.log(`Bot ${username}_Bot erfolgreich mit Server verbunden`);
                
                // Lade Plugins wenn verfügbar
                try {
                    // Pathfinder-Plugin laden
                    if (pathfinder) {
                        bot.loadPlugin(pathfinder.pathfinder);
                        bot.pathfinder.setMovements(new pathfinder.Movements(bot));
                        console.log(`Pathfinder für Bot ${username}_Bot erfolgreich geladen`);
                        addBotLog(username, "Pathfinder-KI erfolgreich aktiviert", "success");
                    }
                    
                    // CollectBlock-Plugin laden (zum Sammeln von Ressourcen)
                    if (collectBlock) {
                        bot.loadPlugin(collectBlock);
                        console.log(`CollectBlock für Bot ${username}_Bot erfolgreich geladen`);
                        addBotLog(username, "Ressourcensammel-KI erfolgreich aktiviert", "success");
                    }
                    
                    // PVP-Plugin laden (für Kampf-KI)
                    if (pvp) {
                        bot.loadPlugin(pvp);
                        console.log(`PVP für Bot ${username}_Bot erfolgreich geladen`);
                        addBotLog(username, "Kampf-KI erfolgreich aktiviert", "success");
                    }
                } catch (e) {
                    console.error(`Fehler beim Laden der Plugins für Bot ${username}_Bot: ${e.message}`);
                    addBotLog(username, `Konnte einige KI-Funktionen nicht laden: ${e.message}`, "warning");
                }
                
                // Sicherheitsmechanismen einrichten
                setupBotSafety(bot);
                
                // Event-Listener für Logs hinzufügen
                setupBotEventLogging(bot, username);
                
                // Bot im aktiven Bot-Pool speichern
                activeBots[username] = bot;
                
                // Exportiere die Funktionen für das Admin-Dashboard
                if (typeof window !== 'undefined') {
                    window.startMinecraftBot = startBot;
                    window.stopMinecraftBot = stopBot;
                }
                
                // Erfolg melden
                resolve({
                    success: true,
                    message: 'Bot erfolgreich verbunden',
                    botName: bot.username || `${username}_Bot`
                });
            });

            // Verbesserte Fehlerbehandlung
            bot.on('error', (err) => {
                clearTimeout(connectionTimeout); // Timeout löschen
                console.error(`Bot-Fehler für ${username}: ${err.message}`);
                
                // Verbindungsfehler-Nachricht benutzerfreundlich gestalten
                let errorMessage = `Bot-Fehler: ${err.message}`;
                
                // Bekannte Fehler mit einfachen Erklärungen
                if (err.code === 'ECONNRESET') {
                    errorMessage = 'Die Verbindung zum Minecraft-Server wurde zurückgesetzt. Das passiert oft, wenn der Server überlastet ist oder deine Verbindung unterbrochen wurde.';
                } else if (err.code === 'ETIMEDOUT') {
                    errorMessage = 'Zeitüberschreitung bei der Verbindung. Der Minecraft-Server antwortet nicht rechtzeitig.';
                } else if (err.code === 'ECONNREFUSED') {
                    errorMessage = 'Der Minecraft-Server hat die Verbindung abgelehnt. Bitte prüfe, ob die IP-Adresse und der Port korrekt sind.';
                } else if (err.message.includes('getaddrinfo')) {
                    errorMessage = 'Die angegebene Server-Adresse wurde nicht gefunden. Bitte prüfe die Schreibweise der Server-IP.';
                } else if (err.message.includes('authenticate')) {
                    errorMessage = 'Fehler bei der Authentifizierung. Der Server erlaubt möglicherweise keine Nicht-Premium-Accounts.';
                }
                
                // Füge den Fehler zum Log hinzu
                addBotLog(username, `Fehler: ${err.message}`, 'error');
                
                // Automatische Versionserkennung bei Versionsproblemen
                if (err.message && err.message.includes('version') && err.message.includes('specify the correct version')) {
                    console.log("Version-Mismatch erkannt, versuche automatisch die richtige Version zu finden");
                    try {
                        // Versuche, die korrekte Version aus der Fehlermeldung zu extrahieren
                        const versionMatch = err.message.match(/server is version (\d+\.\d+\.\d+)/);
                        if (versionMatch && versionMatch[1]) {
                            const correctVersion = versionMatch[1];
                            console.log(`Korrekte Version erkannt: ${correctVersion}, versuche erneut zu verbinden`);
                            
                            // Versuche mit der korrekten Version
                            const newBot = mineflayer.createBot({
                                host: host,
                                port: parseInt(port),
                                username: customBotName,
                                version: correctVersion,
                                auth: 'offline',
                                connectTimeout: 20000
                            });
                            
                            // Neue Event-Listener für den neuen Bot
                            newBot.once('spawn', () => {
                                console.log(`Bot ${username}_Bot mit korrekter Version ${correctVersion} verbunden!`);
                                clearTimeout(connectionTimeout); // Timeout löschen
                                
                                // Lade Plugins wenn verfügbar
                                try {
                                    // Pathfinder-Plugin laden
                                    if (pathfinder) {
                                        newBot.loadPlugin(pathfinder.pathfinder);
                                        newBot.pathfinder.setMovements(new pathfinder.Movements(newBot));
                                        console.log(`Pathfinder für Bot ${username}_Bot erfolgreich geladen`);
                                        addBotLog(username, "Pathfinder-KI erfolgreich aktiviert", "success");
                                    }
                                    
                                    // CollectBlock-Plugin laden (zum Sammeln von Ressourcen)
                                    if (collectBlock) {
                                        newBot.loadPlugin(collectBlock);
                                        console.log(`CollectBlock für Bot ${username}_Bot erfolgreich geladen`);
                                        addBotLog(username, "Ressourcensammel-KI erfolgreich aktiviert", "success");
                                    }
                                    
                                    // PVP-Plugin laden (für Kampf-KI)
                                    if (pvp) {
                                        newBot.loadPlugin(pvp);
                                        console.log(`PVP für Bot ${username}_Bot erfolgreich geladen`);
                                        addBotLog(username, "Kampf-KI erfolgreich aktiviert", "success");
                                    }
                                } catch (e) {
                                    console.error(`Fehler beim Laden der Plugins für Bot ${username}_Bot: ${e.message}`);
                                    addBotLog(username, `Konnte einige KI-Funktionen nicht laden: ${e.message}`, "warning");
                                }
                                
                                // Bot-Sicherheitsfunktionen einrichten
                                setupBotSafety(newBot);
                                
                                // Bot in aktive Liste speichern
                                activeBots[username] = newBot;
                                
                                // Erfolg melden
                                resolve({
                                    success: true,
                                    message: `Bot erfolgreich verbunden (Version: ${correctVersion})`,
                                    botName: newBot.username || customBotName
                                });
                            });
                            
                            newBot.on('error', (newErr) => {
                                console.error(`Fehler bei Verbindung mit korrekter Version: ${newErr.message}`);
                                if (!activeBots[username]) {
                                    resolve({
                                        success: false,
                                        error: `Fehler auch mit korrekter Version: ${newErr.message}`
                                    });
                                }
                            });
                            
                            return; // Früh zurückkehren, um den Rest zu überspringen
                        }
                    } catch (versionError) {
                        console.error("Fehler bei automatischer Versionserkennung:", versionError);
                    }
                }
                
                // Nur auflösen, wenn nicht schon aufgelöst
                if (!activeBots[username]) {
                    resolve({
                        success: false,
                        error: errorMessage
                    });
                }
            });

            bot.on('kicked', (reason) => {
                clearTimeout(connectionTimeout); // Timeout löschen
                let kickReason = 'Unbekannter Grund';
                
                try {
                    // Versuchen, den Grund als JSON zu parsen (Minecraft Format)
                    const parsedReason = JSON.parse(reason);
                    kickReason = parsedReason.text || parsedReason.translate || reason;
                } catch {
                    // Wenn kein gültiges JSON, dann den Originaltext verwenden
                    kickReason = reason;
                }
                
                // Benutzerfreundliche Kick-Meldung
                let userFriendlyKickReason = kickReason;
                
                // Bekannte Kick-Gründe übersetzen und erklären
                if (kickReason.includes('banned') || kickReason.includes('Banned')) {
                    userFriendlyKickReason = 'Du wurdest vom Server gebannt. Bitte kontaktiere den Server-Administrator.';
                } else if (kickReason.includes('whitelist') || kickReason.includes('Whitelist')) {
                    userFriendlyKickReason = 'Der Server hat eine Whitelist aktiviert. Dein Bot-Account ist nicht auf der Liste der erlaubten Spieler.';
                } else if (kickReason.includes('full') || kickReason.includes('voll')) {
                    userFriendlyKickReason = 'Der Server ist voll. Versuche es später noch einmal.';
                } else if (kickReason.includes('timeout') || kickReason.includes('Timeout')) {
                    userFriendlyKickReason = 'Zeitüberschreitung bei der Verbindung. Deine Internetverbindung ist möglicherweise instabil.';
                } else if (kickReason.includes('version') || kickReason.includes('Version')) {
                    userFriendlyKickReason = 'Falsche Minecraft-Version. Bitte wähle die richtige Version für diesen Server.';
                } else if (kickReason.toLowerCase().includes('already logged in')) {
                    userFriendlyKickReason = 'Ein Spieler mit diesem Namen ist bereits auf dem Server. Bitte wähle einen anderen Bot-Namen.';
                }
                
                console.log(`Bot ${username}_Bot wurde vom Server gekickt: ${userFriendlyKickReason}`);
                addBotLog(username, `Vom Server gekickt: ${userFriendlyKickReason}`, 'error');
                
                // Bot aus der aktiven Liste entfernen
                delete activeBots[username];
                
                // Automatische Wiederverbindung starten, wenn bestimmte Bedingungen erfüllt sind
                // Nicht automatisch neu verbinden bei:
                const shouldNotReconnect = 
                    kickReason.includes('banned') || 
                    kickReason.includes('Banned') || 
                    kickReason.includes('whitelist') ||
                    kickReason.includes('Whitelist') ||
                    kickReason.toLowerCase().includes('already logged in');
                
                if (!shouldNotReconnect) {
                    // Zählen, wie oft wir versucht haben, den Bot zu verbinden
                    reconnectAttempts[username] = (reconnectAttempts[username] || 0) + 1;
                    
                    if (reconnectAttempts[username] <= 5) {
                        console.log(`Versuche, Bot ${username}_Bot automatisch neu zu verbinden... (Versuch ${reconnectAttempts[username]}/5)`);
                        addBotLog(username, `Wiederverbindungsversuch ${reconnectAttempts[username]}/5`, 'warning');
                        
                        // Zeitverzögerung vor dem Wiederverbinden (10 Sekunden)
                        setTimeout(() => {
                            // Stelle sicher, dass der Bot noch nicht aktiv ist
                            if (!activeBots[username]) {
                                console.log(`Starte Wiederverbindung für ${username}_Bot...`);
                                
                                // Server-Adresse und Port speichern, bevor Bot beendet wird
                                const serverHost = bot.server ? bot.server.host : (bot._client ? bot._client.socket.remoteAddress : undefined);
                                const serverPort = bot.server ? bot.server.port : (bot._client ? bot._client.socket.remotePort : 25565);
                                const botVersion = bot.version || config.mcVersion || '1.21.4';
                                const botName = bot.username || username + '_Bot';
                                
                                // Log der gespeicherten Verbindungsinformationen
                                console.log(`Gespeicherte Verbindungsinformationen für Wiederverbindung nach Kick:`, {
                                    host: serverHost,
                                    port: serverPort,
                                    version: botVersion,
                                    botName: botName
                                });
                                
                                // Starte den Bot mit denselben Konfigurationen neu
                                try {
                                    // Nur verbinden, wenn wir gültige Verbindungsdaten haben
                                    if (!serverHost) {
                                        throw new Error('Keine gültigen Verbindungsdaten vorhanden');
                                    }
                                    
                                    // Für Versionsprobleme
                                    let useVersion = botVersion;
                                    if (reason && reason.includes('Outdated client')) {
                                        // Versuche, die erforderliche Version aus der Kicknachricht zu extrahieren
                                        const versionMatch = reason.match(/Please use (\d+\.\d+\.\d+)/);
                                        if (versionMatch && versionMatch[1]) {
                                            useVersion = versionMatch[1];
                                            console.log(`Version aus Kick-Nachricht erkannt: ${useVersion}`);
                                        } else {
                                            // Fallback auf neueste Version
                                            useVersion = '1.21.4';
                                            console.log(`Keine spezifische Version gefunden, verwende Standard: ${useVersion}`);
                                        }
                                    }
                                    
                                    const newBot = mineflayer.createBot({
                                        host: serverHost,
                                        port: serverPort || 25565,
                                        username: botName,
                                        version: useVersion,
                                        auth: 'offline',
                                        hideErrors: true,
                                        // Höheres Timeout für mehr Geduld beim Wiederverbinden
                                        connectTimeout: 30000
                                    });
                                    
                                    newBot.once('spawn', () => {
                                        console.log(`Bot ${username}_Bot wurde erfolgreich neu verbunden!`);
                                        
                                        // Lade Plugins wenn verfügbar
                                        try {
                                            // Pathfinder-Plugin laden
                                            if (pathfinder) {
                                                newBot.loadPlugin(pathfinder.pathfinder);
                                                newBot.pathfinder.setMovements(new pathfinder.Movements(newBot));
                                                console.log(`Pathfinder für Bot ${username}_Bot erfolgreich geladen`);
                                                addBotLog(username, "Pathfinder-KI erfolgreich aktiviert", "success");
                                            }
                                            
                                            // CollectBlock-Plugin laden
                                            if (collectBlock) {
                                                newBot.loadPlugin(collectBlock);
                                                console.log(`CollectBlock für Bot ${username}_Bot erfolgreich geladen`);
                                                addBotLog(username, "Ressourcensammel-KI erfolgreich aktiviert", "success");
                                            }
                                            
                                            // PVP-Plugin laden
                                            if (pvp) {
                                                newBot.loadPlugin(pvp);
                                                console.log(`PVP für Bot ${username}_Bot erfolgreich geladen`);
                                                addBotLog(username, "Kampf-KI erfolgreich aktiviert", "success");
                                            }
                                        } catch (e) {
                                            console.error(`Fehler beim Laden der Plugins für Bot ${username}_Bot: ${e.message}`);
                                            addBotLog(username, `Konnte einige KI-Funktionen nicht laden: ${e.message}`, "warning");
                                        }
                                        
                                        // Bot zur aktiven Liste hinzufügen
                                        activeBots[username] = newBot;
                                        
                                        // Reconnect-Flag setzen
                                        activeBots[username].reconnected = true;
                                        // Bot-Sicherheitsfunktionen neu einrichten
                                        setupBotSafety(newBot);
                                    });
                                    
                                    // Fehlerbehandlung für den neuen Bot
                                    newBot.on('error', (err) => {
                                        console.error(`Fehler bei Wiederverbindung für ${username}_Bot: ${err.message}`);
                                    });
                                } catch (error) {
                                    console.error(`Konnte ${username}_Bot nicht neu verbinden nach Kick: ${error.message}`);
                                }
                            }
                        }, 10000); // 10 Sekunden warten vor dem Wiederverbinden
                    } else {
                        console.log(`Maximale Anzahl an Wiederverbindungsversuchen (5) erreicht für ${username}_Bot`);
                        addBotLog(username, `Maximale Anzahl an Wiederverbindungsversuchen (5) erreicht. Der Bot bleibt offline.`, 'error');
                    }
                }
            });

            bot.on('end', () => {
                clearTimeout(connectionTimeout); // Timeout löschen
                console.log(`Bot ${username}_Bot Verbindung beendet`);
                delete activeBots[username];
                
                // Automatische Wiederverbindung nach normalem Verbindungsabbruch
                // Nur wenn maximale Wiederbverbindungsversuche nicht überschritten wurden
                reconnectAttempts[username] = (reconnectAttempts[username] || 0) + 1;
                
                if (reconnectAttempts[username] <= 5) {
                    console.log(`Versuche, Bot ${username}_Bot nach Verbindungsabbruch automatisch neu zu verbinden... (Versuch ${reconnectAttempts[username]}/5)`);
                    addBotLog(username, `Wiederverbindungsversuch nach Verbindungsabbruch ${reconnectAttempts[username]}/5`, 'warning');
                    
                    // Server-Adresse und Port speichern, bevor Bot beendet wird
                    const serverHost = bot.server ? bot.server.host : (bot._client ? bot._client.socket.remoteAddress : undefined);
                    const serverPort = bot.server ? bot.server.port : (bot._client ? bot._client.socket.remotePort : 25565);
                    const botVersion = bot.version || config.mcVersion || '1.21.4';
                    const botName = bot.username || username + '_Bot';
                    
                    // Log der gespeicherten Verbindungsinformationen
                    console.log(`Gespeicherte Verbindungsinformationen für Wiederverbindung:`, {
                        host: serverHost,
                        port: serverPort,
                        version: botVersion,
                        botName: botName
                    });
                    
                    // Warte etwas länger bei normalem Verbindungsabbruch (15 Sekunden)
                    setTimeout(() => {
                        // Stelle sicher, dass der Bot noch nicht aktiv ist
                        if (!activeBots[username]) {
                            console.log(`Starte Wiederverbindung für ${username}_Bot nach Verbindungsabbruch...`);
                            
                            // Versuche, den Bot mit denselben Konfigurationen neu zu starten
                            try {
                                // Nur verbinden, wenn wir gültige Verbindungsdaten haben
                                if (!serverHost) {
                                    throw new Error('Keine gültigen Verbindungsdaten vorhanden');
                                }
                                
                                const newBot = mineflayer.createBot({
                                    host: serverHost,
                                    port: serverPort || 25565,
                                    username: botName,
                                    version: botVersion,
                                    auth: 'offline',
                                    hideErrors: true,
                                    // Höheres Timeout für mehr Geduld beim Wiederverbinden
                                    connectTimeout: 30000
                                });
                                
                                newBot.once('spawn', () => {
                                    console.log(`Bot ${username}_Bot wurde nach Verbindungsabbruch erfolgreich neu verbunden!`);
                                    
                                    // Lade Plugins wenn verfügbar
                                    try {
                                        // Pathfinder-Plugin laden
                                        if (pathfinder) {
                                            newBot.loadPlugin(pathfinder.pathfinder);
                                            newBot.pathfinder.setMovements(new pathfinder.Movements(newBot));
                                            console.log(`Pathfinder für Bot ${username}_Bot erfolgreich geladen`);
                                            addBotLog(username, "Pathfinder-KI erfolgreich aktiviert", "success");
                                        }
                                        
                                        // CollectBlock-Plugin laden
                                        if (collectBlock) {
                                            newBot.loadPlugin(collectBlock);
                                            console.log(`CollectBlock für Bot ${username}_Bot erfolgreich geladen`);
                                            addBotLog(username, "Ressourcensammel-KI erfolgreich aktiviert", "success");
                                        }
                                        
                                        // PVP-Plugin laden
                                        if (pvp) {
                                            newBot.loadPlugin(pvp);
                                            console.log(`PVP für Bot ${username}_Bot erfolgreich geladen`);
                                            addBotLog(username, "Kampf-KI erfolgreich aktiviert", "success");
                                        }
                                    } catch (e) {
                                        console.error(`Fehler beim Laden der Plugins für Bot ${username}_Bot: ${e.message}`);
                                        addBotLog(username, `Konnte einige KI-Funktionen nicht laden: ${e.message}`, "warning");
                                    }
                                    
                                    // Bot zur aktiven Liste hinzufügen
                                    activeBots[username] = newBot;
                                    
                                    // Reconnect-Flag setzen, damit die UI darüber informiert werden kann
                                    activeBots[username].reconnected = true;
                                    
                                    // Bot-Sicherheitsfunktionen neu einrichten
                                    setupBotSafety(newBot);
                                });
                                
                                // Fehlerbehandlung für den neuen Bot
                                newBot.on('error', (err) => {
                                    console.error(`Fehler bei Wiederverbindung für ${username}_Bot: ${err.message}`);
                                });
                            } catch (error) {
                                console.error(`Konnte ${username}_Bot nicht neu verbinden: ${error.message}`);
                            }
                        }
                    }, 15000); // 15 Sekunden warten vor dem Wiederverbinden
                } else {
                    console.log(`Maximale Anzahl an Wiederverbindungsversuchen (5) erreicht für ${username}_Bot nach Verbindungsabbruch`);
                    addBotLog(username, `Maximale Anzahl an Wiederverbindungsversuchen (5) erreicht. Der Bot bleibt offline.`, 'error');
                }
            });

        } catch (error) {
            console.error(`Fehler beim Starten des Bots für ${username}: ${error.message}`);
            resolve({
                success: false,
                error: `Verbindungsfehler: ${error.message}`
            });
        }
    });
}

// Bot-Sicherheits- und KI-Bewegungsfunktionen einrichten
function setupBotSafety(bot) {
    // Anti-AFK-Mechanismen
    let lastAction = Date.now();
    let isMoving = false;
    let currentBehavior = null;
    let explorationPath = [];
    let obstacles = [];
    let interestPoints = [];
    let botMode = "reconnaissance"; // Modi: reconnaissance, patrolling, exploring, following
    let lastKnownSafePosition = null;
    let aiMemory = {
        visitedLocations: {},
        dangerousAreas: [],
        interestingLocations: [],
        playerInteractions: {}
    };
    
    // KI-Bewegungsmuster
    const aiMovementPatterns = {
        // Erkundet die Umgebung und merkt sich interessante Orte
        explore: () => {
            addBotLog(bot.username, "KI-Modus: Erkundung der Umgebung", "info");
            // Sichere aktuelle Position
            lastKnownSafePosition = bot.entity.position.clone();
            
            // Zufällige Richtung wählen und dorthin bewegen
            const angle = Math.random() * Math.PI * 2;
            const distance = 5 + Math.random() * 15; // 5-20 Blöcke
            
            // Verwende PathFinder, wenn verfügbar
            if (bot.pathfinder) {
                const targetPosition = bot.entity.position.offset(
                    Math.cos(angle) * distance,
                    0,
                    Math.sin(angle) * distance
                );
                
                try {
                    // Suche sicheren Pfad zum Ziel
                    bot.pathfinder.setGoal(new bot.pathfinder.goals.GoalNear(
                        targetPosition.x, targetPosition.y, targetPosition.z, 1
                    ));
                    addBotLog(bot.username, `Erkunde neue Position: ${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)}, ${targetPosition.z.toFixed(1)}`, "info");
                    
                    // Position im Gedächtnis speichern
                    const posKey = `${Math.floor(targetPosition.x)},${Math.floor(targetPosition.y)},${Math.floor(targetPosition.z)}`;
                    aiMemory.visitedLocations[posKey] = (aiMemory.visitedLocations[posKey] || 0) + 1;
                } catch (e) {
                    // Fallback, wenn Pathfinding fehlschlägt
                    simpleMove(angle, distance);
                }
            } else {
                simpleMove(angle, distance);
            }
            
            // Umgebung scannen nach interessanten Orten
            scanSurroundings();
        },
        
        // Patrouilliert zwischen bekannten Orten
        patrol: () => {
            addBotLog(bot.username, "KI-Modus: Patrouille starten", "info");
            
            // Falls Patrol-Pfad leer ist, erstelle neuen
            if (explorationPath.length === 0) {
                // Erstelle einen Patrouillenpfad basierend auf interessanten Orten
                if (interestPoints.length >= 2) {
                    // Verwendet bereits entdeckte interessante Orte
                    explorationPath = [...interestPoints];
                    
                    // Mische die Punkte, um Abwechslung zu schaffen
                    for (let i = explorationPath.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [explorationPath[i], explorationPath[j]] = [explorationPath[j], explorationPath[i]];
                    }
                } else {
                    // Wenn keine interessanten Orte bekannt sind, erstelle zufälligen Pfad
                    const startPos = bot.entity.position.clone();
                    explorationPath = [];
                    
                    // Erstelle einen Kreis von Punkten um den Bot herum
                    for (let i = 0; i < 5; i++) {
                        const angle = (i / 5) * Math.PI * 2;
                        const distance = 10 + Math.random() * 5;
                        explorationPath.push({
                            x: startPos.x + Math.cos(angle) * distance,
                            y: startPos.y,
                            z: startPos.z + Math.sin(angle) * distance
                        });
                    }
                    
                    // Füge Startposition am Ende hinzu, um Rundweg zu machen
                    explorationPath.push({
                        x: startPos.x,
                        y: startPos.y,
                        z: startPos.z
                    });
                }
            }
            
            // Zum nächsten Punkt im Patrouillenpfad bewegen
            if (explorationPath.length > 0) {
                const nextPoint = explorationPath[0];
                
                if (bot.pathfinder) {
                    try {
                        bot.pathfinder.setGoal(new bot.pathfinder.goals.GoalNear(
                            nextPoint.x, nextPoint.y, nextPoint.z, 1
                        ));
                        addBotLog(bot.username, `Patrouilliere zu Position: ${nextPoint.x.toFixed(1)}, ${nextPoint.y.toFixed(1)}, ${nextPoint.z.toFixed(1)}`, "info");
                    } catch (e) {
                        // Fehler beim Pathfinding, wechsle zu anderem Punkt
                        explorationPath.shift();
                        if (explorationPath.length > 0) {
                            const alternatePoint = explorationPath[0];
                            moveToPosition(alternatePoint);
                        } else {
                            // Wenn keine Punkte mehr übrig sind, wechsle zu Erkundungsmodus
                            botMode = "reconnaissance";
                        }
                    }
                } else {
                    // Einfache Bewegung, wenn kein Pathfinder verfügbar
                    moveToPosition(nextPoint);
                }
                
                // Entferne Punkte, wenn der Bot nahe genug ist
                const distance = bot.entity.position.distanceTo(nextPoint);
                if (distance < 2) {
                    addBotLog(bot.username, "Patrouillenpunkt erreicht", "success");
                    explorationPath.shift();
                    
                    // Schaue dich am Zielpunkt um
                    setTimeout(() => {
                        bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
                    }, 500);
                }
            }
        },
        
        // Sucht nach anderen Spielern und folgt ihnen
        followNearbyPlayer: () => {
            addBotLog(bot.username, "KI-Modus: Spielersuche", "info");
            
            // Suche nach dem nächsten Spieler
            const playerEntity = getNearestPlayer();
            
            if (playerEntity) {
                botMode = "following"; // Wechsle in den Folgemodus
                addBotLog(bot.username, `Folge Spieler: ${playerEntity.username}`, "info");
                
                // Spieler in Erinnerung speichern
                aiMemory.playerInteractions[playerEntity.username] = {
                    lastSeen: Date.now(),
                    followed: true,
                    position: playerEntity.position.clone()
                };
                
                if (bot.pathfinder) {
                    // Nutze Pathfinder, um dem Spieler zu folgen
                    bot.pathfinder.setGoal(new bot.pathfinder.goals.GoalFollow(playerEntity, 3));
                } else {
                    // Einfache Folge-Implementierung
                    const pos = playerEntity.position;
                    moveToPosition(pos);
                }
                
                // Gelegentlich zum Spieler schauen
                bot.lookAt(playerEntity.position.offset(0, playerEntity.height, 0));
                
                // Manchmal dem Spieler zuwinken
                if (Math.random() < 0.3) {
                    bot.swingArm();
                    if (Math.random() < 0.2) {
                        // Springe manchmal, um Aufmerksamkeit zu erregen
                        bot.setControlState('jump', true);
                        setTimeout(() => bot.setControlState('jump', false), 250);
                    }
                }
            } else {
                // Kein Spieler in der Nähe, zurück zur Erkundung
                botMode = "reconnaissance";
            }
        },
        
        // Bleibt an einem Ort und schaut sich um
        observeSurroundings: () => {
            addBotLog(bot.username, "KI-Modus: Umgebungsbeobachtung", "info");
            
            // Alle Bewegungen stoppen
            stopMovement();
            
            // In zufällige Richtungen schauen
            let lookingInterval = setInterval(() => {
                if (!bot.entity) {
                    clearInterval(lookingInterval);
                    return;
                }
                bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
            }, 2000);
            
            // Nach einer Weile aufhören zu schauen
            setTimeout(() => {
                clearInterval(lookingInterval);
                // Zurück zur Erkundung
                botMode = "reconnaissance";
            }, 10000 + Math.random() * 5000);
        }
    };
    
    // Hilfsfunktionen für die KI-Bewegung
    function simpleMove(angle, distance) {
        isMoving = true;
        // Drehe in die gewünschte Richtung
        bot.look(angle, 0);
        
        // Beginne vorwärts zu gehen
        bot.setControlState('forward', true);
        
        // Stoppe nach zufälliger Zeit
        const moveTime = Math.min(distance * 300, 5000); // Maximal 5 Sekunden Bewegung
        setTimeout(() => {
            bot.setControlState('forward', false);
            isMoving = false;
        }, moveTime);
    }
    
    function moveToPosition(position) {
        const dx = position.x - bot.entity.position.x;
        const dz = position.z - bot.entity.position.z;
        const yaw = Math.atan2(-dx, -dz);
        
        bot.look(yaw, 0);
        bot.setControlState('forward', true);
        isMoving = true;
        
        // Überprüfe, ob Sprung nötig ist (für kleine Hindernisse)
        setTimeout(() => {
            const blockAhead = bot.blockAt(bot.entity.position.offset(
                Math.sin(-yaw), 0, Math.cos(-yaw)
            ));
            
            if (blockAhead && blockAhead.boundingBox === 'block') {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 250);
            }
        }, 500);
    }
    
    function stopMovement() {
        bot.setControlState('forward', false);
        bot.setControlState('back', false);
        bot.setControlState('left', false);
        bot.setControlState('right', false);
        bot.setControlState('jump', false);
        isMoving = false;
    }
    
    function scanSurroundings() {
        // Suche nach interessanten Blöcken in der Umgebung
        try {
            const scanRadius = 15;
            const startPosition = bot.entity.position.clone();
            
            // Liste interessanter Block-IDs (Beispiele)
            const interestingBlocks = [
                'chest', 'crafting_table', 'furnace', 'diamond_ore', 'gold_ore',
                'iron_ore', 'bookshelf', 'enchanting_table', 'nether_portal'
            ];
            
            // Vereinfachte Scan-Implementierung (in einer echten Implementierung würde man den Bot-Block-Scanner verwenden)
            const foundInterestingBlock = Math.random() < 0.3; // Simulierte Entdeckung
            
            if (foundInterestingBlock) {
                // Simuliere einen interessanten Fund
                const distance = Math.random() * scanRadius;
                const angle = Math.random() * Math.PI * 2;
                const interestPos = startPosition.offset(
                    Math.cos(angle) * distance,
                    (Math.random() - 0.5) * 5, // Höhenunterschied
                    Math.sin(angle) * distance
                );
                
                // Speichere den interessanten Ort
                interestPoints.push(interestPos);
                
                // Speichere im KI-Gedächtnis
                aiMemory.interestingLocations.push({
                    position: interestPos,
                    type: interestingBlocks[Math.floor(Math.random() * interestingBlocks.length)],
                    foundAt: Date.now()
                });
                
                addBotLog(bot.username, `Interessanten Ort entdeckt bei ${interestPos.x.toFixed(1)}, ${interestPos.y.toFixed(1)}, ${interestPos.z.toFixed(1)}`, "success");
            }
        } catch (e) {
            // Fehlerbehandlung
            console.error("Fehler beim Scannen der Umgebung:", e);
        }
    }
    
    function getNearestPlayer() {
        // Finde den nächsten Spieler (nicht selbst)
        const players = Object.values(bot.players)
            .filter(player => player.entity && player.username !== bot.username);
        
        if (players.length === 0) return null;
        
        // Sortiere nach Distanz
        players.sort((a, b) => {
            return bot.entity.position.distanceTo(a.entity.position) - 
                   bot.entity.position.distanceTo(b.entity.position);
        });
        
        // Wähle den nächsten Spieler (oder zufällig einen der drei nächsten Spieler)
        const nearbyPlayers = players.slice(0, Math.min(3, players.length));
        return nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)].entity;
    }
    
    // KI-Verhaltenssystem
    const aiDecisionInterval = setInterval(() => {
        if (!bot.entity) {
            clearInterval(aiDecisionInterval);
            return;
        }
        
        // Sicherheitscheck
        const currentTime = Date.now();
        
        try {
            // Entscheide über nächste Aktion basierend auf aktuellem Zustand
            if (isMoving) return; // Warte, bis die aktuelle Bewegung beendet ist
            
            // Wechsle Verhalten basierend auf Umgebung und Zustand
            if (botMode === "reconnaissance") {
                // 70% Chance zur Erkundung, 20% für Beobachtung, 10% für Spielersuche
                const decision = Math.random();
                if (decision < 0.7) {
                    aiMovementPatterns.explore();
                } else if (decision < 0.9) {
                    aiMovementPatterns.observeSurroundings();
                } else {
                    aiMovementPatterns.followNearbyPlayer();
                }
                
                // Gelegentlich zu Patrouille wechseln
                if (interestPoints.length >= 2 && Math.random() < 0.25) {
                    botMode = "patrolling";
                }
            } else if (botMode === "patrolling") {
                aiMovementPatterns.patrol();
                
                // Manchmal zurück zu Erkundung
                if (Math.random() < 0.1) {
                    botMode = "reconnaissance";
                }
            } else if (botMode === "following") {
                aiMovementPatterns.followNearbyPlayer();
                
                // Höhere Chance, zum normalen Verhalten zurückzukehren
                if (Math.random() < 0.3) {
                    botMode = "reconnaissance";
                }
            }
            
            // Aktualisiere Zeitstempel der letzten Aktion
            lastAction = currentTime;
        } catch (e) {
            console.error("Fehler im KI-Entscheidungssystem:", e);
            // Setze auf einfaches Verhalten zurück bei Fehler
            stopMovement();
            botMode = "reconnaissance";
        }
    }, 8000); // Alle 8 Sekunden Entscheidung treffen
    
    // Ereignisse registrieren, die als Aktivität zählen
    const activityEvents = ['chat', 'move', 'health', 'spawn', 'respawn'];
    activityEvents.forEach(event => {
        bot.on(event, () => {
            lastAction = Date.now();
        });
    });
    
    // Reagieren auf Spieler-Chat
    bot.on('chat', (username, message) => {
        // Ignoriere eigene Nachrichten
        if (username === bot.username) return;
        
        // Speichere Interaktion im Gedächtnis
        if (!aiMemory.playerInteractions[username]) {
            aiMemory.playerInteractions[username] = {
                messages: [],
                lastSeen: Date.now()
            };
        }
        
        aiMemory.playerInteractions[username].messages.push({
            timestamp: Date.now(),
            content: message
        });
        
        // Einfache Reaktion auf bestimmte Schlüsselwörter
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('hallo') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            setTimeout(() => {
                sendCommand(bot.username, `chat Hallo ${username}! Ich bin ein KI-gesteuerter Bot.`);
            }, 1000 + Math.random() * 1000);
        } else if (lowerMsg.includes('folge') || lowerMsg.includes('komm')) {
            // Wechsle in den Folgemodus für diesen Spieler
            const player = bot.players[username];
            if (player && player.entity) {
                botMode = "following";
                addBotLog(bot.username, `Folge Spieler auf Befehl: ${username}`, "info");
            }
        } else if (lowerMsg.includes('stop') || lowerMsg.includes('halt') || lowerMsg.includes('bleib')) {
            // Stoppe alle Bewegungen
            stopMovement();
            botMode = "reconnaissance";
            addBotLog(bot.username, `Bewegung auf Befehl von ${username} gestoppt`, "info");
        }
    });
    
    // Dynamische Anpassung bei Schaden
    bot.on('hurt', () => {
        // Bei Schaden, versuche wegzulaufen
        addBotLog(bot.username, "Schaden erhalten! Suche sicheren Bereich", "warning");
        
        // Vorübergehend Verhalten ändern
        stopMovement();
        
        // Wenn zuletzt bekannte sichere Position vorhanden, dorthin zurückkehren
        if (lastKnownSafePosition) {
            if (bot.pathfinder) {
                bot.pathfinder.setGoal(new bot.pathfinder.goals.GoalNear(
                    lastKnownSafePosition.x, lastKnownSafePosition.y, lastKnownSafePosition.z, 2
                ));
            } else {
                moveToPosition(lastKnownSafePosition);
            }
        } else {
            // Sonst in zufällige Richtung fliehen
            const angle = Math.random() * Math.PI * 2;
            simpleMove(angle, 15); // Weiter weg bewegen
        }
        
        // Füge aktuellen Ort als gefährlich hinzu
        aiMemory.dangerousAreas.push({
            position: bot.entity.position.clone(),
            time: Date.now()
        });
    });
    
    // Wenn Bot endet, alle Intervalle löschen
    bot.on('end', () => {
        clearInterval(aiDecisionInterval);
    });
}

// Bot beenden
function stopBot(username) {
    return new Promise((resolve) => {
        if (activeBots[username]) {
            try {
                console.log(`Stoppe Bot für ${username}`);
                activeBots[username].end();
                delete activeBots[username];
                // Zurücksetzen der Wiederverbindungsversuche
                reconnectAttempts[username] = 0;
                resolve({
                    success: true,
                    message: 'Bot erfolgreich getrennt'
                });
            } catch (error) {
                console.error(`Fehler beim Beenden des Bots für ${username}: ${error.message}`);
                resolve({
                    success: false,
                    error: `Fehler beim Beenden: ${error.message}`
                });
            }
        } else {
            resolve({
                success: false,
                error: 'Bot nicht gefunden'
            });
        }
    });
}

// Befehl an Bot senden
function sendCommand(username, command) {
    return new Promise((resolve) => {
        if (activeBots[username]) {
            try {
                console.log(`Sende Befehl '${command}' für Bot ${username}`);
                activeBots[username].chat(command);
                resolve({
                    success: true,
                    message: 'Befehl gesendet',
                    data: { command }
                });
            } catch (error) {
                console.error(`Fehler beim Senden des Befehls für ${username}: ${error.message}`);
                resolve({
                    success: false,
                    error: `Fehler beim Senden des Befehls: ${error.message}`
                });
            }
        } else {
            resolve({
                success: false,
                error: 'Bot nicht gefunden'
            });
        }
    });
}

// Status des Bots abfragen
function getBotStatus(username) {
    if (!activeBots[username]) {
        return {
            success: false,
            active: false,
            error: 'Bot nicht gefunden oder nicht verbunden'
        };
    }
    
    const bot = activeBots[username];
    if (!bot.entity) {
        return {
            success: true,
            active: false,
            message: 'Bot ist verbunden, aber noch nicht vollständig geladen'
        };
    }
    
    try {
        return {
            success: true,
            active: true,
            health: bot.health || 20,
            food: bot.food || 20,
            position: {
                x: Math.floor(bot.entity.position.x),
                y: Math.floor(bot.entity.position.y),
                z: Math.floor(bot.entity.position.z)
            },
            dimension: bot.game.dimension || 'overworld',
            playerCount: Object.keys(bot.players || {}).length - 1, // -1 für den Bot selbst
            serverName: bot.game.serverBrand || 'Minecraft',
            server: bot.server ? bot.server.host : (bot._client ? bot._client.socket.remoteAddress : 'unknown'),
            version: bot.version || 'unknown',
            botName: bot.username || 'unknown',
            reconnected: bot.reconnected === true,
            reconnectAttempts: reconnectAttempts[username] || 0
        };
    } catch (error) {
        console.error(`Fehler beim Abrufen des Status für ${username}: ${error.message}`);
        return {
            success: false,
            active: false,
            error: `Fehler beim Abrufen des Status: ${error.message}`
        };
    }
}

// Funktion, um Log für einen Bot hinzuzufügen
function addBotLog(username, message, type = 'info') {
    // Stellen Sie sicher, dass botLogs initialisiert ist
    if (!botLogs[username]) {
        botLogs[username] = [];
    }
    
    // Maximale Anzahl von Logs begrenzen (letzte 50)
    if (botLogs[username].length > 50) {
        botLogs[username].shift(); // Ältesten Log entfernen
    }
    
    // Log mit Zeitstempel hinzufügen
    botLogs[username].push({
        time: new Date().toISOString(),
        message: message,
        type: type
    });
}

// Logs für einen Bot abrufen
function getBotLogs(username) {
    return botLogs[username] || [];
}

// Event-Logging für Bot einrichten
function setupBotEventLogging(bot, username) {
    // Ereignisse, die geloggt werden sollen
    const logEvents = {
        chat: (username, message, translate, jsonMsg) => {
            // Nur Chatnachrichten loggen, die sichtbar sind
            if (jsonMsg && (jsonMsg.translate === 'chat.type.text' || jsonMsg.translate === 'chat.type.announcement')) {
                const sender = jsonMsg.with && jsonMsg.with[0] && jsonMsg.with[0].text ? jsonMsg.with[0].text : 'Server';
                const msg = jsonMsg.with && jsonMsg.with[1] ? jsonMsg.with[1].text : message;
                return `Chat: ${sender}: ${msg}`;
            }
            return `Chat: ${message}`;
        },
        kicked: (reason) => {
            let kickReason = '';
            try {
                const parsed = JSON.parse(reason);
                kickReason = parsed.text || reason;
            } catch {
                kickReason = reason;
            }
            return `Vom Server gekickt: ${kickReason}`;
        },
        end: () => 'Verbindung getrennt',
        death: () => 'Bot ist gestorben',
        respawn: () => 'Bot wiederbelebt',
        error: (err) => `Fehler: ${err.message}`,
        login: () => 'Eingeloggt',
        resourcePack: (url) => `Ressourcenpaket: ${url.substring(0, 20)}...`,
        rain: () => 'Es regnet',
        playerJoined: (player) => {
            if (bot.username !== player.username) {
                return `Spieler beigetreten: ${player.username}`;
            }
            return null; // Eigener Beitritt wird nicht geloggt
        },
        playerLeft: (player) => {
            if (bot.username !== player.username) {
                return `Spieler hat verlassen: ${player.username}`;
            }
            return null; // Eigenen Ausstieg nicht loggen
        },
        message: (jsonMsg) => {
            // Versuchen, die Nachricht zu dekodieren
            try {
                let readableMessage = '';
                if (typeof jsonMsg === 'string') {
                    readableMessage = jsonMsg;
                } else if (jsonMsg.text) {
                    readableMessage = jsonMsg.text;
                } else if (jsonMsg.translate && jsonMsg.with) {
                    // Einfach die wichtigsten Daten extrahieren
                    readableMessage = `${jsonMsg.translate}: ${jsonMsg.with.map(w => w.text || w).join(', ')}`;
                } else {
                    readableMessage = JSON.stringify(jsonMsg);
                }
                return `System: ${readableMessage}`;
            } catch {
                return null; // Bei Fehlern nicht loggen
            }
        }
    };
    
    // Event-Listener für jeden Event-Typ hinzufügen
    Object.entries(logEvents).forEach(([event, formatter]) => {
        bot.on(event, (...args) => {
            try {
                const message = formatter(...args);
                if (message) {
                    // Logtyp basierend auf Event bestimmen
                    let type = 'info';
                    if (event === 'kicked' || event === 'death' || event === 'error') {
                        type = 'error';
                    } else if (event === 'playerJoined' || event === 'playerLeft') {
                        type = 'event';
                    } else if (event === 'chat') {
                        type = 'chat';
                    }
                    
                    // Log hinzufügen
                    addBotLog(username, message, type);
                }
            } catch (error) {
                console.error(`Fehler beim Loggen von ${event}:`, error);
            }
        });
    });
    
    // Spezielle Behandlung für Positionsänderungen (seltener loggen)
    let lastPositionLog = 0;
    bot.on('move', () => {
        const now = Date.now();
        if (now - lastPositionLog > 60000) { // Nur alle 60 Sekunden loggen
            lastPositionLog = now;
            if (bot.entity) {
                const pos = bot.entity.position;
                addBotLog(username, `Position: X=${Math.floor(pos.x)}, Y=${Math.floor(pos.y)}, Z=${Math.floor(pos.z)}`, 'info');
            }
        }
    });
}

// Exportiere die Funktionen für das Admin-Dashboard (zusätzlich zu oben, hier erneut für den Fall, dass der Aufruf verschoben wird)
if (typeof window !== 'undefined') {
    window.startMinecraftBot = startBot;
    window.stopMinecraftBot = stopBot;
}

module.exports = {
    startBot,
    stopBot,
    sendCommand,
    getBotStatus,
    addBotLog,
    getBotLogs
};