module.exports = async (req, res) => {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'කරුණාකර නිවැරදි Link එකක් ලබා දෙන්න.' });
  }

  try {
    // Universal Media Downloader Engine
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://api.vkrdown.workers.dev/server?vkr=${encodedUrl}`;

    const response = await fetch(apiUrl);

    // Response එක JSON එකක් නෙමෙයි නම් බලන්න
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(500).json({ 
        error: 'Video එක Extract කර ගැනීමට නොහැකි විය. Link එක Public එකක්දැයි පරීක්ෂා කරන්න.' 
      });
    }

    const data = await response.json();

    if (data && (data.data || data.download || data.url)) {
      const downloadUrl = data.data || data.download || data.url || (data.downloads && data.downloads[0]?.url);
      const title = data.title || 'DiL Downloader Video';
      const thumbnail = data.thumbnail || data.cover || '';

      if (downloadUrl) {
        return res.status(200).json({
          title: title,
          thumbnail: thumbnail,
          video_url: downloadUrl
        });
      }
    }

    return res.status(400).json({ 
      error: 'මෙම Link එකෙන් Video එක සොයා ගැනීමට නොහැකි විය. වෙනත් Link එකකින් උත්සාහ කරන්න.' 
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Server Error: වීඩියෝව සකස් කිරීමට නොහැකි විය.' 
    });
  }
};
