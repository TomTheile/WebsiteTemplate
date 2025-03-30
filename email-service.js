/**
 * E-Mail-Service mit Nodemailer für die Herobrine-Bot Website
 * Verwendet die angegebenen Gmail-Zugangsdaten für den E-Mail-Versand
 */

const nodemailer = require('nodemailer');

// E-Mail-Konfiguration mit den bereitgestellten Zugangsdaten
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'verify.mcbot@gmail.com',
        pass: 'mwkt ynmc wypw pdod' // App-Passwort
    }
});

/**
 * Sendet eine Verifizierungs-E-Mail an einen neu registrierten Benutzer
 * 
 * @param {string} to - E-Mail-Adresse des Empfängers
 * @param {string} username - Benutzername für die personalisierte Anrede
 * @param {string} verificationLink - Link zur Kontobestätigung
 * @returns {Promise<boolean>} - True wenn die E-Mail gesendet wurde, sonst False
 */
async function sendVerificationEmail(to, username, verificationLink) {
    try {
        // E-Mail-Einstellungen
        const mailOptions = {
            from: 'Herobrine Minecraft Bot <verify.mcbot@gmail.com>',
            to: to,
            subject: 'Bestätige dein Herobrine-Bot Konto',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; background-color: #131313; padding: 10px; border-radius: 4px;">
                        <h2 style="color: #1eff00; margin: 0;">Herobrine Minecraft Bot</h2>
                    </div>
                    
                    <div style="padding: 20px 0;">
                        <p>Hallo <strong>${username}</strong>,</p>
                        
                        <p>vielen Dank für deine Registrierung bei Herobrine Minecraft Bot! Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren und vollen Zugriff auf alle Funktionen zu erhalten.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="background-color: #1eff00; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">E-Mail-Adresse bestätigen</a>
                        </div>
                        
                        <p>Oder kopiere diesen Link in deinen Browser:</p>
                        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
                            ${verificationLink}
                        </p>
                        
                        <p>Der Link ist aus Sicherheitsgründen 24 Stunden gültig.</p>
                        
                        <p>Wenn du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.</p>
                    </div>
                    
                    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #666;">
                        <p>© ${new Date().getFullYear()} Herobrine Minecraft Bot. Alle Rechte vorbehalten.</p>
                        <p>Dies ist eine automatisch generierte E-Mail. Bitte antworte nicht auf diese Nachricht.</p>
                    </div>
                </div>
            `
        };

        // E-Mail senden
        const info = await transporter.sendMail(mailOptions);
        console.log('E-Mail wurde gesendet:', info.messageId);
        return true;
    } catch (error) {
        console.error('Fehler beim Senden der E-Mail:', error);
        return false;
    }
}

/**
 * Sendet eine E-Mail zum Zurücksetzen des Passworts
 * 
 * @param {string} to - E-Mail-Adresse des Empfängers
 * @param {string} username - Benutzername für die personalisierte Anrede
 * @param {string} resetLink - Link zum Zurücksetzen des Passworts
 * @returns {Promise<boolean>} - True wenn die E-Mail gesendet wurde, sonst False
 */
async function sendPasswordResetEmail(to, username, resetLink) {
    try {
        // E-Mail-Einstellungen
        const mailOptions = {
            from: 'Herobrine Minecraft Bot <verify.mcbot@gmail.com>',
            to: to,
            subject: 'Zurücksetzen deines Passworts',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; background-color: #131313; padding: 10px; border-radius: 4px;">
                        <h2 style="color: #1eff00; margin: 0;">Herobrine Minecraft Bot</h2>
                    </div>
                    
                    <div style="padding: 20px 0;">
                        <p>Hallo <strong>${username}</strong>,</p>
                        
                        <p>du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den folgenden Button, um ein neues Passwort zu erstellen:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background-color: #1eff00; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Passwort zurücksetzen</a>
                        </div>
                        
                        <p>Oder kopiere diesen Link in deinen Browser:</p>
                        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
                            ${resetLink}
                        </p>
                        
                        <p>Der Link ist aus Sicherheitsgründen 1 Stunde gültig.</p>
                        
                        <p>Wenn du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail oder wende dich an unseren Support, wenn du vermutest, dass dein Konto unbefugtem Zugriff ausgesetzt war.</p>
                    </div>
                    
                    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #666;">
                        <p>© ${new Date().getFullYear()} Herobrine Minecraft Bot. Alle Rechte vorbehalten.</p>
                        <p>Dies ist eine automatisch generierte E-Mail. Bitte antworte nicht auf diese Nachricht.</p>
                    </div>
                </div>
            `
        };

        // E-Mail senden
        const info = await transporter.sendMail(mailOptions);
        console.log('Passwort-Reset-E-Mail wurde gesendet:', info.messageId);
        return true;
    } catch (error) {
        console.error('Fehler beim Senden der Passwort-Reset-E-Mail:', error);
        return false;
    }
}

/**
 * Sendet eine Willkommens-E-Mail nach erfolgreicher Kontobestätigung
 * 
 * @param {string} to - E-Mail-Adresse des Empfängers
 * @param {string} username - Benutzername für die personalisierte Anrede
 * @returns {Promise<boolean>} - True wenn die E-Mail gesendet wurde, sonst False
 */
async function sendWelcomeEmail(to, username) {
    try {
        // E-Mail-Einstellungen
        const mailOptions = {
            from: 'Herobrine Minecraft Bot <verify.mcbot@gmail.com>',
            to: to,
            subject: 'Willkommen bei Herobrine Minecraft Bot!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; background-color: #131313; padding: 10px; border-radius: 4px;">
                        <h2 style="color: #1eff00; margin: 0;">Herobrine Minecraft Bot</h2>
                    </div>
                    
                    <div style="padding: 20px 0;">
                        <p>Hallo <strong>${username}</strong> und herzlich willkommen!</p>
                        
                        <p>Dein Konto wurde erfolgreich bestätigt. Du hast jetzt Zugriff auf alle Funktionen von Herobrine Minecraft Bot.</p>
                        
                        <h3>Deine Vorteile:</h3>
                        <ul>
                            <li>Ein kostenloser Minecraft-Bot</li>
                            <li>KI-gesteuerte Bot-Bewegung</li>
                            <li>24/7 Server-Präsenz</li>
                            <li>Echtzeit-Überwachung</li>
                        </ul>
                        
                        <p>Möchtest du weitere Bots hinzufügen? Upgrade auf Premium für nur 3€ pro zusätzlichen Bot!</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://herobrine-bot.de/dashboard.html" style="background-color: #1eff00; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Zum Dashboard</a>
                        </div>
                        
                        <p>Wenn du Fragen hast oder Hilfe benötigst, besuche unsere FAQ oder kontaktiere unseren Support.</p>
                    </div>
                    
                    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #666;">
                        <p>© ${new Date().getFullYear()} Herobrine Minecraft Bot. Alle Rechte vorbehalten.</p>
                        <p>Dies ist eine automatisch generierte E-Mail. Bitte antworte nicht auf diese Nachricht.</p>
                    </div>
                </div>
            `
        };

        // E-Mail senden
        const info = await transporter.sendMail(mailOptions);
        console.log('Willkommens-E-Mail wurde gesendet:', info.messageId);
        return true;
    } catch (error) {
        console.error('Fehler beim Senden der Willkommens-E-Mail:', error);
        return false;
    }
}

// E-Mail-Funktionen exportieren
module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
};