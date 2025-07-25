import { LogEntry } from '../types';

const LOG_KEY = 'ipDashboardLog';
const MAX_LOG_ENTRIES = 20;

/**
 * Retrieves all logs from localStorage.
 * @returns An array of LogEntry objects.
 */
export const getLogs = (): LogEntry[] => {
  try {
    const storedLogs = localStorage.getItem(LOG_KEY);
    if (storedLogs) {
      return JSON.parse(storedLogs);
    }
  } catch (error) {
    console.error("Failed to parse logs from localStorage", error);
    return [];
  }
  return [];
};

/**
 * Saves a new log entry to localStorage, keeping the list size limited.
 * Avoids saving identical, consecutive log entries.
 * @param log The new LogEntry to save.
 */
export const saveLog = (log: LogEntry): void => {
  try {
    const logs = getLogs();
    
    // Prevent saving the same IP if analyzed within a short time frame (e.g., 1 minute)
    if (logs.length > 0) {
      const lastLog = logs[0];
      const now = Date.now();
      if (lastLog.result.geoData.query === log.result.geoData.query && (now - lastLog.id < 60 * 1000)) {
        // If it's a new self-analysis of the same IP, update the last log with more complete data.
        if (log.result.traceData && !lastLog.result.traceData) {
           logs[0] = log;
           localStorage.setItem(LOG_KEY, JSON.stringify(logs));
        }
        return; // Skip saving duplicate log
      }
    }
    
    const updatedLogs = [log, ...logs].slice(0, MAX_LOG_ENTRIES);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error("Failed to save log to localStorage", error);
  }
};

/**
 * Clears all logs from localStorage.
 */
export const clearLogs = (): void => {
  try {
    localStorage.removeItem(LOG_KEY);
  } catch (error) {
    console.error("Failed to clear logs from localStorage", error);
  }
};
