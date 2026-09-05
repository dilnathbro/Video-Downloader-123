// Validating multiple platforms
const allowedDomains = ['facebook.com', 'fb.watch', 'youtube.com', 'youtu.be', 'instagram.com', 'tiktok.com', 'x.com', 'twitter.com'];

const isSupported = allowedDomains.some(domain => url.includes(domain));

if (!url || !isSupported) {
  return res.status(400).json({ error: 'කරුණාකර සහාය දක්වන (FB, YT, Insta, TikTok) නිවැරදි Link එකක් ලබා දෙන්න.' });
}
