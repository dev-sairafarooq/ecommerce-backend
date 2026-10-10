const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', '..', 'logs');
const logFilePath = path.join(logDir, 'app.log');

// Agar logs folder exist nahi karta, bana do
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Ek hi stream poori app ke liye - baar baar file open/close nahi karni
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' }); // 'a' = append, purana data delete nahi hoga

// Stream mein koi masla aaye (jaise disk full, permission error) to server crash na ho
logStream.on('error', (err) => {
  console.error('Logger stream error:', err.message);
});

const logRequest = (method, path, statusCode, responseTimeMs) => {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} | ${method} | ${path} | ${statusCode} | ${responseTimeMs}ms\n`;
  logStream.write(line);
};

const logError = (method, path, error) => {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} | ERROR | ${method} | ${path} | ${error.message}\n${error.stack}\n`;
  logStream.write(line);
};

module.exports = { logRequest, logError };