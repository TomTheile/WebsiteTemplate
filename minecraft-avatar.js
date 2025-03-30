/**
 * Minecraft-Avatar.js
 * Diese Datei enthält Funktionen zum Generieren und Anzeigen von Minecraft-Charakteravataren für Bots.
 * Sie nutzt die Minecraft-Avatar-API, um Avatare basierend auf Benutzernamen oder Skin-Typ zu rendern.
 */

const MinecraftAvatar = (function() {
    // Cache für bereits geladene Avatare
    const avatarCache = {};

    // Unterstützte Skin-Typen
    const SKIN_TYPES = ['steve', 'alex', 'zombie', 'skeleton', 'creeper', 'enderman', 'pig', 'blaze'];
    
    // Unterstützte Ansichten
    const VIEWS = ['face', 'head', 'bust', 'full', 'skin'];

    /**
     * Generiert die URL für einen Avatar
     * @param {Object} options - Optionen für den Avatar
     * @param {string} options.username - Minecraft-Benutzername (oder undefiniert für Standardskins)
     * @param {string} options.skinType - Typ des Skins (wenn kein Benutzername angegeben)
     * @param {string} options.view - Ansichtstyp (face, head, bust, full oder skin)
     * @param {number} options.size - Größe des Avatars in Pixeln
     * @param {string} options.background - Hintergrundtyp
     * @returns {string} - Die generierte URL
     */
    function generateAvatarUrl(options) {
        const defaultOptions = {
            username: '',
            skinType: 'steve',
            view: 'head',
            size: 100,
            background: ''
        };
        
        // Optionen mit Standardwerten kombinieren
        const settings = {...defaultOptions, ...options};
        
        // Basis-URL für die API
        let url;
        
        if (settings.username) {
            // Avatar basierend auf Benutzernamen
            url = `https://mc-heads.net/avatar/${settings.username}/${settings.size}`;
            
            // Ansichtstyp hinzufügen
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
            // Avatar basierend auf Skin-Typ
            const skinType = SKIN_TYPES.includes(settings.skinType) ? settings.skinType : 'steve';
            
            // Standardskin-URLs basierend auf Skin-Typ und Ansicht
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
        
        // Hintergrund hinzufügen, wenn angegeben
        if (settings.background && settings.view !== 'skin') {
            url += `/${settings.background}`;
        }
        
        return url;
    }

    /**
     * Lädt einen Avatar und speichert ihn im Cache
     * @param {Object} options - Avatar-Optionen
     * @returns {Promise<string>} - URL des Avatars
     */
    function loadAvatar(options) {
        const cacheKey = JSON.stringify(options);
        
        // Wenn der Avatar bereits im Cache ist, direkt zurückgeben
        if (avatarCache[cacheKey]) {
            return Promise.resolve(avatarCache[cacheKey]);
        }
        
        // Ansonsten URL generieren und cachen
        const url = generateAvatarUrl(options);
        avatarCache[cacheKey] = url;
        
        return Promise.resolve(url);
    }

    /**
     * Generiert ein HTML-Element mit einem Avatar
     * @param {Element} container - Das HTML-Element, in das der Avatar eingefügt werden soll
     * @param {Object} options - Avatar-Optionen
     * @returns {Promise<Element>} - Das erzeugte oder aktualisierte Element
     */
    function createAvatarElement(container, options) {
        if (!container) return Promise.reject(new Error('Container-Element fehlt'));
        
        return loadAvatar(options)
            .then(url => {
                // Container leeren
                container.innerHTML = '';
                
                // Avatar-Bild erstellen
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Minecraft Avatar';
                img.style.width = options.size + 'px';
                img.style.height = options.size + 'px';
                img.style.objectFit = 'contain';
                
                // Alle Optionen als Datensätze speichern für späteren Zugriff
                Object.keys(options).forEach(key => {
                    img.dataset[key] = options[key];
                });
                
                // Zum Container hinzufügen
                container.appendChild(img);
                return container;
            });
    }

    /**
     * Erzeugt einen Avatar-Auswahl-Dialog
     * @param {Function} onSelect - Callback, wenn ein Avatar ausgewählt wurde
     * @returns {Element} - Das Dialog-Element
     */
    function createAvatarSelector(onSelect) {
        // Dialog-Container erstellen
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.style.display = 'block';
        
        // Dialog-Inhalt erstellen
        dialog.innerHTML = `
            <div class="modal-content mc-container" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Avatar auswählen</h3>
                    <button class="close-modal">×</button>
                </div>
                <div style="padding: 20px;">
                    <div style="margin-bottom: 20px;">
                        <label for="avatar-username" style="display: block; margin-bottom: 5px;">Minecraft-Benutzername:</label>
                        <input type="text" id="avatar-username" placeholder="Optional: Benutzername eingeben" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.2); border: 1px solid #444; color: #fff; border-radius: 4px;">
                        <p style="font-size: 12px; color: #aaa; margin-top: 5px;">Wenn du keinen Benutzernamen eingibst, wird ein Standard-Skin verwendet.</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px;">Skin-Typ:</label>
                        <div id="skin-type-selector" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; margin-top: 10px;">
                            ${SKIN_TYPES.map(type => `
                                <div class="skin-option" data-skin-type="${type}" style="text-align: center; cursor: pointer; padding: 5px; border-radius: 4px; border: 2px solid transparent;">
                                    <div class="avatar-preview" data-skin-type="${type}" style="width: 40px; height: 40px; margin: 0 auto;"></div>
                                    <div style="font-size: 12px; margin-top: 5px;">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px;">Ansicht:</label>
                        <div id="view-selector" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-top: 10px;">
                            ${VIEWS.map(view => `
                                <div class="view-option" data-view="${view}" style="text-align: center; cursor: pointer; padding: 5px; border-radius: 4px; border: 2px solid transparent;">
                                    <div style="font-size: 12px; margin-top: 5px;">${view.charAt(0).toUpperCase() + view.slice(1)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px;">Vorschau:</label>
                        <div style="display: flex; justify-content: center; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                            <div id="avatar-preview" style="width: 100px; height: 100px;"></div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="select-avatar-btn" class="action-btn">Avatar übernehmen</button>
                    </div>
                </div>
            </div>
        `;
        
        // Dialog hinzufügen und Animation anwenden
        const modalContent = dialog.querySelector('.modal-content');
        setTimeout(() => {
            if (typeof MCAnimations !== 'undefined' && MCAnimations.openContainer) {
                MCAnimations.openContainer(modalContent);
            }
        }, 10);
        
        // Currentt
        let currentOptions = {
            skinType: 'steve',
            view: 'head',
            size: 100,
            background: ''
        };
        
        // Event listeners hinzufügen, nachdem der Dialog zum DOM hinzugefügt wurde
        setTimeout(() => {
            // Schließen-Button
            const closeBtn = dialog.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => {
                dialog.remove();
            });
            
            // Avatar-Vorschau initialisieren
            const previewContainer = dialog.querySelector('#avatar-preview');
            updatePreview();
            
            // Skin-Optionen initialisieren
            const skinOptions = dialog.querySelectorAll('.skin-option');
            skinOptions.forEach(option => {
                const skinType = option.dataset.skinType;
                const previewContainer = option.querySelector('.avatar-preview');
                
                // Avatar für jede Option erstellen
                createAvatarElement(previewContainer, {
                    skinType: skinType,
                    view: 'head',
                    size: 40
                });
                
                // Klick-Event
                option.addEventListener('click', () => {
                    // Aktive Markierung bei allen entfernen
                    skinOptions.forEach(opt => opt.style.borderColor = 'transparent');
                    // Aktive Markierung hinzufügen
                    option.style.borderColor = '#1eff00';
                    
                    // Option aktualisieren
                    currentOptions.skinType = skinType;
                    // Username löschen, da jetzt ein Skin-Typ ausgewählt ist
                    const usernameInput = dialog.querySelector('#avatar-username');
                    usernameInput.value = '';
                    currentOptions.username = '';
                    
                    // Vorschau aktualisieren
                    updatePreview();
                });
                
                // Standard-Skin markieren
                if (skinType === currentOptions.skinType) {
                    option.style.borderColor = '#1eff00';
                }
            });
            
            // Ansichts-Optionen initialisieren
            const viewOptions = dialog.querySelectorAll('.view-option');
            viewOptions.forEach(option => {
                const view = option.dataset.view;
                
                // Klick-Event
                option.addEventListener('click', () => {
                    // Aktive Markierung bei allen entfernen
                    viewOptions.forEach(opt => opt.style.borderColor = 'transparent');
                    // Aktive Markierung hinzufügen
                    option.style.borderColor = '#1eff00';
                    
                    // Option aktualisieren
                    currentOptions.view = view;
                    
                    // Vorschau aktualisieren
                    updatePreview();
                });
                
                // Standard-Ansicht markieren
                if (view === currentOptions.view) {
                    option.style.borderColor = '#1eff00';
                }
            });
            
            // Benutzername-Input
            const usernameInput = dialog.querySelector('#avatar-username');
            usernameInput.addEventListener('input', () => {
                const username = usernameInput.value.trim();
                currentOptions.username = username;
                
                // Wenn ein Benutzername eingegeben wird, Skin-Typ deaktivieren
                if (username) {
                    skinOptions.forEach(opt => opt.style.borderColor = 'transparent');
                    currentOptions.skinType = '';
                } else {
                    // Wenn leer, Standard-Skin auswählen
                    const defaultSkin = dialog.querySelector(`.skin-option[data-skin-type="steve"]`);
                    defaultSkin.style.borderColor = '#1eff00';
                    currentOptions.skinType = 'steve';
                }
                
                // Vorschau aktualisieren
                updatePreview();
            });
            
            // Auswahl-Button
            const selectBtn = dialog.querySelector('#select-avatar-btn');
            selectBtn.addEventListener('click', () => {
                // Callback aufrufen und Dialog schließen
                if (onSelect) {
                    onSelect({...currentOptions});
                }
                dialog.remove();
            });
            
            // Funktion zur Aktualisierung der Vorschau
            function updatePreview() {
                createAvatarElement(previewContainer, {
                    ...currentOptions,
                    size: 100
                });
            }
            
        }, 100);
        
        return dialog;
    }

    /**
     * Generiert CSS für Avatar-Komponenten
     * @returns {string} CSS als String
     */
    function generateCSS() {
        return `
            .avatar-selector {
                padding: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                border-radius: 8px;
                border: 1px solid #333;
            }
            
            .avatar-preview {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .skin-option:hover, .view-option:hover {
                background: rgba(30, 255, 0, 0.1);
            }
        `;
    }

    // CSS zum Dokument hinzufügen
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = generateCSS();
        document.head.appendChild(style);
    }

    // CSS beim Laden der Seite einfügen
    injectCSS();

    // Öffentliche API
    return {
        generateAvatarUrl,
        loadAvatar,
        createAvatarElement,
        createAvatarSelector
    };
})();