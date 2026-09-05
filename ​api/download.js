export default async function handler(req, res) {
  // Allow CORS
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
    // Universal Facebook Video Extraction API
    const apiUrl = `https://api.v2.iscdl.com/fb?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      let downloads = [];

      if (data.url) {
        downloads.push({ quality: 'Download HD Video (MP4)', url: data.url });
      }
      if (data.sd) {
        downloads.push({ quality: 'Download SD Video (MP4)', url: data.sd });
      }

      if (downloads.length > 0) {
        return res.status(200).json({ success: true, downloads });
      }
    }

    // Fallback Method
    const fallbackRes = await fetch(`https://api.douyin.wtf/api?url=${encodeURIComponent(url)}`);
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      if (fbData.video_data && fbData.video_data.nwm_url) {
        return res.status(200).json({
          success: true,
          downloads: [{ quality: 'Download Video (MP4)', url: fbData.video_data.nwm_url }]
        });
      }
    }

    return res.status(400).json({ error: 'මෙම වීඩියෝව Extracted කිරීමට නොහැකි විය. Link එක Public එකක්දැයි පරීක්‍ෂා කරන්න.' });

  } catch (err) {
    return res.status(200).json({
      error: 'වීඩියෝ Link එක Fetch කිරීමට නොහැකි විය. වෙනත් Facebook Public Video Link එකක් දමා උත්සාහ කරන්න.'
    });
  }
}
