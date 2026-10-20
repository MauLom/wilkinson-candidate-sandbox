import fs from 'node:fs';
import path from 'node:path';
export const seed = () => ({
  prospects: [
    { id: 'p-101', name: 'Alex Morgan', phone: '+12025550123' },
    { id: 'p-102', name: 'Jordan Morgan', phone: '+12025550123' }
  ], messages: [], activity: []
});
export function createStore(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(seed(), null, 2));
  return {
    read: () => JSON.parse(fs.readFileSync(file, 'utf8')),
    write: data => fs.writeFileSync(file, JSON.stringify(data, null, 2))
  };
}
