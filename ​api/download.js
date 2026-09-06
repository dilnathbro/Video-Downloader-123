export default async function handler(req, res) {
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

  // Clean and normalize Facebook Reel URL
  let cleanUrl = url.trim();
  if (cleanUrl.includes('facebook.com/reel/')) {
    const reelId = cleanUrl.split('/reel/')[1]?.split('?')[0]?.replace('/', '');
    if (reelId) {
      cleanUrl = `https://www.facebook.com/watch/?v=${reelId}`;
    }
  }

  const apiKey = 'b411d409cdmsh211c752bb04e82dp1efb7bjsn6aa417c9d2cb';

  try {
    let extractedDownloads = [];

    // ENGINE 1: RapidAPI - Facebook Reel & Video Downloader
    try {
      const res1 = await fetch(`https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(cleanUrl)}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'facebook-reel-and-video-downloader.p.rapidapi.com'
        }
      });

      if (res1.ok) {
        const data = await res1.json();
        if (data && data.hd) extractedDownloads.push({ quality: 'Download HD Video (MP4)', url: data.hd });
        if (data && data.sd) extractedDownloads.push({ quality: 'Download SD Video (MP4)', url: data.sd });
      }
    } catch (e) {}

    // ENGINE 2: Alternative RapidAPI Call (Original URL)
    if (extractedDownloads.length === 0) {
      try {
        const res2 = await fetch(`https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'facebook-reel-and-video-downloader.p.rapidapi.com'
          }
        });

        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.hd) extractedDownloads.push({ quality: 'Download HD Video (MP4)', url: data2.hd });
          if (data2 && data2.sd) extractedDownloads.push({ quality: 'Download SD Video (MP4)', url: data2.sd });
        }
      } catch (e) {}
    }

    // ENGINE 3: Backup Public Scraper API
    if (extractedDownloads.length === 0) {
      try {
        const res3 = await fetch(`https://api.v2.iscdl.com/fb?url=${encodeURIComponent(url)}`);
        if (res3.ok) {
          const bData = await res3.json();
          if (bData && bData.url) extractedDownloads.push({ quality: 'Download HD Video (MP4)', url: bData.url });
          if (bData && bData.sd) extractedDownloads.push({ quality: 'Download SD Video (MP4)', url: bData.sd });
        }
      } catch (e) {}
    }

    if (extractedDownloads.length > 0) {
      return res.status(200).json({ success: true, downloads: extractedDownloads });
    } else {
      return res.status(400).json({ error: 'මෙම Reel එක Extract කිරීමට නොහැකි විය. Link එක Public Reel එකක්දැයි පරීක්ෂා කරන්න.' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Server Error! කරුණාකර නැවත උත්සාහ කරන්න.' });
  }
}
