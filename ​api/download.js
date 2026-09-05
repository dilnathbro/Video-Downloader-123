export default async function handler(req, res) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // API 1: Cobalt Engine
    const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      if (data.url) {
        return res.status(200).json({ success: true, downloadUrl: data.url, quality: 'HD Video' });
      } else if (data.picker && data.picker.length > 0) {
        return res.status(200).json({ success: true, downloadUrl: data.picker[0].url, quality: 'HD Video' });
      }
    }

    // API 2: RapidAPI Fallback
    const apiKey = "b471d409cdmsh211c752bb04e82dp17c9d2jsn5979857d4cc1";
    const apiHost = "facebook-reel-and-video-downloader.p.rapidapi.com";

    const rapidRes = await fetch(`https://${apiHost}/app/main.php?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      }
    });

    if (rapidRes.ok) {
      const rapidData = await rapidRes.json();
      const videoUrl = rapidData?.links?.['Download High Quality'] || rapidData?.links?.['Download Low Quality'] || rapidData?.hd || rapidData?.sd;

      if (videoUrl) {
        return res.status(200).json({ success: true, downloadUrl: videoUrl, quality: 'Facebook Video' });
      }
    }

    return res.status(404).json({ success: false, message: 'Video link extraction failed. Please check if the video is Public.' });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server processing error', error: error.message });
  }
}
