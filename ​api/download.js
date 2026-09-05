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
    // Primary Engine
    const cobaltRes = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url })
    });

    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      if (data && data.url) {
        return res.status(200).json({
          success: true,
          downloads: [{ quality: 'Download Video (HD MP4)', url: data.url }]
        });
      }
    }

    // Secondary Backup Engine
    const backupRes = await fetch(`https://api.v2.iscdl.com/fb?url=${encodeURIComponent(url)}`);
    if (backupRes.ok) {
      const bData = await backupRes.json();
      if (bData.url || bData.sd) {
        let list = [];
        if (bData.url) list.push({ quality: 'Download HD Video', url: bData.url });
        if (bData.sd) list.push({ quality: 'Download SD Video', url: bData.sd });
        return res.status(200).json({ success: true, downloads: list });
      }
    }

    return res.status(400).json({ error: 'වීඩියෝව Private එකක් විය හැක නැතහොත් Extract කිරීමට නොහැකි විය.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server Connection Error.' });
  }
}
