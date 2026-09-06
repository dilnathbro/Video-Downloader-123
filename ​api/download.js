export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL එකක් ඇතුළත් කර නැත.' });
  }

  try {
    const response = await fetch(`https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'b411d409cdmsh211c752bb04e82dp1efb7bjsn6aa417c9d2cb',
        'x-rapidapi-host': 'facebook-reel-and-video-downloader.p.rapidapi.com'
      }
    });

    const data = await response.json();

    if (data && (data.sd || data.hd || data.links)) {
      let downloads = [];

      if (data.hd) {
        downloads.push({ quality: 'Download HD Video (MP4)', url: data.hd });
      }
      if (data.sd) {
        downloads.push({ quality: 'Download SD Video (MP4)', url: data.sd });
      }

      if (downloads.length === 0 && data.links) {
        if (data.links.hd) downloads.push({ quality: 'Download HD Video (MP4)', url: data.links.hd });
        if (data.links.sd) downloads.push({ quality: 'Download SD Video (MP4)', url: data.links.sd });
      }

      if (downloads.length > 0) {
        return res.status(200).json({ success: true, downloads });
      }
    }

    return res.status(400).json({ error: 'වීඩියෝව Extract කිරීමට නොහැකි විය. Link එක Public එකක්දැයි බලන්න.' });

  } catch (err) {
    return res.status(500).json({ error: 'RapidAPI Server සම්බන්ධතාවයේ දෝෂයක් ඇත.' });
  }
}
