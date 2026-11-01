let connection;
function db() {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open('griot-offline-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('entries');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error) => { connection = null; throw error; });
  return connection;
}
async function operation(mode, action) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', mode);
    const request = action(transaction.objectStore('entries'));
    transaction.oncomplete = () => resolve(request?.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Stockage interrompu'));
  });
}
export const readOffline = (key) => operation('readonly', (store) => store.get(key));
export const writeOffline = (key, value) => operation('readwrite', (store) => store.put(value, key));
export async function clearOffline(scope) {
  const keys = await operation('readonly', (store) => store.getAllKeys());
  const database = await db();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('entries', 'readwrite');
    keys.filter((key) => String(key).startsWith(`${scope}:`)).forEach((key) => transaction.objectStore('entries').delete(key));
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}
export function offlineEvent() { window.dispatchEvent(new Event('griot-offline-change')); }
export function remapLocalIds(value, mapping) {
  if (typeof value === 'string') return mapping[value] || value;
  if (Array.isArray(value)) return value.map((item) => remapLocalIds(item, mapping));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remapLocalIds(item, mapping)]));
  return value;
}
