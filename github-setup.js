/**
 * GitHub-Setup.js
 * 
 * Diese Datei enthält Hilfsfunktionen, um die Anwendung auf GitHub Pages kompatibel zu machen.
 * Sie überprüft, ob die Seite auf GitHub Pages läuft, und passt die API-Aufrufe entsprechend an.
 */

(function() {
    /**
     * Prüft, ob die aktuelle Seite auf GitHub Pages gehostet wird
     * @returns {boolean} true, wenn die Seite auf GitHub Pages läuft
     */
    function isRunningOnGitHub() {
        return window.location.hostname.endsWith('github.io') || 
               window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }

    /**
     * Lädt ein Script dynamisch nach
     * @param {string} src - Der Pfad zum Script
     * @returns {Promise} - Ein Promise, das aufgelöst wird, wenn das Script geladen wurde
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Initialisiert die GitHub-kompatible Umgebung
     */
    async function initGitHubMode() {
        console.log('GitHub-Modus wird initialisiert...');
        
        // API-Mock laden
        try {
            await loadScript('api-mock.js');
            console.log('API-Mock wurde geladen.');
        } catch (error) {
            console.error('Fehler beim Laden des API-Mocks:', error);
        }
        
        // Bot-Mood-Modul erzeugen, falls es über ein externes Script geladen wird
        if (typeof BotMood === 'undefined') {
            console.log('BotMood-Modul wird initialisiert...');
            window.BotMood = {
                determineMood: function(metrics) {
                    return {
                        emoji: metrics.isOnline ? '😊' : '😴',
                        label: metrics.isOnline ? 'Aktiv' : 'Offline',
                        color: metrics.isOnline ? '#1eff00' : '#ff5555'
                    };
                },
                determinePerformance: function(metrics) {
                    return {
                        emoji: '⚡',
                        label: 'Normal',
                        color: '#1eff00'
                    };
                },
                determineActivity: function(metrics) {
                    return {
                        emoji: '🚶',
                        label: 'Erkundet',
                        color: '#1eff00'
                    };
                },
                determineHealth: function(metrics) {
                    return {
                        emoji: '❤️',
                        label: 'Gesund',
                        color: '#1eff00'
                    };
                },
                getBotStatus: function(metrics) {
                    return {
                        mood: this.determineMood(metrics),
                        performance: this.determinePerformance(metrics),
                        activity: this.determineActivity(metrics),
                        health: this.determineHealth(metrics)
                    };
                },
                generateMoodIndicator: function(metrics) {
                    const status = this.getBotStatus(metrics);
                    return `<div class="mood-indicator" title="${status.mood.label}">
                        <span style="color: ${status.mood.color};">${status.mood.emoji}</span>
                    </div>`;
                },
                generateStatusIndicators: function(metrics) {
                    const status = this.getBotStatus(metrics);
                    return `<div class="status-indicators">
                        <div class="status-indicator" title="${status.mood.label}">
                            <span style="color: ${status.mood.color};">${status.mood.emoji}</span>
                        </div>
                        <div class="status-indicator" title="${status.performance.label}">
                            <span style="color: ${status.performance.color};">${status.performance.emoji}</span>
                        </div>
                        <div class="status-indicator" title="${status.activity.label}">
                            <span style="color: ${status.activity.color};">${status.activity.emoji}</span>
                        </div>
                        <div class="status-indicator" title="${status.health.label}">
                            <span style="color: ${status.health.color};">${status.health.emoji}</span>
                        </div>
                    </div>`;
                },
                generateDetailedStatusCard: function(metrics) {
                    const status = this.getBotStatus(metrics);
                    return `<div class="detailed-status-container">
                        <div class="status-group">
                            <div class="status-item">
                                <div class="status-emoji" style="color: ${status.mood.color};">${status.mood.emoji}</div>
                                <div class="status-label">Stimmung: ${status.mood.label}</div>
                            </div>
                            <div class="status-item">
                                <div class="status-emoji" style="color: ${status.performance.color};">${status.performance.emoji}</div>
                                <div class="status-label">Leistung: ${status.performance.label}</div>
                            </div>
                        </div>
                        <div class="status-group">
                            <div class="status-item">
                                <div class="status-emoji" style="color: ${status.activity.color};">${status.activity.emoji}</div>
                                <div class="status-label">Aktivität: ${status.activity.label}</div>
                            </div>
                            <div class="status-item">
                                <div class="status-emoji" style="color: ${status.health.color};">${status.health.emoji}</div>
                                <div class="status-label">Gesundheit: ${status.health.label}</div>
                            </div>
                        </div>
                    </div>`;
                }
            };
        }

        // Minecraft-Animations-Modul erzeugen, falls es über ein externes Script geladen wird
        if (typeof MCAnimations === 'undefined') {
            console.log('MCAnimations-Modul wird initialisiert...');
            window.MCAnimations = {
                showLoadingScreen: function(message, withProgress) {
                    const loadingScreen = document.createElement('div');
                    loadingScreen.className = 'mc-loading-screen';
                    loadingScreen.innerHTML = `
                        <div class="mc-loading-container">
                            <div class="mc-loading-pickaxe"></div>
                            <div class="mc-loading-message">${message || 'Laden...'}</div>
                            ${withProgress ? '<div class="mc-loading-progress"><div class="mc-loading-progress-bar" style="width: 0%"></div></div>' : ''}
                        </div>
                    `;
                    document.body.appendChild(loadingScreen);
                    
                    return {
                        updateMessage: function(newMessage) {
                            const messageEl = loadingScreen.querySelector('.mc-loading-message');
                            if (messageEl) messageEl.textContent = newMessage;
                        },
                        updateProgress: function(percentage) {
                            const progressBar = loadingScreen.querySelector('.mc-loading-progress-bar');
                            if (progressBar) progressBar.style.width = percentage + '%';
                        },
                        close: function() {
                            loadingScreen.style.opacity = '0';
                            setTimeout(() => {
                                loadingScreen.remove();
                            }, 500);
                        }
                    };
                },
                openContainer: function(container) {
                    if (!container) return;
                    container.style.animation = 'mcContainerOpen 0.5s ease-out forwards';
                },
                createPixelatedTransition: function(element, pixelSize) {
                    if (!element) return null;
                    return null; // Vereinfachte Version für GitHub
                },
                animateStatusTransition: function(botId, element, newStatus) {
                    if (!element) return;
                    // GitHub-kompatible vereinfachte Animation
                    element.style.opacity = '0.7';
                    setTimeout(() => {
                        element.style.opacity = '1';
                    }, 300);
                },
                updateBotStatusWithAnimation: function(botId, element, botMetrics, updateFn) {
                    if (!element || !updateFn) return;
                    // Einfach Update-Funktion aufrufen ohne Animation
                    updateFn(element, botMetrics);
                }
            };
        }

        // BotAnimations-Modul erzeugen, falls es über ein externes Script geladen wird
        if (typeof BotAnimations === 'undefined') {
            console.log('BotAnimations-Modul wird initialisiert...');
            window.BotAnimations = {
                animateStatusTransition: function(botId, element, newStatus) {
                    if (!element) return;
                    // GitHub-kompatible vereinfachte Animation
                    element.style.opacity = '0.7';
                    setTimeout(() => {
                        element.style.opacity = '1';
                    }, 300);
                },
                updateBotStatusWithAnimation: function(botId, element, botMetrics, updateFn) {
                    if (!element || !updateFn) return;
                    // Einfach Update-Funktion aufrufen ohne Animation
                    updateFn(element, botMetrics);
                }
            };
        }

        // MinecraftAvatar-Modul erzeugen, falls es über ein externes Script geladen wird
        if (typeof MinecraftAvatar === 'undefined') {
            console.log('MinecraftAvatar-Modul wird initialisiert...');
            window.MinecraftAvatar = {
                generateAvatarUrl: function(options) {
                    const settings = {
                        username: '',
                        skinType: 'steve',
                        view: 'head',
                        size: 100,
                        background: '',
                        ...options
                    };
                    
                    // Basis-URL für die API
                    let url;
                    
                    if (settings.username) {
                        url = `https://mc-heads.net/avatar/${settings.username}/${settings.size}`;
                        
                        if (settings.view !== 'face') {
                            if (settings.view === 'head') {
                                url = `https://mc-heads.net/head/${settings.username}/${settings.size}`;
                            } else if (settings.view === 'bust') {
                                url = `https://mc-heads.net/bust/${settings.username}/${settings.size}`;
                            } else if (settings.view === 'full') {
                                url = `https://mc-heads.net/body/${settings.username}/${settings.size}`;
                            } else if (settings.view === 'skin') {
                                url = `https://mc-heads.net/skin/${settings.username}`;
                            }
                        }
                    } else {
                        const skinType = settings.skinType || 'steve';
                        
                        if (settings.view === 'face' || settings.view === 'head') {
                            url = `https://mc-heads.net/head/${skinType}/${settings.size}`;
                        } else if (settings.view === 'bust') {
                            url = `https://mc-heads.net/bust/${skinType}/${settings.size}`;
                        } else if (settings.view === 'full') {
                            url = `https://mc-heads.net/body/${skinType}/${settings.size}`;
                        } else {
                            url = `https://mc-heads.net/avatar/${skinType}/${settings.size}`;
                        }
                    }
                    
                    if (settings.background && settings.view !== 'skin') {
                        url += `/${settings.background}`;
                    }
                    
                    return url;
                },
                loadAvatar: function(options) {
                    const url = this.generateAvatarUrl(options);
                    return Promise.resolve(url);
                },
                createAvatarElement: function(container, options) {
                    if (!container) return Promise.reject(new Error('Container-Element fehlt'));
                    
                    return this.loadAvatar(options)
                        .then(url => {
                            container.innerHTML = '';
                            
                            const img = document.createElement('img');
                            img.src = url;
                            img.alt = 'Minecraft Avatar';
                            img.style.width = options.size + 'px';
                            img.style.height = options.size + 'px';
                            img.style.objectFit = 'contain';
                            
                            Object.keys(options).forEach(key => {
                                img.dataset[key] = options[key];
                            });
                            
                            container.appendChild(img);
                            return container;
                        });
                },
                createAvatarSelector: function(onSelect) {
                    // Vereinfachte Version für GitHub
                    const dialog = document.createElement('div');
                    dialog.className = 'modal';
                    dialog.style.display = 'block';
                    
                    dialog.innerHTML = `
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>Avatar auswählen</h3>
                                <button class="close-modal">×</button>
                            </div>
                            <div style="padding: 20px; text-align: center;">
                                <p>Wähle einen Avatar-Typ:</p>
                                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
                                    <div class="avatar-option" data-type="steve" style="cursor: pointer; padding: 10px; border-radius: 4px; border: 2px solid transparent;">
                                        <img src="https://mc-heads.net/avatar/steve/100" alt="Steve">
                                        <div>Steve</div>
                                    </div>
                                    <div class="avatar-option" data-type="alex" style="cursor: pointer; padding: 10px; border-radius: 4px; border: 2px solid transparent;">
                                        <img src="https://mc-heads.net/avatar/alex/100" alt="Alex">
                                        <div>Alex</div>
                                    </div>
                                </div>
                                <button id="select-avatar-btn" style="margin-top: 20px;">Avatar übernehmen</button>
                            </div>
                        </div>
                    `;
                    
                    setTimeout(() => {
                        const closeBtn = dialog.querySelector('.close-modal');
                        closeBtn.addEventListener('click', () => {
                            dialog.remove();
                        });
                        
                        const options = dialog.querySelectorAll('.avatar-option');
                        let selectedType = 'steve';
                        
                        options.forEach(option => {
                            option.addEventListener('click', () => {
                                options.forEach(opt => opt.style.borderColor = 'transparent');
                                option.style.borderColor = '#1eff00';
                                selectedType = option.dataset.type;
                            });
                        });
                        
                        const selectBtn = dialog.querySelector('#select-avatar-btn');
                        selectBtn.addEventListener('click', () => {
                            if (onSelect) {
                                onSelect({
                                    skinType: selectedType,
                                    view: 'head',
                                    size: 100,
                                    background: ''
                                });
                            }
                            dialog.remove();
                        });
                        
                        // Standardmäßig Steve auswählen
                        options[0].style.borderColor = '#1eff00';
                    }, 100);
                    
                    return dialog;
                }
            };
        }
        
        console.log('GitHub-Modus wurde erfolgreich initialisiert.');
    }

    // Beim Laden der Seite ausführen
    window.addEventListener('DOMContentLoaded', function() {
        if (isRunningOnGitHub()) {
            console.log('Die Seite läuft auf GitHub Pages oder lokal. GitHub-Modus wird aktiviert...');
            initGitHubMode();
        } else {
            console.log('Die Seite läuft auf einem normalen Webserver. Standard-Modus wird verwendet.');
        }
    });
})();