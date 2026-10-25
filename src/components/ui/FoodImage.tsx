import React from 'react';

/**
 * Asks the image CDN for a file sized to how the image is shown (2x for sharp phone screens), so a 96px
 * thumbnail does not download and decode a 600px photo. URLs from other hosts, and data URLs, are left as they are.
 */
export function sizedImageUrl(src: string, displayWidth: number): string {
  if (!src.startsWith('https://images.unsplash.com/')) return src;
  try {
    const url = new URL(src);
    url.searchParams.set('w', String(Math.round(displayWidth * 2)));
    url.searchParams.set('q', '70');
    url.searchParams.set('auto', 'format');
    return url.toString();
  } catch {
    return src;
  }
}

type FoodImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  /** Width the image is drawn at, in CSS pixels. Used to request a right-sized file. */
  displayWidth: number;
  /** Load straight away (images visible on first paint); everything else waits until it is scrolled near. */
  priority?: boolean;
};

/** Food photo that loads lazily, decodes off the main thread and downloads only the size it is shown at. */
export const FoodImage: React.FC<FoodImageProps> = ({ src, displayWidth, priority = false, alt = '', ...rest }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    {...rest}
    src={sizedImageUrl(src, displayWidth)}
    alt={alt}
    loading={priority ? 'eager' : 'lazy'}
    decoding="async"
    // React 18 does not know the camelCase prop yet; the lowercase attribute is passed straight through.
    {...({ fetchpriority: priority ? 'high' : 'auto' } as Record<string, string>)}
  />
);
