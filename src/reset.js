import fs from 'node:fs';
import { seed, createStore } from './store.js';
if (fs.existsSync('.env')) process.loadEnvFile('.env');
createStore(process.env.DATA_FILE || './data/store.json').write(seed());
console.log('Sandbox data reset. Refresh your browser.');
