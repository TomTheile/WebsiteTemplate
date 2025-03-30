/**
 * Funktionen für das Benachrichtigungssystem im window-Objekt verfügbar machen
 * Dies ermöglicht den Zugriff auf diese Funktionen aus anderen Dateien
 */
window.createNotification = createNotification;
window.getNotifications = getNotifications;
window.markNotificationAsRead = markNotificationAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;