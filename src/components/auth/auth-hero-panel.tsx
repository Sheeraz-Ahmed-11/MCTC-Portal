import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { teko } from "@/lib/fonts/teko";
import { cn } from "@/lib/utils";

type AuthHeroPanelProps = {
  image: StaticImageData;
  imageAlt: string;
  eyebrow: string;
  title: ReactNode;
  priority?: boolean;
};

export function AuthHeroPanel({
  image,
  imageAlt,
  eyebrow,
  title,
  priority = false,
}: AuthHeroPanelProps) {
  return (
    <div className="relative hidden h-full min-h-0 overflow-hidden lg:block">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="50vw"
        quality={75}
        className="object-cover brightness-[0.4]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-[#a33030]/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-10">
        <p
          className={cn(
            teko.className,
            "text-xs font-medium uppercase tracking-widest text-white/50",
          )}
        >
          {eyebrow}
        </p>
        <p
          className={cn(
            teko.className,
            "mt-2 text-3xl font-medium uppercase leading-snug tracking-wide text-white",
          )}
        >
          {title}
        </p>
      </div>
    </div>
  );
}
