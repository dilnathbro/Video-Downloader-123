const { exec } = require('child_process');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'කරුණාකර නිවැරදි Link එකක් ලබා දෙන්න.' });
  }

  // Execute yt-dlp command
  const command = `npx yt-dlp-exec -j --no-playlist "${url}"`;

  exec(command, (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: 'වීඩියෝ Link එක සොයා ගැනීමට නොහැකි විය. Video එක Public දැයි පරීක්ෂා කරන්න.' });
    }

    try {
      const info = JSON.parse(stdout);
      res.status(200).json({
        title: info.title || 'Video',
        thumbnail: info.thumbnail || '',
        video_url: info.url || info.webpage_url
      });
    } catch (e) {
      res.status(500).json({ error: 'Data parse කර ගැනීමට නොහැකි විය.' });
    }
  });
};

