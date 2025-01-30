const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Get local timestamp
function getLocalTimestamp() {
    const now = new Date();
    
    // Formatting to YYYY-MM-DD_HH:MM:SS using local time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
}

// Create log file
const logDir = path.join(__dirname, 'logs');
const logFileName = `logs_${getLocalTimestamp().replace(/:/g, '-')}.txt`;
const logFilePath = path.join(logDir, logFileName);

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Class Logger
class Logger extends EventEmitter {
    log(eventType, message) {
        const timestamp = getLocalTimestamp();
        const logMessage = `[${timestamp}] ${eventType}: ${message}\n`;

        console.log(logMessage.trim()); // Вивід у консоль

        // Write to log file
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });

        this.emit(eventType, logMessage);
    }
}

module.exports = new Logger();
