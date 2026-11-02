import Image from "next/image";
import { unsplashUrl, type Photo as PhotoData } from "@/data/photos";

/**
 * Responsive photo. The curator's own photos go through next/image so large
 * originals get resized and compressed; Unsplash resizes on its own CDN, so
 * those use a plain srcset.
 */
export function Photo({
  photo,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className = "",
  priority = false,
  decorative = false,
}: {
  photo: PhotoData;
  sizes?: string;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  const cls = `h-full w-full bg-surface-2 object-cover ${className}`;
  const alt = decorative ? "" : photo.alt;

  if (photo.kind === "local") {
    return (
      <Image
        src={photo.src}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        alt={alt}
        priority={priority}
        quality={75}
        className={cls}
      />
    );
  }

  const widths = [400, 640, 960, 1400, 2000];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={unsplashUrl(photo.id, 960)}
      srcSet={widths.map((w) => `${unsplashUrl(photo.id, w)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cls}
    />
  );
}
