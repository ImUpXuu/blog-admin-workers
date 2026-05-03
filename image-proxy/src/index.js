export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Proxy Image: /proxy/image/2026/02/14/xxx.jpg
    if (path.startsWith('/proxy/image/')) {
      const imagePath = path.replace('/proxy/image/', '');
      const imageUrl = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/images/${imagePath}`;
      
      const imageRes = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Cloudflare-Worker-Image-Proxy',
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`
        }
      });
      
      if (!imageRes.ok) {
        return new Response('Image not found', { status: 404 });
      }
      
      const newHeaders = new Headers(imageRes.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Cache-Control', 'public, max-age=31536000');
      newHeaders.set('Content-Type', getContentType(imagePath));
      
      return new Response(imageRes.body, {
        status: imageRes.status,
        headers: newHeaders
      });
    }

    // Get Index: /proxy/index/2026-02.json or /proxy/index/master.json
    if (path.startsWith('/proxy/index/')) {
      const indexFile = path.replace('/proxy/index/', '');
      const indexUrl = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/index/${indexFile}`;
      
      const indexRes = await fetch(indexUrl, {
        headers: {
          'User-Agent': 'Cloudflare-Worker-Image-Proxy',
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`
        }
      });
      
      if (!indexRes.ok) {
        return new Response('Index not found', { status: 404 });
      }
      
      const newHeaders = new Headers(indexRes.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Cache-Control', 'public, max-age=3600');
      newHeaders.set('Content-Type', 'application/json');
      
      return new Response(indexRes.body, {
        status: indexRes.status,
        headers: newHeaders
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

function getContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  return types[ext] || 'application/octet-stream';
}
