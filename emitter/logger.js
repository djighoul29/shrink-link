const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class Logger extends EventEmitter {
    log(eventType, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${eventType}: ${message}\n`;

        console.log(logMessage.trim()); // Log to console

        // Write to file
        const logFilePath = path.join(__dirname, '../data', 'logs.txt');
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });

        this.emit(eventType, logMessage);
    }
}

module.exports = new Logger();
