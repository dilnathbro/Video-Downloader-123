async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) document.getElementById('videoUrl').value = text;
  } catch (err) {
    alert("කරුණාකර Link එක Paste කිරීමට Permission ලබා දෙන්න.");
  }
}

function clearInput() {
  document.getElementById('videoUrl').value = '';
}

async function fetchVideo() {
  const urlInput = document.getElementById('videoUrl').value.trim();
  const errorMsg = document.getElementById('errorMessage');
  const loading = document.getElementById('loading');
  const resultCard = document.getElementById('resultCard');
  const qualityOptions = document.getElementById('qualityOptions');

  errorMsg.classList.add('hidden');
  resultCard.classList.add('hidden');
  qualityOptions.innerHTML = '';

  if (!urlInput) {
    errorMsg.textContent = "කරුණාකර Facebook Video / Reels Link එකක් ඇතුළත් කරන්න.";
    errorMsg.classList.remove('hidden');
    return;
  }

  loading.classList.remove('hidden');

  try {
    // Calling Vercel Backend API Route
    const res = await fetch(`/api/download?url=${encodeURIComponent(urlInput)}`);
    const data = await res.json();

    if (res.ok && data.downloads) {
      data.downloads.forEach(item => {
        const btn = document.createElement('a');
        btn.href = item.url;
        btn.target = '_blank';
        btn.download = 'facebook-video.mp4';
        btn.className = 'bg-slate-800 hover:bg-slate-700 border border-blue-500/30 text-white font-semibold py-3.5 px-5 rounded-2xl flex items-center justify-between transition shadow active:scale-95';
        btn.innerHTML = `
          <span class="flex items-center gap-2.5 text-sm truncate pr-2">
            <i class="fa-brands fa-facebook text-blue-400"></i> ${item.quality}
          </span>
          <span class="text-xs bg-blue-600/30 border border-blue-500/40 px-3 py-1.5 rounded-xl text-blue-300 font-bold whitespace-nowrap">
            Download <i class="fa-solid fa-download text-xs ml-1"></i>
          </span>
        `;
        qualityOptions.appendChild(btn);
      });
      resultCard.classList.remove('hidden');
    } else {
      errorMsg.textContent = data.error || "මෙම වීඩියෝව Extract කිරීමට නොහැකි විය.";
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.textContent = "Server සම්බන්ධතාවයේ දෝෂයක් ඇත. කරුණාකර නැවත උත්සාහ කරන්න.";
    errorMsg.classList.remove('hidden');
  }

  loading.classList.add('hidden');
}
