const BASE = import.meta.env.VITE_API_URL || '';

export default function imgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}
