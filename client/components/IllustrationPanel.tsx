'use client';

import DrawCanvas from './DrawCanvas';

interface IllustrationPanelProps {
  imageUrl: string;
  alt?: string;
  drawEnabled: boolean;
  onCircleSubmit?: (dataUrl: string) => void;
}

// Full-width illustration with a transparent DrawCanvas overlay.
// drawEnabled toggles whether the user can circle/draw on the image.
export default function IllustrationPanel({
  imageUrl,
  alt = 'Story illustration',
  drawEnabled,
  onCircleSubmit,
}: IllustrationPanelProps) {
  return (
    <div className="relative w-full bg-gray-900" style={{ aspectRatio: '16/9' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
      />
      <DrawCanvas enabled={drawEnabled} onSubmit={onCircleSubmit} />
    </div>
  );
}
