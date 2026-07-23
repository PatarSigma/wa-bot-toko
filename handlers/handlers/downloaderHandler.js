const axios = require('axios');

async function downloadTiktok(url) {
  try {
    const res = await axios.get('https://www.tikwm.com/api/', {
      params: { url },
      timeout: 20000,
    });

    const data = res.data?.data;
    if (!data || !data.play) return null;

    return {
      videoUrl: data.play,
      title: data.title || 'Video TikTok',
    };
  } catch (err) {
    console.error('[DOWNLOADER-TIKTOK] Error:', err.message);
    return null;
  }
}

async function downloadInstagram(url) {
  try {
    const res = await axios.get('https://api.ferdev.my.id/downloader/instagram', {
      params: { link: url },
      timeout: 20000,
    });

    const data = res.data?.data;
    if (!data || !data.length) return null;

    return data.map((item) => item.url);
  } catch (err) {
    console.error('[DOWNLOADER-IG] Error:', err.message);
    return null;
  }
}

module.exports = { downloadTiktok, downloadInstagram };
