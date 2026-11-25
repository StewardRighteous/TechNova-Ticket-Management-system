interface LogoMarkProps {
  src: string;
  alt?: string;
  variant?: "default" | "compact";
}

export function LogoMark({ src, alt = "", variant = "default" }: LogoMarkProps) {
  const className = variant === "compact"
    ? "size-5 shrink-0 rounded object-contain"
    : "size-full bg-white p-1 object-contain";

  if (/^\/?[^:/#]+\.svg#.+$/.test(src)) {
    return (
      <svg className={className} viewBox="0 0 32 32" role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={!alt}>
        <use href={src.startsWith("/") ? src : `/${src}`} />
      </svg>
    );
  }

  return <img src={src} alt={alt} className={className} />;
}
