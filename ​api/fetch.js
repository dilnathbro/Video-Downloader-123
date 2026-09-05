module.exports = async (req, res) => {
  // CORS Headers Set කිරීම
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
    // Cobalt API හරහා Video Link එක Extract කිරීම
    const apiResponse = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        videoQuality: '720'
      })
    });

    const data = await apiResponse.json();

    if (data.status === 'stream' || data.status === 'redirect') {
      return res.status(200).json({
        title: 'DiL Downloader Video',
        thumbnail: '',
        video_url: data.url
      });
    } else if (data.status === 'picker' && data.picker && data.picker.length > 0) {
      return res.status(200).json({
        title: 'DiL Downloader Video',
        thumbnail: data.picker[0].thumb || '',
        video_url: data.picker[0].url
      });
    } else {
      return res.status(400).json({ 
        error: data.text || 'වීඩියෝ Link එක සොයා ගැනීමට නොහැකි විය. Private Videos සඳහා සහාය නොදක්වයි.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error: වීඩියෝව Extract කිරීමට නොහැකි විය.' });
  }
};
