import { photoUrl, type Photo as PhotoData } from "@/data/photos";

/**
 * Responsive Unsplash image. Unsplash resizes on its CDN, so we skip
 * next/image and build the srcset directly.
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
  const widths = [400, 640, 960, 1400, 2000];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(photo, 960)}
      srcSet={widths.map((w) => `${photoUrl(photo, w)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={decorative ? "" : photo.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`h-full w-full bg-surface-2 object-cover ${className}`}
    />
  );
}
