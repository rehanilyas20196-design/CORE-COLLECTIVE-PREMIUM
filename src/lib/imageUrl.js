const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.gif', '.avif', '.svg'];
const BLOCKED_EXTENSIONS = ['.heic', '.heif', '.bmp', '.tif', '.tiff', '.psd', '.ai', '.zip', '.rar', '.mp4', '.pdf'];

const STORAGE_HOST = 'izqxsfuyibbzwdxdcmev.supabase.co';
const PROPER_HOST = `https://${STORAGE_HOST}`;
const PROPER_LINK_EXAMPLE = `${PROPER_HOST}/storage/v1/object/public/Products/Electronics/your-image.jpg`;

const VIEWER_HOSTS = [
  { host: 'docs.google.com', label: 'Google Docs' },
  { host: 'dropbox.com', label: 'Dropbox' },
  { host: 'www.dropbox.com', label: 'Dropbox' },
  { host: 'photos.google.com', label: 'Google Photos' },
  { host: 'icloud.com', label: 'iCloud' },
  { host: 'www.icloud.com', label: 'iCloud' },
  { host: 'flickr.com', label: 'Flickr' },
  { host: 'www.flickr.com', label: 'Flickr' },
  { host: 'imgur.com', label: 'Imgur' },
  { host: 'facebook.com', label: 'Facebook' },
  { host: 'instagram.com', label: 'Instagram' },
  { host: 'twitter.com', label: 'X' },
  { host: 'x.com', label: 'X' },
];

function extensionOf(value) {
  const path = value.split('?')[0].split('#')[0];
  const lastSegment = path.slice(path.lastIndexOf('/') + 1);
  const dot = lastSegment.lastIndexOf('.');
  if (dot <= 0) return '';
  return lastSegment.slice(dot).toLowerCase();
}

/**
 * Validates a product image URL before it is saved.
 * Returns { ok: true } or { ok: false, message, suggestion?, hint? }.
 * `suggestion` is a fixed URL the user can accept with one click.
 * `hint` is guidance only (no automatic fix).
 */
export function validateImageUrl(value) {
  const raw = (value || '').trim();
  if (!raw) return { ok: true };

  if (!/^https?:\/\//i.test(raw)) {
    return {
      ok: false,
      message: 'Link must start with https://',
    };
  }

  if (/^http:\/\//i.test(raw)) {
    return {
      ok: false,
      message: 'Use https:// — plain http:// links are blocked by the browser.',
    };
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, message: 'This is not a valid link.' };
  }

  const viewer = VIEWER_HOSTS.find(v => parsed.hostname === v.host || parsed.hostname.endsWith(`.${v.host}`));
  if (viewer) {
    return {
      ok: false,
      message: `${viewer.label} links open a web page, not the image file, so the image shows as broken.`,
      hint: `Upload the image to our own storage and paste a ${PROPER_HOST}/... link instead.`,
    };
  }

  if (parsed.hostname === 'drive.google.com' || parsed.hostname.endsWith('.drive.google.com')) {
    if (parsed.pathname === '/uc' && /export=(view|download)/.test(parsed.search)) {
      return {
        ok: false,
        message: 'Google Drive links can stop working at any time, so they are not accepted.',
        hint: `Upload the image to our own storage and paste a ${PROPER_HOST}/... link instead.`,
      };
    }
    return {
      ok: false,
      message: 'Google Drive links open a web page, not the image file, so the image shows as broken.',
      hint: `Upload the image to our own storage and paste a ${PROPER_HOST}/... link instead.`,
    };
  }

  const ext = extensionOf(raw);
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return {
      ok: false,
      message: `${ext} files cannot be shown on the site.`,
      suggestion: `Convert it to ${ALLOWED_EXTENSIONS[0]} first.`,
    };
  }

  if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      ok: false,
      message: `${ext} is not an allowed image format.`,
      suggestion: null,
      hint: `Allowed formats: ${ALLOWED_EXTENSIONS.join(' ')}`,
    };
  }

  if (/\s/.test(raw)) {
    return {
      ok: false,
      message: 'The link contains spaces.',
      suggestion: raw.replace(/ /g, '%20'),
    };
  }

  return { ok: true };
}

export { ALLOWED_EXTENSIONS, BLOCKED_EXTENSIONS, STORAGE_HOST, PROPER_HOST, PROPER_LINK_EXAMPLE };
