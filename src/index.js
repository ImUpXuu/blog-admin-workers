
import { ADMIN_HTML } from './html.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve Admin HTML
    // Support client-side routing: /, /admin, /new, /list, /gallery, /settings, /edit/*
    if (path === '/' || path === '/admin' || path === '/new' || path === '/list' || path === '/gallery' || path === '/settings' || path.startsWith('/edit/')) {
      return new Response(ADMIN_HTML, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

      // Proxy Image (Public Access) - Old images from myblog repo
    if (path.startsWith('/image/')) {
        const filename = path.replace('/image/', '');
        const imageUrl = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/${env.IMAGE_PATH}/${filename}`;

        const imageRes = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Cloudflare-Worker-Blog-Admin',
                'Authorization': `Bearer ${env.GITHUB_TOKEN}` // Use token for private repos
            }
        });

        if (!imageRes.ok) return new Response('Image not found', { status: 404 });

        const newHeaders = new Headers(imageRes.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        return new Response(imageRes.body, {
            status: imageRes.status,
            headers: newHeaders
        });
    }

    // Proxy Image (Public Access) - New images from photo repo
    if (path.startsWith('/img/')) {
        const filename = path.replace('/img/', '');
        const PHOTO_OWNER = 'ImUpXuu';
        const PHOTO_REPO = 'photo';
        const PHOTO_BRANCH = 'main';
        const PHOTO_PATH = 'images';

        // Encode each path segment to handle year/month/day structure
        const encodedPath = filename.split('/').map(encodeURIComponent).join('/');
        const imageUrl = `https://raw.githubusercontent.com/${PHOTO_OWNER}/${PHOTO_REPO}/${PHOTO_BRANCH}/${PHOTO_PATH}/${encodedPath}`;

        const imageRes = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Cloudflare-Worker-Blog-Admin',
                'Authorization': `Bearer ${env.GITHUB_TOKEN}`
            }
        });

        if (!imageRes.ok) return new Response('Image not found', { status: 404 });

        const newHeaders = new Headers(imageRes.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Cache-Control', 'public, max-age=31536000');

        return new Response(imageRes.body, {
            status: imageRes.status,
            headers: newHeaders
        });
    }

    // API Routes
    if (path.startsWith('/api/')) {
      // Auth check
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      const apiPath = path.replace('/api', '');

      // List Posts
      if ((apiPath === '/posts' || apiPath === '/list') && request.method === 'GET') {
        return await listGitHubFiles(env, env.POSTS_PATH);
      }

      // List Images (from photo repo)
      if (apiPath === '/images' && request.method === 'GET') {
        return await listPhotoImages(env);
      }

      // Get Post
      if (apiPath.startsWith('/post/') && request.method === 'GET') {
        const filename = decodeURIComponent(apiPath.replace('/post/', ''));
        return await getGitHubFile(env, `${env.POSTS_PATH}/${filename}`);
      }

      // Create/Update Post
      if (apiPath.startsWith('/post/') && request.method === 'PUT') {
        const filename = decodeURIComponent(apiPath.replace('/post/', ''));
        const body = await request.json();
        
        let sha = body.sha;
        
        // Safety check: if no sha provided, check if file exists to get sha (avoid "sha wasn't supplied" error)
        if (!sha) {
            const checkRes = await githubRequest(env, `${env.POSTS_PATH}/${filename}`);
            if (checkRes.ok) {
                const existing = await checkRes.json();
                sha = existing.sha;
            }
        }
        
        const updateRes = await updateGitHubFile(env, `${env.POSTS_PATH}/${filename}`, body.content, sha, `Update ${filename} via Admin`);
        
        // Auto submit to IndexNow
        if (updateRes.status === 200 || updateRes.status === 201) {
            const slug = filename.replace(/\.md$/, '');
            const postUrl = `https://upxuu.com/posts/${slug}`;
            
            // Note: We need to clone the response if we want to read its body, 
            // but updateGitHubFile returns a new Response object which we can modify directly if we built it.
            // However, updateRes is already built.
            // To add data to it, we should parse it, add data, and rebuild response.
            
            const data = await updateRes.json();
            
            // Add IndexNow status to response
            data.indexNow = { status: 'pending', url: postUrl };
            
            ctx.waitUntil((async () => {
                console.log(`[IndexNow] Starting submission for: ${postUrl}`);
                try {
                    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Host': 'api.indexnow.org'
                        },
                        body: JSON.stringify({
                            "host": "upxuu.com",
                            "key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                            "keyLocation": "https://upxuu.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.txt",
                            "urlList": [ postUrl ]
                        })
                    });
                    
                    if (indexNowRes.ok) {
                        console.log(`[IndexNow] Success: ${postUrl}`);
                    } else {
                        const errText = await indexNowRes.text();
                        console.error(`[IndexNow] Failed: ${indexNowRes.status} ${indexNowRes.statusText} - ${errText}`);
                    }
                } catch (err) {
                    console.error('[IndexNow] Exception:', err);
                }
            })());
            
            return new Response(JSON.stringify(data), { 
                status: updateRes.status,
                headers: updateRes.headers
            });
        }
        
        return updateRes;
      }
      
      // Delete Post
      if (apiPath.startsWith('/post/') && request.method === 'DELETE') {
         const filename = decodeURIComponent(apiPath.replace('/post/', ''));
         const body = await request.json();
         return await deleteGitHubFile(env, `${env.POSTS_PATH}/${filename}`, body.sha, `Delete ${filename} via Admin`);
      }

      // Delete Image
      if (apiPath.startsWith('/image/') && request.method === 'DELETE') {
         const filename = decodeURIComponent(apiPath.replace('/image/', ''));
         const body = await request.json();
         return await deleteGitHubFile(env, `${env.IMAGE_PATH}/${filename}`, body.sha, `Delete image ${filename} via Admin`);
      }
      
      // Delete Image (new photo repo)
      if (apiPath.startsWith('/img/') && request.method === 'DELETE') {
         const filename = decodeURIComponent(apiPath.replace('/img/', ''));
         const body = await request.json();
         return await deletePhotoImage(env, filename, body.sha);
      }

      // Upload Image
      if (apiPath === '/upload' && request.method === 'POST') {
          const body = await request.json(); // { filename, content: base64 }
          const PHOTO_OWNER = 'ImUpXuu';
          const PHOTO_REPO = 'photo';
          const PHOTO_BRANCH = 'main';
          const PHOTO_PATH = 'images';
          const path = `${PHOTO_PATH}/${body.filename}`;

          // DIRECTLY upload to GitHub with provided base64 content
          // Do NOT use updateGitHubFile because it attempts to re-encode UTF-8, corrupting binaries

          const encodedPath = path.split('/').map(encodeURIComponent).join('/');
          const ghUrl = `https://api.github.com/repos/${PHOTO_OWNER}/${PHOTO_REPO}/contents/${encodedPath}?ref=${PHOTO_BRANCH}`;
          const ghHeaders = {
              'User-Agent': 'Cloudflare-Worker-Blog-Admin',
              'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
          };

          const ghBody = {
            message: `Upload image ${body.filename}`,
            content: body.content, // Already base64 from frontend
            branch: PHOTO_BRANCH
          };

          const ghRes = await fetch(ghUrl, {
              method: 'PUT',
              headers: ghHeaders,
              body: JSON.stringify(ghBody)
          });

          if (ghRes.status === 200 || ghRes.status === 201) {
              const workerUrl = url.origin;
              return new Response(JSON.stringify({
                  url: `${workerUrl}/img/${body.filename}`
              }), { headers: corsHeaders });
          }

          const err = await ghRes.json();
          return new Response(JSON.stringify(err), { status: ghRes.status });
      }

      // Get Settings Files
      if (apiPath === '/settings' && request.method === 'GET') {
          const configRes = await githubRequest(env, 'src/config.ts');
          const layoutRes = await githubRequest(env, 'src/layouts/Layout.astro');
          
          if (!configRes.ok || !layoutRes.ok) {
              return new Response('Failed to fetch settings files', { status: 500 });
          }
          
          const configData = await configRes.json();
          const layoutData = await layoutRes.json();
          
          const decode = (base64) => {
              const bin = atob(base64.replace(/\n/g, ''));
              return new TextDecoder('utf-8').decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
          };
          
          return new Response(JSON.stringify({
              config: {
                  content: decode(configData.content),
                  sha: configData.sha
              },
              layout: {
                  content: decode(layoutData.content),
                  sha: layoutData.sha
              }
          }), { headers: { 'Content-Type': 'application/json' } });
      }
      
      // Update Settings File
      if (apiPath === '/settings' && request.method === 'PUT') {
          const body = await request.json();
          let path = '';
          if (body.file === 'config') path = 'src/config.ts';
          else if (body.file === 'layout') path = 'src/layouts/Layout.astro';
          else return new Response('Invalid file type', { status: 400 });
          
          return await updateGitHubFile(env, path, body.content, body.sha, `Update ${body.file} via Admin Settings`);
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};

// GitHub API Helpers
async function githubRequest(env, path, method = 'GET', body = null) {
  // Ensure path is encoded, but don't double encode slashes if they are path separators
  // The best way is to encode each segment
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodedPath}?ref=${env.GITHUB_BRANCH}`;
  const headers = {
    'User-Agent': 'Cloudflare-Worker-Blog-Admin',
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  return res;
}

async function listGitHubFiles(env, path) {
  // Use GraphQL to get file contents (frontmatter) for the list
  // This allows us to show real titles and dates without N+1 requests
  const query = `
    query($owner: String!, $repo: String!, $path: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $path) {
          ... on Tree {
            entries {
              name
              type
              oid
              object {
                ... on Blob {
                  text
                }
              }
            }
          }
        }
      }
    }
  `;

  // Path format for expression: "branch:path/to/dir"
  const expression = `${env.GITHUB_BRANCH}:${path}`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'User-Agent': 'Cloudflare-Worker-Blog-Admin',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        owner: env.GITHUB_OWNER,
        repo: env.GITHUB_REPO,
        path: expression
      }
    })
  });

  const data = await res.json();
  
  if (!res.ok || data.errors) {
      // Fallback to REST API if GraphQL fails
      console.error('GraphQL Error:', data.errors);
      return listGitHubFilesRest(env, path);
  }

  const entries = data.data.repository.object?.entries || [];
  
  const files = entries.map(entry => {
    let title = entry.name;
    let date = null;
    let sha = null; // GraphQL doesn't return SHA in this view easily, but we can update logic if needed. 
    // Actually we need SHA for delete/update. 
    // Wait, the previous REST API returned SHA. 
    // We can get OID (SHA) from GraphQL.
    
    // Parse Frontmatter
    if (entry.object && entry.object.text) {
        const text = entry.object.text;
        const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
            const fm = fmMatch[1];
            const titleMatch = fm.match(/^title:\s*(["']?)(.*)\1$/m);
            if (titleMatch) title = titleMatch[2];
            
            const dateMatch = fm.match(/^published:\s*(.*)$/m);
            if (dateMatch) date = dateMatch[1].trim();
        }
    }
    
    return {
      name: entry.name,
      path: `${path}/${entry.name}`,
      sha: entry.oid,
      title: title,
      date: date,
      type: entry.type === 'tree' ? 'dir' : 'file'
    };
  });
  
  // Since we need SHA for delete, and GraphQL 'oid' is the SHA.
  // Let's refetch with OID included.
  return new Response(JSON.stringify(files), { headers: { 'Content-Type': 'application/json' } });
}

async function listGitHubImages(env, path) {
    // Use GraphQL to just get names of files in image directory
    const query = `
      query($owner: String!, $repo: String!, $path: String!) {
        repository(owner: $owner, name: $repo) {
          object(expression: $path) {
            ... on Tree {
               entries {
                 name
                 type
                 oid
               }
             }
          }
        }
      }
    `;
  
    const expression = `${env.GITHUB_BRANCH}:${path}`;
  
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'User-Agent': 'Cloudflare-Worker-Blog-Admin',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          owner: env.GITHUB_OWNER,
          repo: env.GITHUB_REPO,
          path: expression
        }
      })
    });
  
    const data = await res.json();
    
    if (!res.ok || data.errors) {
        return listGitHubFilesRest(env, path);
    }
  
    const entries = data.data.repository.object?.entries || [];
    
    // Filter only images (simple check)
    const images = entries
        .filter(e => e.type === 'blob' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(e.name))
        .map(e => ({
            name: e.name,
            path: `${path}/${e.name}`,
            sha: e.oid
        }));
    
    return new Response(JSON.stringify(images), { headers: { 'Content-Type': 'application/json' } });
}

async function listPhotoImages(env) {
    const PHOTO_OWNER = 'ImUpXuu';
    const PHOTO_REPO = 'photo';
    const PHOTO_BRANCH = 'main';
    const PHOTO_PATH = 'images';

    const query = `
      query($owner: String!, $repo: String!, $path: String!) {
        repository(owner: $owner, name: $repo) {
          object(expression: $path) {
            ... on Tree {
               entries {
                 name
                 type
                 oid
               }
            }
          }
        }
      }
    `;

    async function getEntries(path) {
        const expression = `${PHOTO_BRANCH}:${path}`;
        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'User-Agent': 'Cloudflare-Worker-Blog-Admin',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: {
              owner: PHOTO_OWNER,
              repo: PHOTO_REPO,
              path: expression
            }
          })
        });
        const data = await res.json();
        return data.data?.repository?.object?.entries || [];
    }

    async function getImagesRecursive(basePath) {
        const entries = await getEntries(basePath);
        const images = [];

        for (const entry of entries) {
            if (entry.type === 'blob') {
                if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
                    const fullPath = `${basePath}/${entry.name}`.replace(`${PHOTO_PATH}/`, '');
                    images.push({
                        name: entry.name,
                        path: fullPath,
                        sha: entry.oid
                    });
                }
            } else if (entry.type === 'tree') {
                const subImages = await getImagesRecursive(`${basePath}/${entry.name}`);
                images.push(...subImages);
            }
        }

        return images;
    }

    const allImages = await getImagesRecursive(PHOTO_PATH);
    return new Response(JSON.stringify(allImages), { headers: { 'Content-Type': 'application/json' } });
}

async function deletePhotoImage(env, filename, sha) {
    const PHOTO_OWNER = 'ImUpXuu';
    const PHOTO_REPO = 'photo';
    const PHOTO_BRANCH = 'main';
    const PHOTO_PATH = 'images';
    const path = `${PHOTO_PATH}/${filename}`;

    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const ghUrl = `https://api.github.com/repos/${PHOTO_OWNER}/${PHOTO_REPO}/contents/${encodedPath}?ref=${PHOTO_BRANCH}`;
    const ghHeaders = {
        'User-Agent': 'Cloudflare-Worker-Blog-Admin',
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
    };

    const ghBody = {
        message: `Delete image ${filename} via Admin`,
        sha: sha,
        branch: PHOTO_BRANCH
    };

    const ghRes = await fetch(ghUrl, {
        method: 'DELETE',
        headers: ghHeaders,
        body: JSON.stringify(ghBody)
    });

    return new Response(JSON.stringify(await ghRes.json()), { status: ghRes.status });
}

// Fallback REST function
async function listGitHubFilesRest(env, path) {
  const res = await githubRequest(env, path);
  const data = await res.json();
  if (!res.ok) return new Response(JSON.stringify(data), { status: res.status });
  
  const files = Array.isArray(data) ? data.map(f => ({
    name: f.name,
    path: f.path,
    sha: f.sha,
    type: f.type,
    title: f.name, // Fallback
    date: null
  })) : [];
  
  return new Response(JSON.stringify(files), { headers: { 'Content-Type': 'application/json' } });
}

async function getGitHubFile(env, path) {
  const res = await githubRequest(env, path);
  const data = await res.json();
  if (!res.ok) return new Response(JSON.stringify(data), { status: res.status });
  
  // Content is base64 encoded
  const content = atob(data.content.replace(/\n/g, ''));
  // Decode UTF-8 properly
  const decoder = new TextDecoder('utf-8');
  const rawContent = decoder.decode(Uint8Array.from(content, c => c.charCodeAt(0)));
  
  return new Response(JSON.stringify({
    content: rawContent,
    sha: data.sha
  }), { headers: { 'Content-Type': 'application/json' } });
}

async function updateGitHubFile(env, path, content, sha, message) {
  // Encode content to base64 (UTF-8 safe)
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(content);
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64Content = btoa(binaryString);

  const body = {
    message: message,
    content: base64Content,
    branch: env.GITHUB_BRANCH
  };
  if (sha) body.sha = sha;

  const res = await githubRequest(env, path, 'PUT', body);
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

async function deleteGitHubFile(env, path, sha, message) {
    const body = {
        message: message,
        sha: sha,
        branch: env.GITHUB_BRANCH
    };
    const res = await githubRequest(env, path, 'DELETE', body);
    return new Response(JSON.stringify(await res.json()), { status: res.status });
}
