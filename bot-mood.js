/**
 * Bot-Mood.js
 * Dieses Modul stellt Funktionen bereit, um die "Stimmung" und Leistung eines Bots darzustellen.
 * Es verwendet Emojis, um verschiedene Zustände wie Leistung, Aktivität und Gesundheit anzuzeigen.
 */

const BotMood = (function() {
    // Private Konstanten für die verschiedenen Stimmungen
    const MOODS = {
        EXCELLENT: {
            emoji: '😄',
            label: 'Ausgezeichnet',
            description: 'Der Bot läuft optimal',
            color: '#1eff00' // Grün
        },
        GOOD: {
            emoji: '🙂',
            label: 'Gut',
            description: 'Der Bot läuft stabil',
            color: '#8bff4a' // Hellgrün
        },
        NEUTRAL: {
            emoji: '😐',
            label: 'Neutral',
            description: 'Der Bot läuft normal',
            color: '#ffd84a' // Gelb
        },
        CONCERNED: {
            emoji: '😕',
            label: 'Besorgt',
            description: 'Der Bot hat leichte Probleme',
            color: '#ffb74a' // Orange
        },
        TROUBLED: {
            emoji: '😟',
            label: 'Problematisch',
            description: 'Der Bot hat Schwierigkeiten',
            color: '#ff6f4a' // Rotorange
        },
        CRITICAL: {
            emoji: '😨',
            label: 'Kritisch',
            description: 'Der Bot hat ernste Probleme',
            color: '#ff4a4a' // Rot
        },
        OFFLINE: {
            emoji: '😴',
            label: 'Inaktiv',
            description: 'Der Bot ist offline',
            color: '#a0a0a0' // Grau
        }
    };

    // Leistungsindikatoren
    const PERFORMANCE = {
        HIGH: {
            emoji: '🚀',
            label: 'Hohe Leistung',
            description: 'Der Bot arbeitet mit optimaler Geschwindigkeit',
            color: '#1eff00' // Grün
        },
        NORMAL: {
            emoji: '⚡',
            label: 'Normale Leistung',
            description: 'Der Bot arbeitet mit normaler Geschwindigkeit',
            color: '#ffd84a' // Gelb
        },
        LOW: {
            emoji: '🐢',
            label: 'Niedrige Leistung',
            description: 'Der Bot arbeitet langsamer als normal',
            color: '#ff6f4a' // Rotorange
        }
    };

    // Aktivitätsindikatoren
    const ACTIVITY = {
        EXPLORING: {
            emoji: '🔍',
            label: 'Erkundet',
            description: 'Der Bot erkundet aktiv die Umgebung'
        },
        MINING: {
            emoji: '⛏️',
            label: 'Abbau',
            description: 'Der Bot baut Ressourcen ab'
        },
        FIGHTING: {
            emoji: '⚔️',
            label: 'Kampf',
            description: 'Der Bot bekämpft Gegner'
        },
        BUILDING: {
            emoji: '🏗️',
            label: 'Baut',
            description: 'Der Bot baut Strukturen'
        },
        CRAFTING: {
            emoji: '🛠️',
            label: 'Bastelt',
            description: 'Der Bot stellt Gegenstände her'
        },
        IDLE: {
            emoji: '💤',
            label: 'Inaktiv',
            description: 'Der Bot ist inaktiv'
        },
        FARMING: {
            emoji: '🌾',
            label: 'Farming',
            description: 'Der Bot bewirtschaftet Felder'
        },
        FISHING: {
            emoji: '🎣',
            label: 'Angelt',
            description: 'Der Bot angelt'
        },
        TRAVELING: {
            emoji: '🚶',
            label: 'Unterwegs',
            description: 'Der Bot ist unterwegs'
        }
    };

    // Gesundheits- und Statusindikatoren
    const HEALTH = {
        FULL: {
            emoji: '❤️',
            label: 'Volle Gesundheit',
            description: 'Der Bot hat volle Gesundheit',
            color: '#1eff00' // Grün
        },
        HIGH: {
            emoji: '💚',
            label: 'Hohe Gesundheit',
            description: 'Der Bot hat hohe Gesundheit',
            color: '#8bff4a' // Hellgrün
        },
        MEDIUM: {
            emoji: '💛',
            label: 'Mittlere Gesundheit',
            description: 'Der Bot hat mittlere Gesundheit',
            color: '#ffd84a' // Gelb
        },
        LOW: {
            emoji: '🧡',
            label: 'Niedrige Gesundheit',
            description: 'Der Bot hat niedrige Gesundheit',
            color: '#ffb74a' // Orange
        },
        CRITICAL: {
            emoji: '❤️‍🩹',
            label: 'Kritische Gesundheit',
            description: 'Der Bot hat kritisch niedrige Gesundheit',
            color: '#ff4a4a' // Rot
        }
    };

    /**
     * Bestimmt die Stimmung eines Bots basierend auf verschiedenen Metriken
     * @param {Object} botMetrics - Die Metriken des Bots (Verbindungsqualität, Fehler, Leistung usw.)
     * @returns {Object} - Das Stimmungsobjekt mit Emoji, Label usw.
     */
    function determineMood(botMetrics) {
        if (!botMetrics.isOnline) {
            return MOODS.OFFLINE;
        }

        // Verschiedene Faktoren gewichten, um die Stimmung zu bestimmen
        const connectionQuality = botMetrics.connectionQuality || 100; // 0-100
        const errorRate = botMetrics.errorRate || 0; // 0-100
        const performance = botMetrics.performance || 100; // 0-100
        const pingLatency = botMetrics.pingLatency || 0; // in ms

        // Standardwert: NEUTRAL
        if (connectionQuality > 90 && errorRate < 5 && performance > 90 && pingLatency < 100) {
            return MOODS.EXCELLENT;
        } else if (connectionQuality > 80 && errorRate < 10 && performance > 80 && pingLatency < 200) {
            return MOODS.GOOD;
        } else if (connectionQuality > 70 && errorRate < 15 && performance > 70 && pingLatency < 400) {
            return MOODS.NEUTRAL;
        } else if (connectionQuality > 60 && errorRate < 25 && performance > 50 && pingLatency < 600) {
            return MOODS.CONCERNED;
        } else if (connectionQuality > 40 && errorRate < 40 && performance > 30 && pingLatency < 800) {
            return MOODS.TROUBLED;
        } else {
            return MOODS.CRITICAL;
        }
    }

    /**
     * Bestimmt den Leistungsindikator eines Bots
     * @param {Object} botMetrics - Die Metriken des Bots
     * @returns {Object} - Das Leistungsobjekt mit Emoji, Label usw.
     */
    function determinePerformance(botMetrics) {
        if (!botMetrics.isOnline) {
            return null; // Keine Leistung anzeigen, wenn offline
        }

        const performance = botMetrics.performance || 100; // 0-100

        if (performance > 80) {
            return PERFORMANCE.HIGH;
        } else if (performance > 50) {
            return PERFORMANCE.NORMAL;
        } else {
            return PERFORMANCE.LOW;
        }
    }

    /**
     * Bestimmt den Aktivitätsindikator eines Bots
     * @param {Object} botMetrics - Die Metriken des Bots
     * @returns {Object} - Das Aktivitätsobjekt mit Emoji, Label usw.
     */
    function determineActivity(botMetrics) {
        if (!botMetrics.isOnline) {
            return ACTIVITY.IDLE;
        }

        // Bestimme Aktivität basierend auf dem aktuellen Status des Bots
        const activity = botMetrics.activity || 'idle';

        switch (activity.toLowerCase()) {
            case 'exploring':
            case 'explore':
                return ACTIVITY.EXPLORING;
            case 'mining':
            case 'mine':
                return ACTIVITY.MINING;
            case 'fighting':
            case 'fight':
            case 'combat':
                return ACTIVITY.FIGHTING;
            case 'building':
            case 'build':
                return ACTIVITY.BUILDING;
            case 'crafting':
            case 'craft':
                return ACTIVITY.CRAFTING;
            case 'farming':
            case 'farm':
                return ACTIVITY.FARMING;
            case 'fishing':
            case 'fish':
                return ACTIVITY.FISHING;
            case 'traveling':
            case 'travel':
            case 'walking':
            case 'moving':
                return ACTIVITY.TRAVELING;
            case 'idle':
            case 'waiting':
            default:
                return ACTIVITY.IDLE;
        }
    }

    /**
     * Bestimmt den Gesundheitsindikator eines Bots
     * @param {Object} botMetrics - Die Metriken des Bots
     * @returns {Object} - Das Gesundheitsobjekt mit Emoji, Label usw.
     */
    function determineHealth(botMetrics) {
        if (!botMetrics.isOnline) {
            return null; // Keine Gesundheit anzeigen, wenn offline
        }

        const health = botMetrics.health || 100; // 0-100

        if (health > 90) {
            return HEALTH.FULL;
        } else if (health > 70) {
            return HEALTH.HIGH;
        } else if (health > 40) {
            return HEALTH.MEDIUM;
        } else if (health > 15) {
            return HEALTH.LOW;
        } else {
            return HEALTH.CRITICAL;
        }
    }

    /**
     * Erzeugt einen vollständigen Bot-Status mit allen Indikatoren
     * @param {Object} botMetrics - Die Metriken des Bots
     * @returns {Object} - Ein Objekt mit allen Statusindikatoren
     */
    function getBotStatus(botMetrics) {
        return {
            mood: determineMood(botMetrics),
            performance: determinePerformance(botMetrics),
            activity: determineActivity(botMetrics),
            health: determineHealth(botMetrics)
        };
    }

    /**
     * Generiert HTML für einen Bot-Stimmungsindikator
     * @param {Object} botMetrics - Die Metriken des Bots
     * @returns {string} - HTML-String für den Stimmungsindikator
     */
    function generateMoodIndicator(botMetrics) {
        const status = getBotStatus(botMetrics);
        const moodIndicator = status.mood;
        
        return `
            <div class="mood-indicator" title="${moodIndicator.description}" style="color: ${moodIndicator.color}">
                <span class="mood-emoji">${moodIndicator.emoji}</span>
                <span class="mood-label">${moodIndicator.label}</span>
            </div>
        `;
    }

    /**
     * Generiert HTML für alle Bot-Statusindikatoren
     * @param {Object} botMetrics - Die Metriken des Bots
     * @returns {string} - HTML-String für alle Statusindikatoren
     */
    function generateStatusIndicators(botMetrics) {
        const status = getBotStatus(botMetrics);
        let html = '<div class="bot-status-indicators">';

        // Stimmung
        html += `
            <div class="status-indicator mood" title="${status.mood.description}">
                <span class="indicator-emoji" style="color: ${status.mood.color}">${status.mood.emoji}</span>
            </div>
        `;

        // Wenn online, zeige weitere Indikatoren
        if (botMetrics.isOnline) {
            // Leistung
            if (status.performance) {
                html += `
                    <div class="status-indicator performance" title="${status.performance.description}">
                        <span class="indicator-emoji" style="color: ${status.performance.color}">${status.performance.emoji}</span>
                    </div>
                `;
            }

            // Aktivität
            html += `
                <div class="status-indicator activity" title="${status.activity.description}">
                    <span class="indicator-emoji">${status.activity.emoji}</span>
                </div>
            `;

            // Gesundheit
            if (status.health) {
                html += `
                    <div class="status-indicator health" title="${status.health.description}">
                        <span class="indicator-emoji" style="color: ${status.health.color}">${status.health.emoji}</span>
                    </div>
                `;
            }
        }

        html += '</div>';
        return html;
    }

    /**
     * Generiert eine detaillierte Bot-Status-Karte
     * @param {Object} botMetrics - Die Metriken des Bots
     * @returns {string} - HTML-String für eine detaillierte Statuskarte
     */
    function generateDetailedStatusCard(botMetrics) {
        const status = getBotStatus(botMetrics);
        
        let html = `
            <div class="detailed-status-card mc-container">
                <h3 class="mc-pixelated-text">Bot Status</h3>
                <div class="status-grid">
        `;

        // Stimmung
        html += `
            <div class="status-item">
                <div class="status-emoji" style="color: ${status.mood.color}">${status.mood.emoji}</div>
                <div class="status-info">
                    <div class="status-label">Stimmung</div>
                    <div class="status-value">${status.mood.label}</div>
                </div>
            </div>
        `;

        // Wenn online, zeige weitere Indikatoren
        if (botMetrics.isOnline) {
            // Leistung
            if (status.performance) {
                html += `
                    <div class="status-item">
                        <div class="status-emoji" style="color: ${status.performance.color}">${status.performance.emoji}</div>
                        <div class="status-info">
                            <div class="status-label">Leistung</div>
                            <div class="status-value">${status.performance.label}</div>
                        </div>
                    </div>
                `;
            }

            // Aktivität
            html += `
                <div class="status-item">
                    <div class="status-emoji">${status.activity.emoji}</div>
                    <div class="status-info">
                        <div class="status-label">Aktivität</div>
                        <div class="status-value">${status.activity.label}</div>
                    </div>
                </div>
            `;

            // Gesundheit
            if (status.health) {
                html += `
                    <div class="status-item">
                        <div class="status-emoji" style="color: ${status.health.color}">${status.health.emoji}</div>
                        <div class="status-info">
                            <div class="status-label">Gesundheit</div>
                            <div class="status-value">${status.health.label}</div>
                        </div>
                    </div>
                `;
            }

            // Weitere Metriken
            if (botMetrics.performance) {
                html += `
                    <div class="status-item">
                        <div class="status-emoji">📊</div>
                        <div class="status-info">
                            <div class="status-label">Leistungsmetriken</div>
                            <div class="status-value">${botMetrics.performance}%</div>
                        </div>
                    </div>
                `;
            }

            if (botMetrics.pingLatency) {
                html += `
                    <div class="status-item">
                        <div class="status-emoji">📶</div>
                        <div class="status-info">
                            <div class="status-label">Latenz</div>
                            <div class="status-value">${botMetrics.pingLatency}ms</div>
                        </div>
                    </div>
                `;
            }
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Generiert CSS-Stile für die Bot-Stimmungsindikatoren
     * @returns {string} - CSS-Styles als String
     */
    function generateCSS() {
        return `
            .mood-indicator {
                display: flex;
                align-items: center;
                gap: 5px;
                font-weight: bold;
                padding: 5px;
                border-radius: 4px;
                background-color: rgba(0, 0, 0, 0.05);
                margin-bottom: 8px;
            }
            
            .mood-emoji {
                font-size: 1.2em;
            }
            
            .bot-status-indicators {
                display: flex;
                gap: 8px;
                margin-top: 8px;
                flex-wrap: wrap;
            }
            
            .status-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 5px;
                background-color: rgba(0, 0, 0, 0.05);
                border-radius: 50%;
                width: 28px;
                height: 28px;
                cursor: help;
            }
            
            .indicator-emoji {
                font-size: 1.2em;
            }
            
            .detailed-status-card {
                padding: 15px;
                border-radius: 8px;
                background-color: #f9f9f9;
                margin-top: 15px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 12px;
                margin-top: 10px;
            }
            
            .status-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px;
                background-color: rgba(255, 255, 255, 0.8);
                border-radius: 6px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .status-emoji {
                font-size: 1.5em;
            }
            
            .status-info {
                flex: 1;
            }
            
            .status-label {
                font-size: 0.8em;
                color: #666;
            }
            
            .status-value {
                font-weight: bold;
                color: #333;
            }
        `;
    }

    // Öffentliche API
    return {
        determineMood,
        determinePerformance,
        determineActivity,
        determineHealth,
        getBotStatus,
        generateMoodIndicator,
        generateStatusIndicators,
        generateDetailedStatusCard,
        generateCSS,
        // Konstanten auch öffentlich machen für direkten Zugriff
        MOODS,
        PERFORMANCE,
        ACTIVITY,
        HEALTH
    };
})();

// Globale Verfügbarkeit
window.BotMood = BotMood;