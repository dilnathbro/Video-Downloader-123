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

  const apiKey = 'b411d409cdmsh211c752bb04e82dp1efb7bjsn6aa417c9d2cb';

  try {
    // Engine 1: Facebook Reel & Video Downloader
    const res1 = await fetch(`https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'facebook-reel-and-video-downloader.p.rapidapi.com'
      }
    });

    if (res1.ok) {
      const data = await res1.json();
      let downloads = [];
      if (data.hd) downloads.push({ quality: 'Download HD Video (MP4)', url: data.hd });
      if (data.sd) downloads.push({ quality: 'Download SD Video (MP4)', url: data.sd });
      
      if (downloads.length > 0) {
        return res.status(200).json({ success: true, downloads });
      }
    }

    // Engine 2: Fallback Scraper API
    const res2 = await fetch(`https://api.v2.iscdl.com/fb?url=${encodeURIComponent(url)}`);
    if (res2.ok) {
      const bData = await res2.json();
      let downloads = [];
      if (bData.url) downloads.push({ quality: 'Download HD Video', url: bData.url });
      if (bData.sd) downloads.push({ quality: 'Download SD Video', url: bData.sd });

      if (downloads.length > 0) {
        return res.status(200).json({ success: true, downloads });
      }
    }

    return res.status(400).json({ error: 'වීඩියෝව Extract කිරීමට නොහැකි විය. Link එක Public එකක්දැයි බලන්න.' });

  } catch (err) {
    return res.status(500).json({ error: 'Server Error. කරුණාකර නැවත උත්සාහ කරන්න.' });
  }
}
