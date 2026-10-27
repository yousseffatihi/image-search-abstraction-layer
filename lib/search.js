// Image search backed by the Wikimedia Commons API (free, no API key required).
const API_URL = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT =
  process.env.USER_AGENT ||
  'ImageSearchAbstractionLayer/1.0 (freeCodeCamp project; https://www.freecodecamp.org)';

const PAGE_SIZE = 10;

function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Wikimedia appends tracking parameters to its URLs; drop them for cleaner output.
function cleanUrl(url) {
  if (!url) return url;
  const u = new URL(url);
  for (const key of [...u.searchParams.keys()]) {
    if (key.startsWith('utm_')) u.searchParams.delete(key);
  }
  return u.toString();
}

async function fetchPage(search, page) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: `${search} filetype:bitmap`,
    gsrnamespace: '6', // File: namespace
    gsrlimit: String(PAGE_SIZE),
    gsroffset: String((page - 1) * PAGE_SIZE),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiextmetadatafilter: 'ImageDescription|ObjectName',
    iiurlwidth: '300',
  });

  const res = await fetch(`${API_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Image provider responded with ${res.status}`);

  const data = await res.json();
  const pages = data.query?.pages || [];

  return pages
    .filter((p) => p.imageinfo?.length)
    .sort((a, b) => a.index - b.index)
    .map((p) => {
      const info = p.imageinfo[0];
      const meta = info.extmetadata || {};
      const snippet =
        stripHtml(meta.ImageDescription?.value) ||
        stripHtml(meta.ObjectName?.value) ||
        p.title.replace(/^File:/, '').replace(/\.[^.]+$/, '');
      return {
        url: cleanUrl(info.url),
        snippet,
        thumbnail: cleanUrl(info.thumburl),
        context: info.descriptionurl,
      };
    });
}

async function searchImages(query, page = 1) {
  const results = await fetchPage(query, page);
  const words = query.split(/\s+/).filter(Boolean);
  // Commons requires every word to match; if that finds nothing, match any word instead.
  if (results.length || words.length < 2) return results;
  return fetchPage(words.join(' OR '), page);
}

module.exports = { searchImages, PAGE_SIZE };
