const imageCache: Record<string, HTMLImageElement> = {};

export function preloadGif(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (imageCache[src]) {
      resolve(imageCache[src]);
      return;
    }
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = reject;
  });
}

export function getCachedGif(src: string): HTMLImageElement | undefined {
  return imageCache[src];
} 