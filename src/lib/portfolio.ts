import albumsMeta from '../content/portfolio.json';
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/portfolio/*/*.{webp,jpg,jpeg,png}',
  { eager: true },
);

export type AlbumMeta = (typeof albumsMeta)[number];

export type AlbumPhoto = {
  src: ImageMetadata;
  filename: string;
};

export type Album = AlbumMeta & {
  cover: ImageMetadata;
  photos: AlbumPhoto[];
};

function photosForSlug(slug: string): AlbumPhoto[] {
  return Object.entries(images)
    .filter(([path]) => path.includes(`/portfolio/${slug}/`))
    .map(([path, mod]) => ({
      src: mod.default,
      filename: path.split('/').pop() ?? '',
    }))
    .sort((a, b) =>
      a.filename.localeCompare(b.filename, undefined, { numeric: true }),
    );
}

export function getAlbums(): Album[] {
  return albumsMeta.map((meta) => {
    const photos = photosForSlug(meta.slug);
    const cover =
      photos.find((photo) => photo.filename.toLowerCase().startsWith('cover.'))
        ?.src ?? photos[0]?.src;

    if (!cover) {
      throw new Error(
        `Album "${meta.slug}" has no images in src/assets/portfolio/${meta.slug}/`,
      );
    }

    return { ...meta, cover, photos };
  });
}

export function getAlbum(slug: string): Album | undefined {
  return getAlbums().find((album) => album.slug === slug);
}
