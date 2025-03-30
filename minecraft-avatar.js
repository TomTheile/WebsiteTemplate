/**
 * Minecraft-Avatar.js
 * Diese Datei enthält Funktionen zum Generieren und Anzeigen von Minecraft-Charakteravataren für Bots.
 * Sie nutzt die Minecraft-Avatar-API, um Avatare basierend auf Benutzernamen oder Skin-Typ zu rendern.
 */

const MinecraftAvatar = (function() {
    // Verfügbare Skin-Typen
    const availableSkinTypes = [
        'steve', 'alex', 'zombie', 'villager', 'skeleton', 'creeper', 'enderman'
    ];
    
    // Verfügbare Ansichten
    const viewTypes = {
        FACE: 'face',        // Nur Gesicht
        HEAD: 'head',        // Kopf (mit Hut falls vorhanden)
        BUST: 'bust',        // Oberkörper
        FULL: 'full',        // Ganzer Körper
        SKIN: 'skin'         // Flachen Skin anzeigen
    };
    
    // Verfügbare Hintergründe
    const backgroundTypes = {
        TRANSPARENT: '',
        GRASS: 'grass',
        STONE: 'stone',
        DIRT: 'dirt',
        WOOD: 'wood',
        NETHERRACK: 'netherrack',
        WOOL: 'wool'
    };
    
    // Cache für die generierten Avatare
    const avatarCache = {};
    
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
        const defaults = {
            username: undefined,
            skinType: 'steve',
            view: viewTypes.HEAD,
            size: 100,
            background: backgroundTypes.TRANSPARENT
        };
        
        const settings = { ...defaults, ...options };
        
        // Basis-URL für die Avatar-API
        let baseUrl = 'https://mc-heads.net/avatar/';
        
        // Entweder Benutzernamen oder Skin-Typ verwenden
        if (settings.username) {
            baseUrl += encodeURIComponent(settings.username);
        } else {
            // Für Standard-Skins (ohne Benutzernamen) verwenden wir bekannte Benutzernamen
            // die das gewünschte Aussehen haben
            switch(settings.skinType) {
                case 'alex':
                    baseUrl += 'MHF_Alex';
                    break;
                case 'zombie':
                    baseUrl += 'MHF_Zombie';
                    break;
                case 'villager':
                    baseUrl += 'MHF_Villager';
                    break;
                case 'skeleton':
                    baseUrl += 'MHF_Skeleton';
                    break;
                case 'creeper':
                    baseUrl += 'MHF_Creeper';
                    break;
                case 'enderman':
                    baseUrl += 'MHF_Enderman';
                    break;
                case 'steve':
                default:
                    baseUrl += 'MHF_Steve';
                    break;
            }
        }
        
        // Ansichtstyp festlegen
        if (settings.view === viewTypes.FULL) {
            baseUrl = baseUrl.replace('/avatar/', '/body/');
        } else if (settings.view === viewTypes.BUST) {
            baseUrl = baseUrl.replace('/avatar/', '/bust/');
        } else if (settings.view === viewTypes.SKIN) {
            baseUrl = baseUrl.replace('/avatar/', '/skin/');
        }
        
        // Größe und Hintergrund hinzufügen
        baseUrl += `/${settings.size}`;
        
        if (settings.background) {
            baseUrl += `/${settings.background}`;
        }
        
        return baseUrl;
    }
    
    /**
     * Lädt einen Avatar und speichert ihn im Cache
     * @param {Object} options - Avatar-Optionen
     * @returns {Promise<string>} - URL des Avatars
     */
    function loadAvatar(options) {
        return new Promise((resolve) => {
            const url = generateAvatarUrl(options);
            const cacheKey = JSON.stringify(options);
            
            // Verwende gecachten Avatar, falls verfügbar
            if (avatarCache[cacheKey]) {
                resolve(avatarCache[cacheKey]);
                return;
            }
            
            // Ansonsten laden und cachen
            const img = new Image();
            img.onload = function() {
                avatarCache[cacheKey] = url;
                resolve(url);
            };
            img.onerror = function() {
                // Bei Fehler Standardavatar zurückgeben
                const fallbackUrl = generateAvatarUrl({...options, username: undefined, skinType: 'steve'});
                avatarCache[cacheKey] = fallbackUrl;
                resolve(fallbackUrl);
            };
            img.src = url;
        });
    }
    
    /**
     * Generiert ein HTML-Element mit einem Avatar
     * @param {Element} container - Das HTML-Element, in das der Avatar eingefügt werden soll
     * @param {Object} options - Avatar-Optionen
     * @returns {Promise<Element>} - Das erzeugte oder aktualisierte Element
     */
    function createAvatarElement(container, options) {
        return loadAvatar(options).then(url => {
            let imgElement;
            
            // Prüfen, ob der Container bereits ein Avatar-Bild enthält
            const existingImg = container.querySelector('.minecraft-avatar-img');
            if (existingImg) {
                imgElement = existingImg;
            } else {
                imgElement = document.createElement('img');
                imgElement.className = 'minecraft-avatar-img';
                container.appendChild(imgElement);
            }
            
            // Bild aktualisieren
            imgElement.src = url;
            imgElement.alt = options.username ? `${options.username}'s Minecraft Avatar` : `Minecraft ${options.skinType} Avatar`;
            imgElement.width = imgElement.height = options.size || 100;
            
            return imgElement;
        });
    }
    
    /**
     * Erzeugt einen Avatar-Auswahl-Dialog
     * @param {Function} onSelect - Callback, wenn ein Avatar ausgewählt wurde
     * @returns {Element} - Das Dialog-Element
     */
    function createAvatarSelector(onSelect) {
        const dialog = document.createElement('div');
        dialog.className = 'minecraft-avatar-selector';
        
        // Überschrift
        const title = document.createElement('h3');
        title.textContent = 'Wähle deinen Bot-Avatar';
        dialog.appendChild(title);
        
        // Tabs für Auswahl: Benutzername oder Standard-Skin
        const tabs = document.createElement('div');
        tabs.className = 'avatar-selector-tabs';
        
        const usernameTab = document.createElement('button');
        usernameTab.textContent = 'Minecraft-Name';
        usernameTab.className = 'tab active';
        usernameTab.dataset.tab = 'username';
        
        const skinTypeTab = document.createElement('button');
        skinTypeTab.textContent = 'Standard-Skin';
        skinTypeTab.className = 'tab';
        skinTypeTab.dataset.tab = 'skinType';
        
        tabs.appendChild(usernameTab);
        tabs.appendChild(skinTypeTab);
        dialog.appendChild(tabs);
        
        // Container für Tab-Inhalte
        const tabContents = document.createElement('div');
        tabContents.className = 'tab-contents';
        
        // Benutzername-Tab-Inhalt
        const usernameContent = document.createElement('div');
        usernameContent.className = 'tab-content active';
        usernameContent.dataset.tabContent = 'username';
        
        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Minecraft-Benutzername eingeben';
        usernameInput.className = 'avatar-username-input';
        
        const usernamePreview = document.createElement('div');
        usernamePreview.className = 'avatar-preview';
        
        const usernameSubmit = document.createElement('button');
        usernameSubmit.textContent = 'Avatar übernehmen';
        usernameSubmit.className = 'avatar-submit-btn';
        
        usernameContent.appendChild(usernameInput);
        usernameContent.appendChild(usernamePreview);
        usernameContent.appendChild(usernameSubmit);
        
        // Skin-Typ-Tab-Inhalt
        const skinTypeContent = document.createElement('div');
        skinTypeContent.className = 'tab-content';
        skinTypeContent.dataset.tabContent = 'skinType';
        
        const skinGrid = document.createElement('div');
        skinGrid.className = 'skin-type-grid';
        
        // Skin-Typen hinzufügen
        availableSkinTypes.forEach(skin => {
            const skinOption = document.createElement('div');
            skinOption.className = 'skin-option';
            skinOption.dataset.skinType = skin;
            
            const skinPreview = document.createElement('div');
            skinPreview.className = 'skin-preview';
            
            // Avatar für den Skin laden
            createAvatarElement(skinPreview, {
                skinType: skin,
                size: 80
            });
            
            const skinLabel = document.createElement('span');
            skinLabel.className = 'skin-label';
            skinLabel.textContent = skin.charAt(0).toUpperCase() + skin.slice(1);
            
            skinOption.appendChild(skinPreview);
            skinOption.appendChild(skinLabel);
            skinGrid.appendChild(skinOption);
        });
        
        skinTypeContent.appendChild(skinGrid);
        
        // Für beide Tab-Inhalte
        const viewSelector = document.createElement('div');
        viewSelector.className = 'view-selector';
        viewSelector.innerHTML = `
            <label>Avatar-Ansicht:</label>
            <select class="view-select">
                <option value="${viewTypes.HEAD}">Kopf</option>
                <option value="${viewTypes.FACE}">Gesicht</option>
                <option value="${viewTypes.BUST}">Oberkörper</option>
                <option value="${viewTypes.FULL}">Ganzer Körper</option>
            </select>
        `;
        
        const backgroundSelector = document.createElement('div');
        backgroundSelector.className = 'background-selector';
        backgroundSelector.innerHTML = `
            <label>Hintergrund:</label>
            <select class="background-select">
                <option value="${backgroundTypes.TRANSPARENT}">Transparent</option>
                <option value="${backgroundTypes.GRASS}">Gras</option>
                <option value="${backgroundTypes.STONE}">Stein</option>
                <option value="${backgroundTypes.DIRT}">Erde</option>
                <option value="${backgroundTypes.WOOD}">Holz</option>
                <option value="${backgroundTypes.NETHERRACK}">Netherrack</option>
                <option value="${backgroundTypes.WOOL}">Wolle</option>
            </select>
        `;
        
        // Tab-Inhalte zum Container hinzufügen
        tabContents.appendChild(usernameContent);
        tabContents.appendChild(skinTypeContent);
        tabContents.appendChild(viewSelector);
        tabContents.appendChild(backgroundSelector);
        dialog.appendChild(tabContents);
        
        // Buttons für Abbrechen und Speichern
        const actions = document.createElement('div');
        actions.className = 'avatar-actions';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Abbrechen';
        cancelBtn.className = 'avatar-cancel-btn';
        
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Avatar speichern';
        saveBtn.className = 'avatar-save-btn';
        
        actions.appendChild(cancelBtn);
        actions.appendChild(saveBtn);
        dialog.appendChild(actions);
        
        // Event-Listener
        // Tabs wechseln
        tabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                // Aktive Klasse entfernen
                tabs.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                tabContents.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Aktive Klasse hinzufügen
                e.target.classList.add('active');
                const activeContent = tabContents.querySelector(`[data-tab-content="${e.target.dataset.tab}"]`);
                if (activeContent) activeContent.classList.add('active');
            }
        });
        
        // Benutzername-Vorschau
        let debounceTimer;
        usernameInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const username = usernameInput.value.trim();
                if (username) {
                    createAvatarElement(usernamePreview, {
                        username: username,
                        size: 150,
                        view: viewSelector.querySelector('.view-select').value,
                        background: backgroundSelector.querySelector('.background-select').value
                    });
                }
            }, 500);
        });
        
        // Skin-Typ auswählen
        skinGrid.addEventListener('click', (e) => {
            const skinOption = e.target.closest('.skin-option');
            if (skinOption) {
                skinGrid.querySelectorAll('.skin-option').forEach(option => option.classList.remove('selected'));
                skinOption.classList.add('selected');
            }
        });
        
        // Ansicht ändern
        viewSelector.querySelector('.view-select').addEventListener('change', (e) => {
            if (usernameTab.classList.contains('active') && usernameInput.value.trim()) {
                createAvatarElement(usernamePreview, {
                    username: usernameInput.value.trim(),
                    size: 150,
                    view: e.target.value,
                    background: backgroundSelector.querySelector('.background-select').value
                });
            }
        });
        
        // Hintergrund ändern
        backgroundSelector.querySelector('.background-select').addEventListener('change', (e) => {
            if (usernameTab.classList.contains('active') && usernameInput.value.trim()) {
                createAvatarElement(usernamePreview, {
                    username: usernameInput.value.trim(),
                    size: 150,
                    view: viewSelector.querySelector('.view-select').value,
                    background: e.target.value
                });
            }
        });
        
        // Avatar speichern
        saveBtn.addEventListener('click', () => {
            let avatarOptions = {
                view: viewSelector.querySelector('.view-select').value,
                background: backgroundSelector.querySelector('.background-select').value,
                size: 100 // Standardgröße
            };
            
            if (usernameTab.classList.contains('active')) {
                avatarOptions.username = usernameInput.value.trim();
                if (!avatarOptions.username) {
                    alert('Bitte gib einen Minecraft-Benutzernamen ein.');
                    return;
                }
            } else {
                const selectedSkin = skinGrid.querySelector('.skin-option.selected');
                if (!selectedSkin) {
                    alert('Bitte wähle einen Skin-Typ aus.');
                    return;
                }
                avatarOptions.skinType = selectedSkin.dataset.skinType;
            }
            
            if (typeof onSelect === 'function') {
                onSelect(avatarOptions);
            }
            
            // Dialog entfernen
            dialog.remove();
        });
        
        // Abbrechen
        cancelBtn.addEventListener('click', () => {
            dialog.remove();
        });
        
        return dialog;
    }
    
    /**
     * Generiert CSS für Avatar-Komponenten
     * @returns {string} CSS als String
     */
    function generateCSS() {
        return `
            .minecraft-avatar-img {
                image-rendering: pixelated;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            
            .minecraft-avatar-selector {
                background-color: rgba(0, 0, 0, 0.85);
                border: 2px solid #555;
                border-radius: 6px;
                padding: 20px;
                width: 100%;
                max-width: 600px;
                color: #e0e0e0;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            }
            
            .avatar-selector-tabs {
                display: flex;
                margin-bottom: 15px;
                border-bottom: 2px solid #444;
            }
            
            .avatar-selector-tabs .tab {
                background: transparent;
                border: none;
                color: #aaa;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 1rem;
                border-bottom: 2px solid transparent;
                margin-bottom: -2px;
            }
            
            .avatar-selector-tabs .tab.active {
                color: #1eff00;
                border-bottom-color: #1eff00;
            }
            
            .tab-contents {
                margin-bottom: 20px;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .avatar-username-input {
                width: 100%;
                padding: 10px;
                background-color: rgba(0, 0, 0, 0.4);
                border: 1px solid #555;
                color: #fff;
                border-radius: 4px;
                margin-bottom: 15px;
            }
            
            .avatar-preview {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 150px;
                margin-bottom: 15px;
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }
            
            .avatar-submit-btn {
                background-color: #1eff00;
                color: #000;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            
            .skin-type-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .skin-option {
                background-color: rgba(0, 0, 0, 0.3);
                border: 2px solid #555;
                border-radius: 4px;
                padding: 10px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .skin-option:hover {
                background-color: rgba(30, 255, 0, 0.1);
                border-color: rgba(30, 255, 0, 0.5);
            }
            
            .skin-option.selected {
                background-color: rgba(30, 255, 0, 0.1);
                border-color: #1eff00;
            }
            
            .skin-preview {
                display: flex;
                justify-content: center;
                margin-bottom: 10px;
            }
            
            .skin-label {
                font-size: 0.9rem;
                color: #ddd;
            }
            
            .view-selector, .background-selector {
                margin-top: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .view-selector label, .background-selector label {
                min-width: 120px;
            }
            
            .view-select, .background-select {
                background-color: rgba(0, 0, 0, 0.4);
                border: 1px solid #555;
                color: #fff;
                padding: 8px;
                border-radius: 4px;
                flex: 1;
            }
            
            .avatar-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            
            .avatar-cancel-btn, .avatar-save-btn {
                padding: 10px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            
            .avatar-cancel-btn {
                background-color: transparent;
                border: 1px solid #555;
                color: #ccc;
            }
            
            .avatar-save-btn {
                background-color: #1eff00;
                border: none;
                color: #000;
            }
            
            /* Mobil-Anpassungen */
            @media (max-width: 600px) {
                .minecraft-avatar-selector {
                    width: 90%;
                }
                
                .skin-type-grid {
                    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                }
                
                .view-selector, .background-selector {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .view-selector label, .background-selector label {
                    margin-bottom: 5px;
                }
            }
        `;
    }
    
    // Füge CSS zum Dokument hinzu
    function injectCSS() {
        if (!document.getElementById('minecraft-avatar-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'minecraft-avatar-styles';
            styleElement.textContent = generateCSS();
            document.head.appendChild(styleElement);
        }
    }
    
    // Initialisiere die CSS-Styles beim Laden
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCSS);
    } else {
        injectCSS();
    }
    
    // Öffentliche API
    return {
        generateAvatarUrl,
        loadAvatar,
        createAvatarElement,
        createAvatarSelector,
        availableSkinTypes,
        viewTypes,
        backgroundTypes
    };
})();

// Globale Verfügbarkeit für HTML-Inline-Skripte
window.MinecraftAvatar = MinecraftAvatar;