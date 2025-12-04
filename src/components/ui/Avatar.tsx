import React, { useState, useEffect } from "react";
import { cn } from "../../utils/cn";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  className,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [validSrc, setValidSrc] = useState<string | null>(null);

  const sizes = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-2xl",
  };

  /** 
   * ⭐ KEY POINT:
   * Prevent using "" (empty string)
   * Only use avatar if it's a valid URL 
   */
  useEffect(() => {
    if (src && src.trim() !== "") {
      setValidSrc(src);
      setIsImageLoaded(false);
    } else {
      setValidSrc(null);
    }
  }, [src]);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };


  return (
    <div className="relative inline-block">
      {validSrc && !isImageLoaded && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center bg-gray-200 text-transparent",
            sizes[size],
            className
          )}
        >
          ...
        </div>
      )}

      {validSrc ? (
        <img
          src={validSrc}
          alt={alt || name || "User avatar"}
          className={cn(
            "rounded-full object-cover bg-white",
            sizes[size],
            className,
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setValidSrc(null)} // fallback to initials
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center bg-[#06402B] text-white font-medium",
            sizes[size],
            className
          )}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
