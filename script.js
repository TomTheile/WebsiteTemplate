/**
 * Erstellt eine Statusmeldung (Erfolg oder Fehler) für die Anzeige im Formular
 * @param {string} message - Die anzuzeigende Nachricht
 * @param {boolean} isError - Ob es sich um eine Fehlermeldung handelt (Standard: false)
 * @returns {HTMLElement} - Das erstellte Statusmeldungselement
 */
function createStatusMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('status-message');
    
    if (isError) {
        messageDiv.classList.add('error');
    } else {
        messageDiv.classList.add('success');
    }
    
    messageDiv.textContent = message;
    return messageDiv;
}

/**
 * Entfernt alle vorhandenen Statusmeldungen aus einem Formularelement
 * @param {HTMLElement} formElement - Das Formularelement, aus dem die Meldungen entfernt werden sollen
 */
function clearStatusMessages(formElement) {
    const existingMessages = formElement.querySelectorAll('.status-message');
    existingMessages.forEach(message => message.remove());
}

/**
 * Sendet eine E-Mail direkt an den Benutzer (für Testzwecke)
 * @param {string} toEmail - Die E-Mail-Adresse des Empfängers
 * @param {string} username - Der Benutzername des Empfängers
 * @returns {Promise<boolean>} - Erfolgreich oder nicht
 */
async function sendEmailDirectly(toEmail, username) {
    console.log(`Sende E-Mail an ${toEmail} (${username})...`);
    
    // In einer echten Anwendung würde hier eine E-Mail über einen Dienst wie SendGrid gesendet werden
    return new Promise((resolve) => {
        // Simuliere eine Verzögerung von 1 Sekunde
        setTimeout(() => {
            console.log(`E-Mail an ${toEmail} gesendet!`);
            resolve(true);
        }, 1000);
    });
}

/**
 * Überprüft, ob der Benutzer angemeldet ist und leitet ggf. zur Anmeldeseite weiter
 * Diese Funktion sollte auf jeder geschützten Seite aufgerufen werden
 */
function checkAuthentication() {
    const authToken = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    if (!authToken || !userId) {
        // Nicht angemeldet, zur Anmeldeseite weiterleiten
        window.location.href = 'index.html';
        return false;
    }
    
    // Benutzerinformationen laden
    const username = localStorage.getItem('username') || 'Benutzer';
    const userRole = localStorage.getItem('user_role') || 'user';
    
    // Prüfen, ob auf Admin-Seite zugegriffen wird
    if (window.location.pathname.includes('admin.html')) {
        // Prüfen, ob der Benutzer Admin-Rechte hat
        try {
            // Überprüfe Admin-Status in der Datenbank (für zusätzliche Sicherheit)
            if (typeof isUserAdmin === 'function') {
                const isAdmin = isUserAdmin(userId);
                if (!isAdmin && userRole !== 'admin') {
                    console.log('Kein Admin-Zugriff (Datenbank-Check), Weiterleitung zur Dashboard-Seite');
                    window.location.href = 'dashboard.html';
                    return false;
                }
            } else if (userRole !== 'admin') {
                // Fallback auf localStorage, wenn die Datenbank-Funktion nicht verfügbar ist
                console.log('Kein Admin-Zugriff (localStorage-Check), Weiterleitung zur Dashboard-Seite');
                window.location.href = 'dashboard.html';
                return false;
            }
        } catch (error) {
            console.error('Fehler bei der Admin-Überprüfung:', error);
            // Bei einem Fehler vorsichtshalber weiterleiten
            if (userRole !== 'admin') {
                window.location.href = 'dashboard.html';
                return false;
            }
        }
    }
    
    // Benutzernamen anzeigen, falls entsprechendes Element vorhanden
    const usernameElement = document.getElementById('username-display');
    if (usernameElement) {
        usernameElement.textContent = username;
    }
    
    // Admin-Elemente anzeigen/ausblenden, falls vorhanden
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        if (userRole === 'admin') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
    
    // Benachrichtigungscenter initialisieren, falls nicht bereits existiert
    if (!document.querySelector('.notification-center')) {
        setTimeout(() => {
            createNotificationCenter();
        }, 500); // Verzögerung, um sicherzustellen, dass DOM vollständig geladen ist
    }
    
    return true;
}

/**
 * Meldet den Benutzer ab und leitet zur Anmeldeseite weiter
 */
function logout() {
    // Alle relevanten Daten aus dem lokalen Speicher entfernen
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('user_role');
    
    // Zur Anmeldeseite weiterleiten
    window.location.href = 'index.html';
}

/**
 * Formatiert ein Datum in ein lesbares Format
 * @param {Date|string} date - Das zu formatierende Datum oder ein Datums-String
 * @returns {string} - Das formatierte Datum
 */
function formatDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Ungültiges Datum';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Formatiert eine Zeitdauer in ein lesbares Format
 * @param {number} durationInSeconds - Die Dauer in Sekunden
 * @returns {string} - Die formatierte Dauer
 */
function formatDuration(durationInSeconds) {
    if (durationInSeconds < 60) {
        return `${durationInSeconds} Sek.`;
    } else if (durationInSeconds < 3600) {
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${minutes} Min. ${seconds} Sek.`;
    } else {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        return `${hours} Std. ${minutes} Min.`;
    }
}

/**
 * Erstellt ein Chart-Element mit Chart.js
 * @param {string} elementId - Die ID des Canvas-Elements
 * @param {string} type - Der Chart-Typ ('line', 'bar', 'pie', etc.)
 * @param {Array} labels - Die Labels für die X-Achse
 * @param {Array} data - Die Datenpunkte
 * @param {Object} options - Zusätzliche Optionen für das Chart
 */
function createChart(elementId, type, labels, data, options = {}) {
    const ctx = document.getElementById(elementId).getContext('2d');
    
    // Standard-Optionen für Chart.js
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#a0a0a0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: '#a0a0a0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };
    
    // Optionen zusammenführen
    const chartOptions = { ...defaultOptions, ...options };
    
    // Chart erstellen
    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: options.label || 'Daten',
                data: data,
                backgroundColor: options.backgroundColor || 'rgba(30, 255, 0, 0.2)',
                borderColor: options.borderColor || '#1eff00',
                borderWidth: 1,
                tension: 0.4
            }]
        },
        options: chartOptions
    });
}

/**
 * Zeigt eine Toast-Benachrichtigung an
 * @param {string} message - Die anzuzeigende Nachricht
 * @param {string} type - Der Typ der Benachrichtigung ('success', 'error', 'warning', 'info')
 * @param {number} duration - Die Anzeigedauer in Millisekunden
 */
function showToast(message, type = 'info', duration = 3000) {
    // Toast-Container erstellen, falls nicht vorhanden
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Toast-Element erstellen
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Toast-Styling
    toast.style.backgroundColor = type === 'success' ? 'rgba(0, 255, 0, 0.2)' :
                               type === 'error' ? 'rgba(255, 0, 0, 0.2)' :
                               type === 'warning' ? 'rgba(255, 255, 0, 0.2)' :
                               'rgba(0, 0, 255, 0.2)';
    toast.style.color = type === 'success' ? '#55ff55' :
                     type === 'error' ? '#ff5555' :
                     type === 'warning' ? '#ffff55' :
                     '#5555ff';
    toast.style.padding = '12px 20px';
    toast.style.marginBottom = '10px';
    toast.style.borderRadius = '5px';
    toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    toast.style.borderLeft = `3px solid ${type === 'success' ? '#55ff55' :
                                      type === 'error' ? '#ff5555' :
                                      type === 'warning' ? '#ffff55' :
                                      '#5555ff'}`;
    
    // Toast zum Container hinzufügen
    toastContainer.appendChild(toast);
    
    // Toast-Animation
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Kurze Verzögerung, um die Animation zu starten
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Toast nach einer bestimmten Zeit ausblenden
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        
        // Toast entfernen, nachdem die Animation abgeschlossen ist
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Erstellt und rendert das Benachrichtigungscenter
 */
function createNotificationCenter() {
    // Prüfen, ob das Benachrichtigungscenter bereits existiert
    if (document.querySelector('.notification-center')) {
        return;
    }

    // Benutzer-ID abrufen
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    // Benachrichtigungscenter-Container erstellen
    const notificationCenter = document.createElement('div');
    notificationCenter.className = 'notification-center';
    
    // Benachrichtigungscenter-Header
    const header = document.createElement('div');
    header.className = 'notification-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Benachrichtigungen';
    
    const actions = document.createElement('div');
    actions.className = 'notification-actions';
    
    const markAllRead = document.createElement('button');
    markAllRead.className = 'notification-action-btn';
    markAllRead.textContent = 'Alle als gelesen markieren';
    markAllRead.addEventListener('click', function() {
        markAllNotificationsAsRead(userId);
        updateNotificationUI();
    });
    
    actions.appendChild(markAllRead);
    header.appendChild(title);
    header.appendChild(actions);
    
    // Benachrichtigungsliste
    const notificationList = document.createElement('ul');
    notificationList.className = 'notification-list';
    
    // Benachrichtigungscenter-Footer
    const footer = document.createElement('div');
    footer.className = 'notification-footer';
    
    const footerLink = document.createElement('a');
    footerLink.href = '#';
    footerLink.textContent = 'Alle Benachrichtigungen anzeigen';
    footerLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Hier könnte eine Seite mit allen Benachrichtigungen angezeigt werden
        console.log('Alle Benachrichtigungen anzeigen');
    });
    
    footer.appendChild(footerLink);
    
    // Alles zusammenfügen
    notificationCenter.appendChild(header);
    notificationCenter.appendChild(notificationList);
    notificationCenter.appendChild(footer);
    
    // Zum Body hinzufügen
    document.body.appendChild(notificationCenter);
    
    // Benachrichtigungsglocke erstellen
    createNotificationBell();
    
    // Benachrichtigungen initial laden
    updateNotificationUI();
}

/**
 * Erstellt die Benachrichtigungsglocke
 */
function createNotificationBell() {
    // Prüfen, ob die Benachrichtigungsglocke bereits existiert
    if (document.querySelector('.notification-bell')) {
        return;
    }
    
    // Benutzer-ID abrufen
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    
    // Container für die Glocke
    const container = document.querySelector('.user-info') || document.querySelector('.header') || document.querySelector('.navbar');
    
    if (!container) {
        console.error('Kein geeigneter Container für die Benachrichtigungsglocke gefunden');
        return;
    }
    
    // Benachrichtigungsglocke erstellen
    const bell = document.createElement('div');
    bell.className = 'notification-bell';
    
    // Icon
    const icon = document.createElement('span');
    icon.className = 'notification-bell-icon';
    icon.innerHTML = '<i class="material-icons">notifications</i>';
    
    // Badge
    const badge = document.createElement('span');
    badge.className = 'notification-badge hidden';
    badge.textContent = '0';
    
    // Zusammenfügen
    bell.appendChild(icon);
    bell.appendChild(badge);
    
    // Zum Container hinzufügen
    container.appendChild(bell);
    
    // Event-Listener für Klick auf die Glocke
    bell.addEventListener('click', function() {
        const notificationCenter = document.querySelector('.notification-center');
        if (notificationCenter) {
            notificationCenter.classList.toggle('open');
            
            // Bei Öffnen ungelesene Benachrichtigungen aktualisieren
            if (notificationCenter.classList.contains('open')) {
                updateNotificationUI();
            }
        }
    });
    
    // Event-Listener zum Schließen bei Klick außerhalb
    document.addEventListener('click', function(event) {
        const notificationCenter = document.querySelector('.notification-center');
        const notificationBell = document.querySelector('.notification-bell');
        
        if (notificationCenter && notificationCenter.classList.contains('open') && 
            !notificationCenter.contains(event.target) && 
            !notificationBell.contains(event.target)) {
            notificationCenter.classList.remove('open');
        }
    });
    
    // Ungelesene Benachrichtigungen aktualisieren
    updateUnreadBadge();
}

/**
 * Aktualisiert die UI des Benachrichtigungscenters
 */
function updateNotificationUI() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;
    
    // Benachrichtigungen abrufen
    const notifications = getNotifications(userId, { limit: 10 });
    
    // Benachrichtigungsliste leeren
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'notification-empty';
        emptyMessage.textContent = 'Keine Benachrichtigungen vorhanden';
        notificationList.appendChild(emptyMessage);
    } else {
        // Benachrichtigungen anzeigen
        notifications.forEach(notification => {
            const item = document.createElement('li');
            item.className = `notification-item ${notification.type}`;
            if (!notification.isRead) {
                item.classList.add('unread');
            }
            
            const content = document.createElement('div');
            content.className = 'notification-content';
            
            // Icon basierend auf Typ
            const icon = document.createElement('span');
            icon.className = 'notification-icon';
            
            switch (notification.type) {
                case 'success':
                    icon.innerHTML = '<i class="material-icons">check_circle</i>';
                    break;
                case 'warning':
                    icon.innerHTML = '<i class="material-icons">warning</i>';
                    break;
                case 'error':
                    icon.innerHTML = '<i class="material-icons">error</i>';
                    break;
                default:
                    icon.innerHTML = '<i class="material-icons">info</i>';
            }
            
            // Nachricht
            const message = document.createElement('div');
            message.className = 'notification-message';
            message.textContent = notification.message;
            
            // Zeit
            const time = document.createElement('div');
            time.className = 'notification-time';
            time.textContent = formatRelativeTime(new Date(notification.createdAt));
            
            // Action Link, falls vorhanden
            if (notification.link && notification.actionText) {
                const action = document.createElement('a');
                action.className = 'notification-action';
                action.href = notification.link;
                action.textContent = notification.actionText;
                message.appendChild(action);
            }
            
            message.appendChild(time);
            content.appendChild(icon);
            content.appendChild(message);
            item.appendChild(content);
            
            // Event Listener zum Markieren als gelesen
            item.addEventListener('click', function() {
                markNotificationAsRead(notification.id);
                this.classList.remove('unread');
                updateUnreadBadge();
                
                // Wenn Link vorhanden, dorthin navigieren
                if (notification.link) {
                    window.location.href = notification.link;
                }
            });
            
            notificationList.appendChild(item);
        });
    }
    
    // Ungelesene Benachrichtigungen-Badge aktualisieren
    updateUnreadBadge();
}

/**
 * Aktualisiert den Ungelesen-Badge an der Glocke
 */
function updateUnreadBadge() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;
    
    // Ungelesene Benachrichtigungen zählen
    const unreadNotifications = getNotifications(userId, { onlyUnread: true });
    const count = unreadNotifications.length;
    
    // Badge aktualisieren
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
    } else {
        badge.textContent = '0';
        badge.classList.add('hidden');
    }
}

/**
 * Formatiert eine Zeitdifferenz in einen lesbaren relativen Zeitstring
 * @param {Date} date - Das zu formatierende Datum
 * @returns {string} - Der formatierte Zeitstring (z.B. "vor 5 Minuten")
 */
function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'gerade eben';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `vor ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `vor ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
    } else {
        return formatDate(date);
    }
}