export function getSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get('miniGptSettings', (data) => {
      resolve(data.miniGptSettings || {});
    });
  });
}

export function setSettings(settings) {
  return new Promise(resolve => {
    chrome.storage.local.set({ miniGptSettings: settings }, resolve);
  });
} 