/**
 * Bot-Animations.js
 * Dieses Modul bietet Retro-inspirierte Statusübergangsanimationen für die Bot-Karten.
 * Es verwendet CSS-Animationen und JavaScript für pixelige, retro-inspirierte Effekte.
 */

const BotAnimations = (function() {
    // Cache für den letzten Status, um Übergänge zu ermöglichen
    const statusCache = {};
    
    /**
     * Definierte Animationstypen für verschiedene Statuswechsel
     */
    const ANIMATIONS = {
        // Startup-Animation (offline -> online)
        BOOT_UP: {
            name: 'boot-up',
            duration: 1500, // Millisekunden
            cssClass: 'bot-booting',
            pixelatedTransition: true,
            soundEffect: 'startup'
        },
        // Shutdown-Animation (online -> offline)
        SHUTDOWN: {
            name: 'shutdown',
            duration: 1200,
            cssClass: 'bot-shutdown',
            pixelatedTransition: true,
            soundEffect: 'shutdown'
        },
        // Statusverbesserung (z.B. concerned -> good)
        IMPROVE: {
            name: 'status-improve',
            duration: 800,
            cssClass: 'status-improving',
            particles: true,
            soundEffect: 'powerup'
        },
        // Statusverschlechterung (z.B. good -> concerned)
        DECLINE: {
            name: 'status-decline',
            duration: 800,
            cssClass: 'status-declining',
            glitchEffect: true,
            soundEffect: 'alert'
        },
        // Normaler Übergang
        DEFAULT: {
            name: 'transition',
            duration: 400,
            cssClass: 'status-transition',
            fadeEffect: true
        }
    };
    
    /**
     * Retro-Soundeffekte (8-bit inspiriert)
     */
    const SOUND_EFFECTS = {
        startup: [
            { frequency: 220, duration: 100, type: 'square' },
            { frequency: 330, duration: 100, type: 'square' },
            { frequency: 440, duration: 150, type: 'square' },
            { frequency: 880, duration: 300, type: 'square' }
        ],
        shutdown: [
            { frequency: 880, duration: 100, type: 'square' },
            { frequency: 440, duration: 100, type: 'square' },
            { frequency: 330, duration: 150, type: 'square' },
            { frequency: 220, duration: 300, type: 'square' }
        ],
        powerup: [
            { frequency: 440, duration: 100, type: 'square' },
            { frequency: 660, duration: 150, type: 'square' }
        ],
        alert: [
            { frequency: 880, duration: 100, type: 'sawtooth' },
            { frequency: 880, duration: 100, type: 'sawtooth', delay: 150 }
        ]
    };
    
    /**
     * Spielt einen 8-bit Soundeffekt ab
     * @param {string} effectName - Name des Effekts
     * @param {number} volume - Lautstärke (0-1)
     */
    function playRetroSound(effectName, volume = 0.2) {
        if (!SOUND_EFFECTS[effectName]) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const notes = SOUND_EFFECTS[effectName];
            
            notes.forEach(note => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.type = note.type || 'square';
                    oscillator.frequency.setValueAtTime(note.frequency, audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (note.duration / 1000));
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + (note.duration / 1000));
                }, note.delay || 0);
            });
        } catch (e) {
            console.log('Sound nicht verfügbar:', e.message);
        }
    }
    
    /**
     * Erzeugt ein pixeliges Übergangselement
     * @param {HTMLElement} element - Das zu animierende Element
     * @param {number} pixelSize - Größe der "Pixel" (default: 4)
     * @returns {HTMLElement} - Das erzeugte Übergangselement
     */
    function createPixelatedTransition(element, pixelSize = 4) {
        const rect = element.getBoundingClientRect();
        const overlay = document.createElement('div');
        
        overlay.className = 'pixelated-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '100';
        overlay.style.overflow = 'hidden';
        
        const pixelsX = Math.ceil(rect.width / pixelSize);
        const pixelsY = Math.ceil(rect.height / pixelSize);
        
        // Pixelraster erstellen
        for (let y = 0; y < pixelsY; y++) {
            for (let x = 0; x < pixelsX; x++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                pixel.style.position = 'absolute';
                pixel.style.width = `${pixelSize}px`;
                pixel.style.height = `${pixelSize}px`;
                pixel.style.top = `${y * pixelSize}px`;
                pixel.style.left = `${x * pixelSize}px`;
                pixel.style.backgroundColor = getComputedStyle(element).backgroundColor;
                pixel.style.opacity = '0';
                pixel.style.transform = 'scale(0)';
                
                // Verzögerung für jeden Pixel zufällig setzen
                const delay = Math.random() * 0.5;
                pixel.style.transition = `all 0.3s ease ${delay}s`;
                
                overlay.appendChild(pixel);
            }
        }
        
        element.style.position = 'relative';
        element.appendChild(overlay);
        
        // "Pixeligen" Effekt anwenden
        setTimeout(() => {
            const pixels = overlay.querySelectorAll('.pixel');
            pixels.forEach(pixel => {
                pixel.style.opacity = '1';
                pixel.style.transform = 'scale(1)';
            });
        }, 50);
        
        return overlay;
    }
    
    /**
     * Entfernt einen pixeligen Übergangseffekt
     * @param {HTMLElement} overlay - Das Übergangselement
     */
    function removePixelatedTransition(overlay) {
        const pixels = overlay.querySelectorAll('.pixel');
        
        pixels.forEach(pixel => {
            // Den Pixel mit Verzögerung entfernen
            const delay = Math.random() * 0.5;
            pixel.style.transition = `all 0.3s ease ${delay}s`;
            pixel.style.opacity = '0';
            pixel.style.transform = 'scale(0)';
        });
        
        // Nach der Animation das Overlay entfernen
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 800);
    }
    
    /**
     * Erzeugt einen Glitch-Effekt auf einem Element
     * @param {HTMLElement} element - Das zu "glitchende" Element
     * @param {number} duration - Dauer des Effekts in ms
     */
    function createGlitchEffect(element, duration = 800) {
        element.classList.add('bot-glitch-effect');
        
        // Zufällige Glitch-Animationen
        const glitchInterval = setInterval(() => {
            // Horizontaler Versatz
            const offsetX = (Math.random() * 10) - 5;
            // RGB-Versatz
            const rgbOffset = Math.floor(Math.random() * 10);
            
            element.style.setProperty('--glitch-offset-x', `${offsetX}px`);
            element.style.setProperty('--glitch-rgb-offset', `${rgbOffset}px`);
            
            // Ein kurzes Flackern
            if (Math.random() > 0.7) {
                element.style.opacity = Math.random() * 0.3 + 0.7;
                setTimeout(() => {
                    element.style.opacity = 1;
                }, 50);
            }
        }, 100);
        
        // Glitch-Effekt nach der Dauer entfernen
        setTimeout(() => {
            clearInterval(glitchInterval);
            element.classList.remove('bot-glitch-effect');
            element.style.transform = '';
            element.style.opacity = 1;
        }, duration);
    }
    
    /**
     * Erzeugt einen Partikeleffekt für positive Statusänderungen
     * @param {HTMLElement} element - Das Element, an dem die Partikel angezeigt werden
     * @param {number} particleCount - Anzahl der Partikel
     */
    function createParticleEffect(element, particleCount = 20) {
        const rect = element.getBoundingClientRect();
        const colors = ['#1eff00', '#8bff4a', '#ffd84a', '#ffb74a'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'status-particle';
            
            // Partikel-Stil
            particle.style.position = 'absolute';
            particle.style.width = `${Math.random() * 6 + 2}px`;
            particle.style.height = particle.style.width;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '2px';
            
            // Startposition (innerhalb des Elements)
            const startX = Math.random() * rect.width;
            const startY = Math.random() * rect.height;
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            // Animation
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 50;
            const duration = 700 + Math.random() * 500;
            
            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
            });
            
            element.appendChild(particle);
            
            // Partikel nach Animation entfernen
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, duration);
        }
    }
    
    /**
     * Bestimmt den Animationstyp basierend auf dem Statuswechsel
     * @param {Object} oldStatus - Der alte Status
     * @param {Object} newStatus - Der neue Status
     * @returns {Object} - Das passende Animationsobjekt
     */
    function determineAnimationType(oldStatus, newStatus) {
        // Wenn kein vorheriger Status vorhanden ist, verwende Standard
        if (!oldStatus) return ANIMATIONS.DEFAULT;
        
        // Offline -> Online (Boot)
        if (!oldStatus.isOnline && newStatus.isOnline) {
            return ANIMATIONS.BOOT_UP;
        }
        
        // Online -> Offline (Shutdown)
        if (oldStatus.isOnline && !newStatus.isOnline) {
            return ANIMATIONS.SHUTDOWN;
        }
        
        // Statusverbesserung
        if (oldStatus.performance < newStatus.performance || 
            (oldStatus.mood && newStatus.mood && oldStatus.mood.value < newStatus.mood.value)) {
            return ANIMATIONS.IMPROVE;
        }
        
        // Statusverschlechterung
        if (oldStatus.performance > newStatus.performance || 
            (oldStatus.mood && newStatus.mood && oldStatus.mood.value > newStatus.mood.value)) {
            return ANIMATIONS.DECLINE;
        }
        
        // Standard-Übergang für alle anderen Fälle
        return ANIMATIONS.DEFAULT;
    }
    
    /**
     * Führt eine animierte Statusübergangsanimation durch
     * @param {string} botId - ID des Bots
     * @param {HTMLElement} element - Das zu animierende Element
     * @param {Object} newStatus - Die neuen Status-Metriken des Bots
     */
    function animateStatusTransition(botId, element, newStatus) {
        // Sicherstellen, dass der Status initialisiert ist
        if (!statusCache[botId]) {
            statusCache[botId] = { ...newStatus };
            return; // Beim ersten Mal keine Animation
        }
        
        const oldStatus = statusCache[botId];
        const animationType = determineAnimationType(oldStatus, newStatus);
        
        // Status im Cache aktualisieren
        statusCache[botId] = { ...newStatus };
        
        // Basis-Animations-CSS-Klasse hinzufügen
        element.classList.add(animationType.cssClass);
        
        // Soundeffekt abspielen (falls vorhanden)
        if (animationType.soundEffect) {
            playRetroSound(animationType.soundEffect);
        }
        
        // Spezifische Effekte basierend auf Animationstyp
        if (animationType.pixelatedTransition) {
            const overlay = createPixelatedTransition(element);
            setTimeout(() => {
                removePixelatedTransition(overlay);
            }, animationType.duration);
        }
        
        if (animationType.glitchEffect) {
            createGlitchEffect(element, animationType.duration);
        }
        
        if (animationType.particles) {
            createParticleEffect(element);
        }
        
        // Animations-CSS-Klasse nach Animation entfernen
        setTimeout(() => {
            element.classList.remove(animationType.cssClass);
        }, animationType.duration);
    }
    
    /**
     * Aktualisiert den Bot-Status mit Animation
     * @param {string} botId - ID des Bots
     * @param {HTMLElement} element - Das Element, das aktualisiert werden soll
     * @param {Object} botMetrics - Die Metriken des Bots
     * @param {Function} updateFn - Funktion, die das Element aktualisiert
     */
    function updateBotStatusWithAnimation(botId, element, botMetrics, updateFn) {
        // Animation starten
        animateStatusTransition(botId, element, botMetrics);
        
        // Inhalt nach kurzer Verzögerung aktualisieren, um Zeit für Animation zu lassen
        setTimeout(() => {
            updateFn(element, botMetrics);
        }, 300);
    }
    
    /**
     * Generiert die CSS-Stile für die Animationen
     * @returns {string} - CSS-Styles als String
     */
    function generateCSS() {
        return `
            /* Basis-Animationsstile */
            .bot-card, .detailed-status-card {
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            /* Boot-Animation */
            @keyframes bootup-scanline {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }
            
            .bot-booting::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 5px;
                background: linear-gradient(to right, transparent, #1eff00, transparent);
                opacity: 0.7;
                z-index: 100;
                animation: bootup-scanline 1.5s ease-out;
            }
            
            .bot-booting {
                animation: flicker 0.8s ease-in-out;
            }
            
            @keyframes flicker {
                0% { opacity: 0.3; }
                10% { opacity: 0.8; }
                20% { opacity: 0.2; }
                30% { opacity: 0.7; }
                40% { opacity: 0.3; }
                50% { opacity: 1; }
                60% { opacity: 0.6; }
                100% { opacity: 1; }
            }
            
            /* Shutdown-Animation */
            @keyframes shutdown {
                0% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(0.99); filter: brightness(0.8); }
                100% { transform: scale(0.95); filter: brightness(0.3); }
            }
            
            .bot-shutdown {
                animation: shutdown 1.2s ease-in;
            }
            
            /* Glitch-Effekt */
            @keyframes glitch-anim {
                0% {
                    clip-path: inset(40% 0 61% 0);
                    transform: translate(var(--glitch-offset-x), -2px);
                }
                20% {
                    clip-path: inset(92% 0 1% 0);
                    transform: translate(var(--glitch-offset-x), 2px);
                }
                40% {
                    clip-path: inset(43% 0 1% 0);
                    transform: translate(var(--glitch-offset-x), -1px);
                }
                60% {
                    clip-path: inset(25% 0 58% 0);
                    transform: translate(var(--glitch-offset-x), 1px);
                }
                80% {
                    clip-path: inset(54% 0 7% 0);
                    transform: translate(var(--glitch-offset-x), -3px);
                }
                100% {
                    clip-path: inset(58% 0 43% 0);
                    transform: translate(var(--glitch-offset-x), 2px);
                }
            }
            
            .bot-glitch-effect::before,
            .bot-glitch-effect::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: inherit;
                z-index: -1;
            }
            
            .bot-glitch-effect::before {
                animation: glitch-anim 0.3s infinite;
                text-shadow: -2px 0 #ff0000;
                left: var(--glitch-rgb-offset);
            }
            
            .bot-glitch-effect::after {
                animation: glitch-anim 0.5s infinite;
                text-shadow: 2px 0 #0000ff;
                left: calc(var(--glitch-rgb-offset) * -1);
            }
            
            /* Status-Verbesserung Animation */
            @keyframes status-improve {
                0% { transform: scale(0.95); filter: brightness(1); }
                50% { transform: scale(1.02); filter: brightness(1.2); }
                100% { transform: scale(1); filter: brightness(1); }
            }
            
            .status-improving {
                animation: status-improve 0.8s ease-out;
            }
            
            /* Status-Verschlechterung Animation */
            @keyframes status-decline {
                0% { transform: rotate(0); }
                25% { transform: rotate(-0.5deg); }
                50% { transform: rotate(0.5deg); }
                75% { transform: rotate(-0.5deg); }
                100% { transform: rotate(0); }
            }
            
            .status-declining {
                animation: status-decline 0.5s ease;
            }
            
            /* Partikelstile */
            .status-particle {
                position: absolute;
                z-index: 101;
                pointer-events: none;
            }
            
            /* Allgemeiner Statusübergang */
            @keyframes status-transition {
                0% { transform: scale(0.98); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .status-transition {
                animation: status-transition 0.4s ease;
            }
        `;
    }
    
    /**
     * Initialisiert die Animation für alle Bot-Karten auf der Seite
     */
    function initializeAnimations() {
        // CSS zur Seite hinzufügen
        const styleElement = document.createElement('style');
        styleElement.textContent = generateCSS();
        document.head.appendChild(styleElement);
        
        console.log('Bot-Animationen initialisiert');
    }
    
    // Öffentliche API
    return {
        updateBotStatusWithAnimation,
        animateStatusTransition,
        playRetroSound,
        createGlitchEffect,
        createParticleEffect,
        initializeAnimations,
        ANIMATIONS,
        generateCSS
    };
})();

// Automatisch initialisieren, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    BotAnimations.initializeAnimations();
});

// Globale Verfügbarkeit
window.BotAnimations = BotAnimations;