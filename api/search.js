export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const searchUrl = `https://www.lyricsondemand.com/searchlyrics.php?q=${encodeURIComponent(q)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.lyricsondemand.com/',
      }
    });

    const html = await response.text();

    // Parse search result links
    const results = [];
    const seen = new Set();
    const linkRegex = /href="(\/[^"]*lyrics[^"]*\.html)"[^>]*>([^<]{3,80})<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null && results.length < 20) {
      const path = match[1];
      const title = match[2].trim();
      if (!seen.has(path)) {
        seen.add(path);
        results.push({ path, title });
      }
    }

    res.json({ results, query: q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
        }
