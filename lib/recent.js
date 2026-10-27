// Stores the most recent search queries in memory and persists them to a JSON file
// so they survive restarts (on hosts with a persistent disk).
const fs = require('fs');
const path = require('path');

const MAX_ENTRIES = 10;
const DATA_FILE = process.env.RECENT_FILE || path.join(__dirname, '..', 'data', 'recent.json');

let entries = [];

try {
  entries = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch {
  entries = [];
}

function save() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
  } catch (err) {
    console.warn('Could not persist recent searches:', err.message);
  }
}

function addSearch(term) {
  entries.unshift({ term, when: new Date().toISOString() });
  entries = entries.slice(0, MAX_ENTRIES);
  save();
}

function getRecent() {
  return entries;
}

module.exports = { addSearch, getRecent };
