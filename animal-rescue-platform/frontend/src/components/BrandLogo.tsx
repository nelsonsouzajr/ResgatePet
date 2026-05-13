import { useState } from 'react';

type BrandLogoVariant = 'symbol' | 'wordmark';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  alt?: string;
}

const sourceByVariant: Record<BrandLogoVariant, string> = {
  symbol: '/brand/resgatepet-symbol.png',
  wordmark: '/brand/resgatepet-wordmark.png',
};

export function BrandLogo({
  variant = 'symbol',
  className,
  alt = 'ResgatePet',
}: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    if (variant === 'wordmark') {
      return <p className="text-2xl font-black text-brand">ResgatePet</p>;
    }

    return (
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-black text-white">
        RP
      </div>
    );
  }

  return (
    <img
      src={sourceByVariant[variant]}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}