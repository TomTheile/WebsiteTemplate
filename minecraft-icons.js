/**
 * Minecraft-Icon-Sammlung für Animationen und Benutzeroberfläche
 * Bietet SVG-Darstellungen von Minecraft-Items für die Verwendung in der Anwendung
 */

const MinecraftIcons = {
    // Minecraft Tools
    pickaxe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#8B8B8B" d="M12,1L9,4L6,7L2,11L1,15L5,14L9,10L12,7L15,4L12,1z"/>
        <path fill="#565656" d="M12,1L9,4L9,5L13,1L12,1z M6,7L5,8L9,4L9,3L6,7z M2,11L1,12L5,8L5,7L2,11z"/>
        <path fill="#3F3F3F" d="M1,15L1,14L2,11L1,12L1,15z"/>
        <path fill="#3F3F3F" d="M12,7L15,4L14,4L11,7L12,7z"/>
        <path fill="#777777" d="M5,14L9,10L8,10L4,14L5,14z"/>
    </svg>`,

    sword: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#8B8B8B" d="M5,12L3,14L2,14L2,15L3,15L4,14L6,12L5,12z"/>
        <path fill="#ABABAB" d="M14,1L13,2L12,3L11,4L10,5L9,6L8,7L7,8L6,9L5,10L4,11L5,12L6,11L7,10L8,9L9,8L10,7L11,6L12,5L13,4L14,3L15,2L14,1z"/>
        <path fill="#565656" d="M5,12L4,11L4,12L5,12z M14,1L15,2L15,1L14,1z"/>
    </svg>`,

    axe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#8B8B8B" d="M7,2L4,5L2,7L1,10L2,11L4,11L7,8L10,5L9,3L7,2z"/>
        <path fill="#565656" d="M7,2L4,5L5,6L8,3L7,2z M2,7L1,8L5,4L4,3L2,7z"/>
        <path fill="#3F3F3F" d="M1,10L1,9L2,7L1,8L1,10z"/>
        <path fill="#3F3F3F" d="M7,8L10,5L9,4L6,7L7,8z"/>
        <path fill="#777777" d="M2,11L4,11L3,10L2,10L2,11z"/>
    </svg>`,

    shovel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#8B8B8B" d="M8,1L7,2L6,3L6,4L7,5L8,6L9,5L10,4L10,3L9,2L8,1z"/>
        <path fill="#565656" d="M8,1L7,2L7,3L8,2L8,1z M6,3L6,4L7,5L7,4L6,3z"/>
        <path fill="#3F3F3F" d="M8,6L9,5L9,4L8,5L8,6z M9,2L10,3L10,2L9,2z"/>
        <path fill="#777777" d="M8,6L8,12L9,12L9,6L8,6z"/>
    </svg>`,

    // Minecraft Blocks
    grassBlock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#7B6A45" d="M1,5L1,15L15,15L15,5L1,5z"/>
        <path fill="#8B7A55" d="M2,6L2,14L14,14L14,6L2,6z"/>
        <path fill="#70C454" d="M1,1L1,5L15,5L15,1L1,1z"/>
        <path fill="#48883C" d="M2,2L2,4L14,4L14,2L2,2z"/>
    </svg>`,

    stoneBlock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#888888" d="M1,1L1,15L15,15L15,1L1,1z"/>
        <path fill="#555555" d="M2,2L2,14L14,14L14,2L2,2z"/>
        <path fill="#999999" d="M3,3L3,6L6,6L6,3L3,3z M10,3L10,6L13,6L13,3L10,3z M3,10L3,13L6,13L6,10L3,10z M10,10L10,13L13,13L13,10L10,10z"/>
    </svg>`,

    // Minecraft Mobs
    creeper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#5B9C3F" d="M1,1L1,15L15,15L15,1L1,1z"/>
        <path fill="#63AD45" d="M2,2L2,14L14,14L14,2L2,2z"/>
        <path fill="#000000" d="M4,4L6,4L6,6L4,6L4,4z M10,4L12,4L12,6L10,6L10,4z M6,8L10,8L10,12L6,12L6,8z"/>
    </svg>`,

    zombie: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#587D45" d="M1,1L1,15L15,15L15,1L1,1z"/>
        <path fill="#699154" d="M2,2L2,14L14,14L14,2L2,2z"/>
        <path fill="#000000" d="M4,4L6,4L6,6L4,6L4,4z M10,4L12,4L12,6L10,6L10,4z"/>
        <path fill="#000000" d="M5,9L11,9L11,12L5,12L5,9z"/>
    </svg>`,

    // Minecraft Items
    chest: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#9A794A" d="M1,1L1,15L15,15L15,1L1,1z"/>
        <path fill="#B8945C" d="M2,2L2,14L14,14L14,2L2,2z"/>
        <path fill="#6E583A" d="M7,4L9,4L9,10L7,10L7,4z"/>
        <path fill="#FFE25C" d="M7,7L9,7L9,8L7,8L7,7z"/>
    </svg>`,

    furnace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#888888" d="M1,1L1,15L15,15L15,1L1,1z"/>
        <path fill="#555555" d="M2,2L2,14L14,14L14,2L2,2z"/>
        <path fill="#222222" d="M4,4L12,4L12,10L4,10L4,4z"/>
        <path fill="#FF6600" d="M5,8L11,8L11,10L5,10L5,8z"/>
    </svg>`,

    // Minecraft UI
    heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#FF0000" d="M2,4L2,7L4,9L8,13L12,9L14,7L14,4L12,2L10,2L8,4L6,2L4,2L2,4z"/>
        <path fill="#AA0000" d="M3,5L3,7L5,9L8,12L11,9L13,7L13,5L12,3L10,3L8,5L6,3L4,3L3,5z"/>
    </svg>`,

    // Minecraft Status
    loading: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="#333333" d="M8,1C4.14,1,1,4.14,1,8s3.14,7,7,7s7-3.14,7-7S11.86,1,8,1z M8,13c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5 S10.76,13,8,13z"/>
        <path fill="#FFFFFF" d="M8,13c-2.76,0-5-2.24-5-5s2.24-5,5-5V1C4.14,1,1,4.14,1,8s3.14,7,7,7s7-3.14,7-7h-2C13,10.76,10.76,13,8,13z"/>
    </svg>`,

    expBar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 10">
        <rect fill="#222222" x="0" y="0" width="100" height="10" />
        <rect fill="#00AA00" x="0" y="0" width="50" height="10" />
    </svg>`,

    /**
     * Gibt ein SVG-Icon als HTML-String zurück
     * @param {string} name - Der Name des Icons
     * @param {number} size - Die Größe des Icons in Pixeln
     * @returns {string} - HTML-String des SVG-Icons
     */
    getIcon: function(name, size = 24) {
        const icon = this[name] || this.grassBlock; // Fallback auf Grass Block, wenn nicht gefunden
        return `<div style="width:${size}px;height:${size}px;">${icon}</div>`;
    },
    
    /**
     * Fügt ein Icon zu einem Element hinzu
     * @param {HTMLElement} element - Das Element, zu dem das Icon hinzugefügt werden soll
     * @param {string} name - Der Name des Icons
     * @param {number} size - Die Größe des Icons in Pixeln
     */
    appendIcon: function(element, name, size = 24) {
        const iconHTML = this.getIcon(name, size);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = iconHTML;
        
        // Das erste Kind des temporären Divs zum Zielelement hinzufügen
        element.appendChild(tempDiv.firstChild);
    }
};

// Das Icon-Objekt global verfügbar machen
window.MinecraftIcons = MinecraftIcons;