export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const cobaltRes = await fetch('https://cobalt-api.koyeb.app/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url })
    });

    const data = await cobaltRes.json();

    if (data && data.url) {
      return res.status(200).json({
        success: true,
        downloads: [
          { quality: 'Download Video (MP4)', url: data.url }
        ]
      });
    }

    return res.status(400).json({ error: 'Failed to extract video. Video might be private.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server Connection Error' });
  }
}
