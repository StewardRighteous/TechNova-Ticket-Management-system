import React, { useState } from "react";

interface StaffAvatarProps {
  src: string;
  alt: string;
  sizeClassName: string;
  fallbackClassName?: string;
}

/** Displays a staff photo when available and keeps icon-only records compatible. */
export const StaffAvatar: React.FC<StaffAvatarProps> = ({
  src,
  alt,
  sizeClassName,
  fallbackClassName = "text-[17px]",
}) => {
  const [hasError, setHasError] = useState(false);
  const isImage = src.startsWith("http") || src.startsWith("/");

  if (!isImage || hasError) {
    return (
      <span aria-hidden="true" className={`material-symbols-outlined ${fallbackClassName}`}>
        person
      </span>
    );
  }

  return <img src={src} alt={alt} onError={() => setHasError(true)} className={`${sizeClassName} rounded-full object-cover`} loading="lazy" />;
};
