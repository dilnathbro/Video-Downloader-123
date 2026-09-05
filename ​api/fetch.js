module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'කරුණාකර Link එකක් ලබා දෙන්න.' });

  try {
    // Multi-service fallback API
    const targetUrl = `https://api.vkrdown.workers.dev/server?vkr=${encodeURIComponent(url)}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    const apiRes = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    const contentType = apiRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(500).json({ error: 'මෙම Video Link එක Process කිරීමට නොහැකි විය.' });
    }

    const data = await apiRes.json();

    const mediaUrl = data.data || data.download || data.url || (data.downloads && data.downloads[0]?.url);

    if (mediaUrl) {
      return res.status(200).json({
        title: data.title || 'DiL Downloader Video',
        video_url: mediaUrl
      });
    }

    return res.status(400).json({ error: 'Video එක සොයාගත නොහැකි විය. Private Videos සඳහා සහාය නොදක්වයි.' });

  } catch (err) {
    return res.status(500).json({ error: 'සර්වර් එක සම්බන්ධ කර ගැනීමට නොහැකි විය. නැවත උත්සාහ කරන්න.' });
  }
};
