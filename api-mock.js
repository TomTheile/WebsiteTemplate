/**
 * API-Mock.js
 * 
 * Diese Datei stellt simulierte API-Endpunkte für die Entwicklung und GitHub-Pages bereit.
 * Auf GitHub Pages können keine echten Backend-Anfragen verarbeitet werden, daher
 * simulieren wir hier alle notwendigen API-Antworten.
 */

const APIMock = (function() {
    // Demo-Daten für die Entwicklung
    // In einem echten Projekt würden diese Daten aus einer Datenbank kommen
    const USERS = [
        {
            uid: 'admin_id',
            username: 'Administrator',
            email: 'admin@herobrine-bot.de',
            password: 'admin123', // Nur für Demo-Zwecke, in Produktionsumgebung niemals Passwörter im Code speichern!
            role: 'admin',
            isPremium: true,
            maxBots: 999,
            createdAt: '2023-01-01'
        },
        {
            uid: 'user_1',
            username: 'TestUser',
            email: 'test@example.com',
            password: 'test123', // Nur für Demo-Zwecke
            role: 'user',
            isPremium: false,
            maxBots: 1,
            createdAt: '2023-01-15'
        }
    ];

    // Simulierte Bots
    let BOTS = [
        {
            id: 'bot_1',
            userId: 'user_1',
            username: 'TestBot',
            server: 'mc.example.com',
            port: 25565,
            version: '1.16.5',
            status: 'online',
            connectionQuality: 95,
            errorRate: 2,
            performance: 90,
            pingLatency: 120,
            autoReconnect: true,
            antiAFK: true,
            uptime: '3h 45m',
            activity: 'exploring',
            health: 20,
            createdAt: '2023-02-10',
            lastStatus: '2023-03-30',
            avatar: {
                skinType: 'steve',
                view: 'head',
                background: '',
                size: 100
            }
        }
    ];

    // Simulierte Logs
    const LOGS = [
        {
            botId: 'bot_1',
            timestamp: '2023-03-30 14:30:45',
            type: 'INFO',
            message: 'Bot erfolgreich mit Server verbunden'
        },
        {
            botId: 'bot_1',
            timestamp: '2023-03-30 14:32:10',
            type: 'ACTION',
            message: 'Bot erkundet die Umgebung (x: 125, y: 64, z: -89)'
        },
        {
            botId: 'bot_1',
            timestamp: '2023-03-30 14:35:22',
            type: 'WARNING',
            message: 'Verbindungsprobleme festgestellt, versuche erneut zu verbinden'
        },
        {
            botId: 'bot_1',
            timestamp: '2023-03-30 14:35:40',
            type: 'INFO',
            message: 'Verbindung wiederhergestellt'
        },
        {
            botId: 'bot_1',
            timestamp: '2023-03-30 14:40:15',
            type: 'INFO',
            message: 'Anti-AFK-Mechanismus aktiviert'
        }
    ];

    /**
     * Simuliert eine netzwerkbedingte Verzögerung
     * @param {number} ms - Die Verzögerung in Millisekunden
     * @returns {Promise} - Ein Promise, das nach der angegebenen Zeit aufgelöst wird
     */
    function delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generiert ein simuliertes JWT-Token
     * @param {string} userId - Die Benutzer-ID
     * @param {string} role - Die Benutzerrolle
     * @returns {string} - Ein simuliertes Token
     */
    function generateToken(userId, role) {
        return `${role}_token_${userId}_${Date.now()}`;
    }

    /**
     * Findet einen Benutzer anhand der E-Mail
     * @param {string} email - Die E-Mail-Adresse
     * @returns {Object|null} - Der gefundene Benutzer oder null
     */
    function findUserByEmail(email) {
        return USERS.find(user => user.email === email) || null;
    }

    /**
     * Findet einen Benutzer anhand der ID
     * @param {string} userId - Die Benutzer-ID
     * @returns {Object|null} - Der gefundene Benutzer oder null
     */
    function findUserById(userId) {
        return USERS.find(user => user.uid === userId) || null;
    }

    /**
     * Findet einen Bot anhand der ID
     * @param {string} botId - Die Bot-ID
     * @returns {Object|null} - Der gefundene Bot oder null
     */
    function findBotById(botId) {
        return BOTS.find(bot => bot.id === botId) || null;
    }

    /**
     * Findet alle Bots eines Benutzers
     * @param {string} userId - Die Benutzer-ID
     * @returns {Array} - Die gefundenen Bots
     */
    function findBotsByUserId(userId) {
        return BOTS.filter(bot => bot.userId === userId);
    }

    /**
     * Findet alle Logs eines Bots
     * @param {string} botId - Die Bot-ID
     * @returns {Array} - Die gefundenen Logs
     */
    function findLogsByBotId(botId) {
        return LOGS.filter(log => log.botId === botId);
    }

    /**
     * Generiert eine neue Bot-ID
     * @returns {string} - Eine eindeutige Bot-ID
     */
    function generateBotId() {
        return 'bot_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }

    /**
     * Simuliert den Login-Prozess
     * @param {string} email - Die E-Mail-Adresse
     * @param {string} password - Das Passwort
     * @returns {Promise<Object>} - Das Ergebnis des Login-Versuchs
     */
    async function login(email, password) {
        await delay(800); // Verzögerung simulieren
        
        const user = findUserByEmail(email);
        
        if (user && user.password === password) {
            const token = generateToken(user.uid, user.role);
            localStorage.setItem('user_id', user.uid);
            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role);
            
            return {
                success: true,
                token: token,
                user: {
                    uid: user.uid,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isPremium: user.isPremium
                }
            };
        } else {
            throw new Error('Ungültige Anmeldedaten');
        }
    }

    /**
     * Simuliert den Registrierungsprozess
     * @param {string} username - Der Benutzername
     * @param {string} email - Die E-Mail-Adresse
     * @param {string} password - Das Passwort
     * @returns {Promise<Object>} - Das Ergebnis des Registrierungsversuchs
     */
    async function register(username, email, password) {
        await delay(1000); // Verzögerung simulieren
        
        if (findUserByEmail(email)) {
            throw new Error('E-Mail-Adresse wird bereits verwendet');
        }
        
        if (!username || !email || !password) {
            throw new Error('Unvollständige Daten');
        }
        
        // In einer echten Anwendung würde hier ein neuer Benutzer erstellt werden
        // Hier simulieren wir nur eine erfolgreiche Antwort
        
        return {
            success: true,
            message: 'Registrierung erfolgreich! Bitte überprüfe deine E-Mails zur Bestätigung deines Kontos.'
        };
    }

    /**
     * Simuliert das Zurücksetzen eines Passworts
     * @param {string} email - Die E-Mail-Adresse
     * @returns {Promise<Object>} - Das Ergebnis des Passwort-Reset-Versuchs
     */
    async function resetPassword(email) {
        await delay(1000); // Verzögerung simulieren
        
        // In einer echten Anwendung würde hier eine E-Mail gesendet werden
        // Hier simulieren wir nur eine erfolgreiche Antwort
        
        return {
            success: true,
            message: 'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.'
        };
    }

    /**
     * Simuliert das Starten eines Bots
     * @param {Object} botData - Die Bot-Daten
     * @returns {Promise<Object>} - Das Ergebnis des Bot-Start-Versuchs
     */
    async function startBot(botData) {
        await delay(2000); // Verzögerung simulieren
        
        // Benutzer-ID aus dem lokalen Speicher holen
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('Nicht autorisiert');
        }
        
        // Benutzer finden
        const user = findUserById(userId);
        if (!user) {
            throw new Error('Benutzer nicht gefunden');
        }
        
        // Prüfen, ob der Benutzer weitere Bots erstellen darf
        const userBots = findBotsByUserId(userId);
        if (!user.isPremium && userBots.length >= user.maxBots) {
            return {
                success: false,
                error: 'Du hast das Maximum an erlaubten Bots erreicht. Upgrade auf Premium für unbegrenzte Bots.',
                canUpgrade: true
            };
        }
        
        // Neuen Bot erstellen
        const botId = generateBotId();
        const newBot = {
            id: botId,
            userId: userId,
            username: botData.username,
            server: botData.server,
            port: botData.port || 25565,
            version: botData.version || '1.16.5',
            status: 'online',
            connectionQuality: 95,
            errorRate: 0,
            performance: 100,
            pingLatency: 50,
            autoReconnect: botData.autoReconnect || false,
            antiAFK: botData.antiAFK || false,
            uptime: '0m',
            activity: 'connecting',
            health: 20,
            createdAt: new Date().toISOString().split('T')[0],
            lastStatus: new Date().toISOString().split('T')[0],
            avatar: botData.avatar || {
                skinType: 'steve',
                view: 'head',
                background: '',
                size: 80
            }
        };
        
        // Bot zur Liste hinzufügen
        BOTS.push(newBot);
        
        // Log erstellen
        LOGS.push({
            botId: botId,
            timestamp: new Date().toLocaleString(),
            type: 'INFO',
            message: 'Bot erfolgreich gestartet'
        });
        
        return {
            success: true,
            message: 'Bot wurde erfolgreich erstellt und gestartet',
            botId: botId,
            bot: newBot
        };
    }

    /**
     * Simuliert das Stoppen eines Bots
     * @param {string} botId - Die Bot-ID
     * @returns {Promise<Object>} - Das Ergebnis des Bot-Stop-Versuchs
     */
    async function stopBot(botId) {
        await delay(1000); // Verzögerung simulieren
        
        // Benutzer-ID aus dem lokalen Speicher holen
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('Nicht autorisiert');
        }
        
        // Bot finden
        const bot = findBotById(botId);
        if (!bot) {
            throw new Error('Bot nicht gefunden');
        }
        
        // Prüfen, ob der Benutzer den Bot stoppen darf
        if (bot.userId !== userId && localStorage.getItem('role') !== 'admin') {
            throw new Error('Keine Berechtigung zum Stoppen dieses Bots');
        }
        
        // Bot-Status aktualisieren
        bot.status = 'offline';
        
        // Log erstellen
        LOGS.push({
            botId: botId,
            timestamp: new Date().toLocaleString(),
            type: 'INFO',
            message: 'Bot wurde gestoppt'
        });
        
        return {
            success: true,
            message: 'Bot wurde erfolgreich gestoppt',
            botId: botId
        };
    }

    /**
     * Simuliert das Abrufen des Bot-Status
     * @param {string} userId - Die Benutzer-ID
     * @returns {Promise<Object>} - Die Bot-Status-Daten
     */
    async function getBotStatus(userId) {
        await delay(500); // Verzögerung simulieren
        
        if (!userId) {
            // Wenn keine Benutzer-ID angegeben ist, die aus dem lokalen Speicher verwenden
            userId = localStorage.getItem('user_id');
        }
        
        if (!userId) {
            throw new Error('Benutzer-ID nicht gefunden');
        }
        
        // Bots des Benutzers finden
        const userBots = findBotsByUserId(userId);
        
        // Gesamte Online-Zeit berechnen (nur zur Demonstration)
        const totalOnlineTime = '4h 30m';
        
        // Anzahl der verschiedenen Server berechnen
        const servers = new Set(userBots.map(bot => bot.server));
        
        return {
            success: true,
            bots: userBots,
            totalOnlineTime: totalOnlineTime,
            totalServers: servers.size
        };
    }

    /**
     * Simuliert das Abrufen der Bot-Details
     * @param {string} botId - Die Bot-ID
     * @returns {Promise<Object>} - Die Bot-Details
     */
    async function getBotDetails(botId) {
        await delay(800); // Verzögerung simulieren
        
        // Bot finden
        const bot = findBotById(botId);
        if (!bot) {
            throw new Error('Bot nicht gefunden');
        }
        
        return {
            success: true,
            bot: bot
        };
    }

    /**
     * Simuliert das Abrufen der Bot-Logs
     * @param {string} botId - Die Bot-ID
     * @returns {Promise<Object>} - Die Bot-Logs
     */
    async function getBotLogs(botId) {
        await delay(800); // Verzögerung simulieren
        
        // Logs des Bots finden
        const botLogs = findLogsByBotId(botId);
        
        return {
            success: true,
            logs: botLogs
        };
    }

    /**
     * Simuliert das Upgrade auf Premium
     * @param {Object} paymentData - Die Zahlungsdaten
     * @returns {Promise<Object>} - Das Ergebnis des Upgrade-Versuchs
     */
    async function upgradeAccount(paymentData) {
        await delay(1500); // Verzögerung simulieren
        
        // Benutzer-ID aus dem lokalen Speicher holen
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('Nicht autorisiert');
        }
        
        // Benutzer finden
        const user = findUserById(userId);
        if (!user) {
            throw new Error('Benutzer nicht gefunden');
        }
        
        // Benutzer auf Premium aktualisieren
        user.isPremium = true;
        user.maxBots = 999;
        
        return {
            success: true,
            message: 'Dein Konto wurde erfolgreich auf Premium aktualisiert. Du kannst jetzt unbegrenzt Bots erstellen.',
            isPremium: true,
            maxBots: 999
        };
    }

    /**
     * Simuliert das Abrufen der Admin-Statistiken
     * @returns {Promise<Object>} - Die Admin-Statistiken
     */
    async function getAdminStats() {
        await delay(500); // Verzögerung simulieren
        
        // Prüfen, ob der Benutzer Admin ist
        if (localStorage.getItem('role') !== 'admin') {
            throw new Error('Keine Berechtigung');
        }
        
        return {
            success: true,
            totalUsers: USERS.length,
            totalBots: BOTS.length,
            activeBots: BOTS.filter(bot => bot.status === 'online').length,
            premiumUsers: USERS.filter(user => user.isPremium).length
        };
    }

    /**
     * Simuliert das Abrufen der Benutzer für Admin
     * @returns {Promise<Object>} - Die Benutzer-Liste
     */
    async function getAdminUsers() {
        await delay(800); // Verzögerung simulieren
        
        // Prüfen, ob der Benutzer Admin ist
        if (localStorage.getItem('role') !== 'admin') {
            throw new Error('Keine Berechtigung');
        }
        
        // Benutzer ohne Passwörter zurückgeben
        const usersWithoutPasswords = USERS.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        
        return {
            success: true,
            users: usersWithoutPasswords
        };
    }

    /**
     * Simuliert das Abrufen aller Bots für Admin
     * @returns {Promise<Object>} - Die Bot-Liste
     */
    async function getAdminBots() {
        await delay(800); // Verzögerung simulieren
        
        // Prüfen, ob der Benutzer Admin ist
        if (localStorage.getItem('role') !== 'admin') {
            throw new Error('Keine Berechtigung');
        }
        
        return {
            success: true,
            bots: BOTS
        };
    }

    /**
     * Simuliert das Verbannen eines Benutzers (Admin)
     * @param {string} userId - Die Benutzer-ID
     * @param {string} reason - Der Grund für die Verbannung
     * @returns {Promise<Object>} - Das Ergebnis des Verbannungsversuchs
     */
    async function banUser(userId, reason) {
        await delay(1000); // Verzögerung simulieren
        
        // Prüfen, ob der Benutzer Admin ist
        if (localStorage.getItem('role') !== 'admin') {
            throw new Error('Keine Berechtigung');
        }
        
        // In einer echten Anwendung würde hier der Benutzer gesperrt werden
        return {
            success: true,
            message: 'Benutzer wurde erfolgreich verbannt',
            userId: userId,
            reason: reason
        };
    }

    /**
     * Simuliert das Aufheben der Verbannung eines Benutzers (Admin)
     * @param {string} userId - Die Benutzer-ID
     * @returns {Promise<Object>} - Das Ergebnis des Aufhebungsversuchs
     */
    async function unbanUser(userId) {
        await delay(1000); // Verzögerung simulieren
        
        // Prüfen, ob der Benutzer Admin ist
        if (localStorage.getItem('role') !== 'admin') {
            throw new Error('Keine Berechtigung');
        }
        
        // In einer echten Anwendung würde hier die Sperrung aufgehoben werden
        return {
            success: true,
            message: 'Verbannung wurde erfolgreich aufgehoben',
            userId: userId
        };
    }

    /**
     * Simuliert das Verwarnen eines Benutzers (Admin)
     * @param {string} userId - Die Benutzer-ID
     * @param {string} reason - Der Grund für die Verwarnung
     * @returns {Promise<Object>} - Das Ergebnis des Verwarnungsversuchs
     */
    async function warnUser(userId, reason) {
        await delay(1000); // Verzögerung simulieren
        
        // Prüfen, ob der Benutzer Admin ist
        if (localStorage.getItem('role') !== 'admin') {
            throw new Error('Keine Berechtigung');
        }
        
        // In einer echten Anwendung würde hier der Benutzer verwarnt werden
        return {
            success: true,
            message: 'Benutzer wurde erfolgreich verwarnt',
            userId: userId,
            reason: reason
        };
    }

    /**
     * Lädt die API-Mock-Funktionen in ein globales Objekt
     */
    function initialize() {
        // Globales Mock-API-Objekt erstellen
        window.APIClient = {
            login,
            register,
            resetPassword,
            startBot,
            stopBot,
            getBotStatus,
            getBotDetails,
            getBotLogs,
            upgradeAccount,
            getAdminStats,
            getAdminUsers,
            getAdminBots,
            banUser,
            unbanUser,
            warnUser
        };

        // Hilfsfunktion zum Abfangen von Fetch-Aufrufen
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            // Nur API-Aufrufe abfangen
            if (typeof url === 'string' && url.startsWith('/api/')) {
                return handleFetchMock(url, options);
            }
            
            // Alle anderen Aufrufe durchlassen
            return originalFetch.apply(this, arguments);
        };

        console.log('APIClient wurde initialisiert. Alle API-Aufrufe werden mit Mockdaten simuliert.');
    }

    /**
     * Behandelt gemockte Fetch-Aufrufe
     * @param {string} url - Die URL des Aufrufs
     * @param {Object} options - Die Fetch-Optionen
     * @returns {Promise} - Ein Promise mit der simulierten Antwort
     */
    async function handleFetchMock(url, options) {
        console.log(`Mock-API-Aufruf: ${options.method || 'GET'} ${url}`);

        let responseData = {};
        let status = 200;
        let data = {};

        // POST-Daten extrahieren, wenn vorhanden
        if (options.body) {
            try {
                data = JSON.parse(options.body);
            } catch (e) {
                console.error('Fehler beim Parsen der Anfragedaten:', e);
            }
        }

        try {
            // API-Endpunkte simulieren
            if (url === '/api/users/login' && options.method === 'POST') {
                responseData = await login(data.email, data.password);
            } else if (url === '/api/users/register' && options.method === 'POST') {
                responseData = await register(data.username, data.email, data.password);
            } else if (url === '/api/users/reset-password' && options.method === 'POST') {
                responseData = await resetPassword(data.email);
            } else if (url === '/api/bots/start' && options.method === 'POST') {
                responseData = await startBot(data);
            } else if (url === '/api/bots/stop' && options.method === 'POST') {
                responseData = await stopBot(data.id);
            } else if (url.startsWith('/api/bots/status') && (!options.method || options.method === 'GET')) {
                // URL-Parameter extrahieren
                const urlObj = new URL(url, window.location.origin);
                const userId = urlObj.searchParams.get('userId');
                responseData = await getBotStatus(userId);
            } else if (url.startsWith('/api/bots/details') && (!options.method || options.method === 'GET')) {
                // URL-Parameter extrahieren
                const urlObj = new URL(url, window.location.origin);
                const botId = urlObj.searchParams.get('botId');
                responseData = await getBotDetails(botId);
            } else if (url.startsWith('/api/bots/logs') && (!options.method || options.method === 'GET')) {
                // URL-Parameter extrahieren
                const urlObj = new URL(url, window.location.origin);
                const botId = urlObj.searchParams.get('botId');
                responseData = await getBotLogs(botId);
            } else if (url === '/api/users/upgrade' && options.method === 'POST') {
                responseData = await upgradeAccount(data);
            } else if (url === '/api/admin/stats' && (!options.method || options.method === 'GET')) {
                responseData = await getAdminStats();
            } else if (url === '/api/admin/users' && (!options.method || options.method === 'GET')) {
                responseData = await getAdminUsers();
            } else if (url === '/api/admin/bots' && (!options.method || options.method === 'GET')) {
                responseData = await getAdminBots();
            } else if (url === '/api/admin/user/ban' && options.method === 'POST') {
                responseData = await banUser(data.userId, data.reason);
            } else if (url === '/api/admin/user/unban' && options.method === 'POST') {
                responseData = await unbanUser(data.userId);
            } else if (url === '/api/admin/user/warn' && options.method === 'POST') {
                responseData = await warnUser(data.userId, data.reason);
            } else {
                // Unbekannter Endpunkt
                status = 404;
                responseData = {
                    success: false,
                    error: 'API-Endpunkt nicht gefunden'
                };
            }
        } catch (error) {
            // Fehler behandeln
            status = 400;
            responseData = {
                success: false,
                error: error.message
            };
        }

        // Simulierte Response erstellen
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    ok: status >= 200 && status < 300,
                    status: status,
                    json: () => Promise.resolve(responseData)
                });
            }, 300); // Kleine Verzögerung für realistischeres Verhalten
        });
    }

    // API beim Laden der Seite initialisieren
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', initialize);
    }

    // Öffentliche API
    return {
        initialize
    };
})();