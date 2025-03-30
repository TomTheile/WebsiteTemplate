/**
 * Minecraft-thematische Animationen und Übergänge
 * Eine Sammlung von Funktionen zur Erzeugung von Minecraft-inspirierten Lade- und Übergangsanimationen
 */

// Globales Objekt für die Animation
const MCAnimations = {
    /**
     * Zeigt einen Minecraft-Stil Ladebildschirm an
     * @param {string} message - Die Nachricht, die während des Ladens angezeigt wird
     * @param {boolean} showProgress - Ob ein Fortschrittsbalken angezeigt werden soll
     * @returns {Object} - Ein Objekt mit einer close() Methode, um den Ladebildschirm zu schließen
     */
    showLoadingScreen: function(message = 'Laden...', showProgress = true) {
        // Overlay erstellen
        const overlay = document.createElement('div');
        overlay.className = 'mc-loading-overlay';
        
        // Container für den Ladeindikator
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        
        // Spitzhacken-Animation hinzufügen
        const pickaxe = document.createElement('div');
        pickaxe.className = 'mc-loading-pickaxe';
        container.appendChild(pickaxe);
        
        // Textnachricht hinzufügen
        const text = document.createElement('div');
        text.className = 'mc-loading-text';
        text.textContent = message;
        container.appendChild(text);
        
        // Optional: Fortschrittsbalken hinzufügen
        let progressBar = null;
        let progressContainer = null;
        
        if (showProgress) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'mc-loading-bar-container';
            
            progressBar = document.createElement('div');
            progressBar.className = 'mc-loading-bar';
            
            progressContainer.appendChild(progressBar);
            container.appendChild(progressContainer);
        }
        
        // Alles zum Overlay hinzufügen
        overlay.appendChild(container);
        
        // Zum Dokument hinzufügen
        document.body.appendChild(overlay);
        
        // Der Rückgabe-Controller
        return {
            /**
             * Aktualisiert die Ladebildschirm-Nachricht
             * @param {string} newMessage - Die neue Nachricht
             */
            updateMessage: function(newMessage) {
                text.textContent = newMessage;
            },
            
            /**
             * Aktualisiert den Fortschrittsbalken (wenn aktiviert)
             * @param {number} percent - Der Prozentsatz des Fortschritts (0-100)
             */
            updateProgress: function(percent) {
                if (progressBar) {
                    progressBar.style.width = `${percent}%`;
                    
                    // Farbe basierend auf Fortschritt ändern
                    if (percent < 30) {
                        progressBar.style.backgroundColor = '#55FF55'; // Grün
                    } else if (percent < 70) {
                        progressBar.style.backgroundColor = '#FFFF55'; // Gelb
                    } else {
                        progressBar.style.backgroundColor = '#FF5555'; // Rot
                    }
                }
            },
            
            /**
             * Schließt den Ladebildschirm
             * @param {function} callback - Optionale Callback-Funktion nach Abschluss
             */
            close: function(callback) {
                overlay.style.animation = 'pixel-fade-out 0.5s forwards';
                
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }, 500);
            }
        };
    },
    
    /**
     * Wendet die Block-Breaking-Animation auf ein Element an
     * @param {HTMLElement} element - Das Element, auf das die Animation angewendet werden soll
     * @param {function} callback - Callback-Funktion nach Abschluss
     * @param {number} duration - Dauer der Animation in Millisekunden
     */
    applyBlockBreaking: function(element, callback, duration = 1500) {
        element.classList.add('mc-loading-bg');
        
        setTimeout(() => {
            element.classList.remove('mc-loading-bg');
            if (callback && typeof callback === 'function') {
                callback();
            }
        }, duration);
    },
    
    /**
     * Lässt ein Element mit einer Minecraft-ähnlichen Animation einblenden
     * @param {HTMLElement} element - Das einzublendende Element
     * @param {function} callback - Callback-Funktion nach Abschluss
     */
    fadeInElement: function(element, callback) {
        // Sicherstellen, dass das Element vorher unsichtbar ist
        element.style.opacity = '0';
        element.style.display = 'block';
        
        // Animation anwenden
        element.classList.add('mc-fade-in');
        
        // Event-Listener für das Ende der Animation
        element.addEventListener('animationend', function handler() {
            element.removeEventListener('animationend', handler);
            element.classList.remove('mc-fade-in');
            element.style.opacity = '1';
            
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    },
    
    /**
     * Lässt ein Element mit einer Minecraft-ähnlichen Animation ausblenden
     * @param {HTMLElement} element - Das auszublendende Element
     * @param {function} callback - Callback-Funktion nach Abschluss
     */
    fadeOutElement: function(element, callback) {
        // Animation anwenden
        element.classList.add('mc-fade-out');
        
        // Event-Listener für das Ende der Animation
        element.addEventListener('animationend', function handler() {
            element.removeEventListener('animationend', handler);
            element.style.display = 'none';
            element.classList.remove('mc-fade-out');
            
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    },
    
    /**
     * Erzeugt eine "Container öffnen" Animation für ein Element
     * @param {HTMLElement} element - Das zu animierende Element (Container)
     */
    openContainer: function(element) {
        element.classList.add('mc-container');
        
        // Kurze Verzögerung, damit die CSS-Änderung wirksam wird
        setTimeout(() => {
            element.classList.add('active');
        }, 50);
        
        // Event-Listener für das Ende der Animation
        element.addEventListener('animationend', function handler() {
            element.removeEventListener('animationend', handler);
            element.classList.remove('mc-container');
        });
    },
    
    /**
     * Erzeugt eine Bounce-Animation für ein Element
     * @param {HTMLElement} element - Das zu animierende Element
     * @param {number} duration - Dauer der Animation in Millisekunden
     */
    bounceElement: function(element, duration = 1000) {
        element.classList.add('mc-bounce');
        
        setTimeout(() => {
            element.classList.remove('mc-bounce');
        }, duration);
    },
    
    /**
     * Erstellt ein Minecraft-Stil Gitterelement-Menü
     * @param {HTMLElement} container - Der Container für das Gitterelement
     * @param {Array} items - Array von Objekten mit icon, text, und onClick Eigenschaften
     */
    createGridMenu: function(container, items) {
        // Menü-Container erstellen
        const gridMenu = document.createElement('div');
        gridMenu.className = 'mc-grid-menu';
        
        // Items hinzufügen
        items.forEach((item, index) => {
            const gridItem = document.createElement('div');
            gridItem.className = 'mc-grid-item';
            
            // Icon (falls vorhanden)
            if (item.icon) {
                const icon = document.createElement('div');
                icon.className = 'mc-grid-icon';
                icon.innerHTML = item.icon;
                gridItem.appendChild(icon);
            }
            
            // Text (falls vorhanden)
            if (item.text) {
                const text = document.createElement('div');
                text.className = 'mc-grid-text mc-pixelated-text';
                text.textContent = item.text;
                gridItem.appendChild(text);
            }
            
            // Click-Handler (falls vorhanden)
            if (item.onClick && typeof item.onClick === 'function') {
                gridItem.addEventListener('click', item.onClick);
            }
            
            // Zum Grid hinzufügen
            gridMenu.appendChild(gridItem);
            
            // Animation mit Verzögerung basierend auf Index starten
            setTimeout(() => {
                gridItem.classList.add('active');
            }, 100 * index);
        });
        
        // Zum Container hinzufügen
        container.appendChild(gridMenu);
    },
    
    /**
     * Erzeugt einen Text mit "Schreib"-Effekt wie in Minecraft-Dialogen
     * @param {HTMLElement} element - Das Textelement
     * @param {string} text - Der anzuzeigende Text
     * @param {number} speed - Geschwindigkeit in Millisekunden pro Zeichen
     * @param {function} callback - Callback-Funktion nach Abschluss
     */
    typeText: function(element, text, speed = 50, callback) {
        element.classList.add('mc-pixelated-text');
        element.textContent = '';
        
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        }, speed);
    },
    
    /**
     * Fügt einen Rotationseffekt zu einem Element hinzu
     * @param {HTMLElement} element - Das zu rotierende Element
     * @param {boolean} permanent - Ob die Rotation dauerhaft sein soll
     * @param {number} duration - Dauer der Animation in Millisekunden (wenn nicht permanent)
     */
    rotateElement: function(element, permanent = false, duration = 3000) {
        element.classList.add('mc-rotate');
        
        if (!permanent) {
            setTimeout(() => {
                element.classList.remove('mc-rotate');
            }, duration);
        }
    },
    
    /**
     * Fügt einen explosionsartigen Effekt zu einem Element hinzu
     * @param {HTMLElement} element - Das Element für den Explosionseffekt
     * @param {boolean} removeAfter - Ob das Element nach der Animation entfernt werden soll
     */
    explodeElement: function(element, removeAfter = false) {
        element.classList.add('mc-explode');
        
        element.addEventListener('animationend', function handler() {
            element.removeEventListener('animationend', handler);
            
            if (removeAfter) {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            } else {
                element.classList.remove('mc-explode');
            }
        });
    }
};

// Das Animations-Objekt global verfügbar machen
window.MCAnimations = MCAnimations;