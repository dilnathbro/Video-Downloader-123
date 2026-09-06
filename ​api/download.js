export default async function handler(req, res) {
  // CORS Headers Set කිරීම
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'කරුණාකර Facebook Link එකක් ඇතුළත් කරන්න.' });
  }

  const apiKey = 'b411d409cdmsh211c752bb04e82dp1efb7bjsn6aa417c9d2cb';

  try {
    let extractedDownloads = [];

    // ENGINE 1: RapidAPI - Facebook Reel & Video Downloader
    try {
      const response1 = await fetch(`https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'facebook-reel-and-video-downloader.p.rapidapi.com'
        }
      });

      if (response1.ok) {
        const data = await response1.json();
        if (data && data.hd) extractedDownloads.push({ quality: 'Download HD Video (MP4)', url: data.hd });
        if (data && data.sd) extractedDownloads.push({ quality: 'Download SD Video (MP4)', url: data.sd });
      }
    } catch (e) {}

    // ENGINE 2: Fallback Scraper Engine
    if (extractedDownloads.length === 0) {
      try {
        const response2 = await fetch(`https://api.v2.iscdl.com/fb?url=${encodeURIComponent(url)}`);
        if (response2.ok) {
          const bData = await response2.json();
          if (bData && bData.url) extractedDownloads.push({ quality: 'Download HD Video (MP4)', url: bData.url });
          if (bData && bData.sd) extractedDownloads.push({ quality: 'Download SD Video (MP4)', url: bData.sd });
        }
      } catch (e) {}
    }

    if (extractedDownloads.length > 0) {
      return res.status(200).json({ success: true, downloads: extractedDownloads });
    } else {
      return res.status(400).json({ error: 'මෙම වීඩියෝව Extract කිරීමට නොහැකි විය. Link එක Public එකක්දැයි බලන්න.' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Server Connection Error! කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.' });
  }
}
