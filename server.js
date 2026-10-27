const path = require('path');
const express = require('express');
const { searchImages } = require('./lib/search');
const { addSearch, getRecent } = require('./lib/recent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// GET /query/:search?page=N -> [{ url, snippet, thumbnail, context }]
app.get('/query/:search', async (req, res) => {
  const term = req.params.search.trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  if (!term) return res.status(400).json({ error: 'Search string is required' });

  try {
    const results = await searchImages(term, page);
    addSearch(term);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Failed to fetch images from provider' });
  }
});

// GET /recent -> [{ term, when }]
app.get('/recent', (req, res) => {
  res.json(getRecent());
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Image Search Abstraction Layer listening on port ${PORT}`);
});
