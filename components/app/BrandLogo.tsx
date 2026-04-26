"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  framed?: boolean;
  className?: string;
  priority?: boolean;
}

const sizeConfig = {
  xs: {
    className: "h-9 w-[44px]",
    sizes: "44px",
  },
  sm: {
    className: "h-14 w-[72px]",
    sizes: "72px",
  },
  md: {
    className: "h-[72px] w-[90px]",
    sizes: "90px",
  },
  lg: {
    className: "h-[104px] w-[128px]",
    sizes: "128px",
  },
};

export function BrandLogo({
  size = "md",
  framed = false,
  className,
  priority = false,
}: BrandLogoProps) {
  const { className: sizeClassName, sizes } = sizeConfig[size];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        framed && "rounded-xl bg-white px-3 py-2 shadow-sm",
        className,
      )}
    >
      <span className={cn("relative block shrink-0", sizeClassName)}>
        <Image
          src="/brand/afrigoals-logo-trimmed.png"
          alt="Afrigoals logo"
          fill
          priority={priority}
          quality={100}
          className="object-contain"
          sizes={sizes}
        />
      </span>
    </span>
  );
}
