 export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'කරුණාකර Facebook Link එකක් ඇතුළත් කරන්න.' });
  }

  try {
    // Engine 1: Cobalt Engine Proxy (Fastest & Public Open Source API)
    const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        vQuality: 'max'
      })
    });

    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      if (data.status === 'redirect' || data.status === 'stream' || data.status === 'picker') {
        const videoUrl = data.url || (data.picker && data.picker[0] ? data.picker[0].url : null);
        if (videoUrl) {
          return res.status(200).json({
            success: true,
            downloads: [
              { quality: 'Download HD Video (MP4)', url: videoUrl }
            ]
          });
        }
      }
    }

    // Engine 2: Fallback Engine
    const fallbackRes = await fetch(`https://api.v2.iscdl.com/fb?url=${encodeURIComponent(url)}`);
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      let downloads = [];
      if (fbData.url) downloads.push({ quality: 'Download HD Video (MP4)', url: fbData.url });
      if (fbData.sd) downloads.push({ quality: 'Download SD Video (MP4)', url: fbData.sd });

      if (downloads.length > 0) {
        return res.status(200).json({ success: true, downloads });
      }
    }

    return res.status(400).json({ error: 'මෙම Reel/Video එක Extract කිරීමට නොහැකි විය. Link එක Public එකක්දැයි පරීක්ෂා කරන්න.' });

  } catch (err) {
    return res.status(500).json({ error: 'Server Error එකක් සිදු විය. පසුව නැවත උත්සාහ කරන්න.' });
  }
}
