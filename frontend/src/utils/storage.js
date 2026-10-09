/**
 * Local storage manager for analysis history
 */

const STORAGE_KEY = 'routeshield_analysis_history';

export const getAnalysisHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultHistory();
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read analysis history:', e);
    return getDefaultHistory();
  }
};

export const saveAnalysisToHistory = (analysisItem) => {
  try {
    const history = getAnalysisHistory();
    const newItem = {
      id: `rs-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...analysisItem
    };
    const updated = [newItem, ...history.filter(h => h.id !== newItem.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  } catch (e) {
    console.error('Failed to save analysis to history:', e);
    return null;
  }
};

export const clearAnalysisHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

function getDefaultHistory() {
  return [];
}
