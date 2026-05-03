export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  try {
    const url = `https://www.lyricsondemand.com${path}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.lyricsondemand.com/',
      }
    });

    const html = await response.text();

    // Extract song title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].replace(' Lyrics - Lyrics On Demand', '').trim() : '';

    // Extract artist
    const artistMatch = html.match(/class="artistheading"[^>]*>([^<]+)/i)
      || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const artist = artistMatch ? artistMatch[1].trim() : '';

    // Extract lyrics - lyricsondemand wraps in a div with class "lyricbox"
    const lyricsMatch = html.match(/class="lyricbox"[^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/<!-- start of lyrics -->([\s\S]*?)<!-- end of lyrics -->/i)
      || html.match(/<div[^>]+id="lyrics"[^>]*>([\s\S]*?)<\/div>/i);

    let lyrics = '';
    if (lyricsMatch) {
      lyrics = lyricsMatch[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
    }

    // Extract info block (artist, album, etc)
    const infoMatch = html.match(/class="lyricsinfo"[^>]*>([\s\S]*?)<\/div>/i);
    let info = '';
    if (infoMatch) {
      info = infoMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    res.json({ title: rawTitle, artist, lyrics, info, url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
