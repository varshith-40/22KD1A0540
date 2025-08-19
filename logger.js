class CustomLogger {
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      source: 'URLShortenerApp'
    };
    
    this.persistLog(logEntry);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);
    }
  }

  persistLog(logEntry) {
    const logs = JSON.parse(localStorage.getItem('appLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('appLogs', JSON.stringify(logs.slice(-100))); // Keep last 100 logs
  }

  info(message, data) { this.log('info', message, data); }
  error(message, data) { this.log('error', message, data); }
  warn(message, data) { this.log('warn', message, data); }
}

export const logger = new CustomLogger();
