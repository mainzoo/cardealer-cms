"use client";

import Image from "next/image";
import { useMemo } from "react";
import { thumbHashToDataURL } from "thumbhash";

type ClassifiedImageProps = {
    src: string;
    alt: string;
    thumbhash: string;
};

function decodeBase64(value: string): Uint8Array {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function ClassifiedImage({ src, alt, thumbhash }: ClassifiedImageProps) {
    const blurDataURL = useMemo(
        () => thumbHashToDataURL(decodeBase64(thumbhash)),
        [thumbhash]
    );

    return (
        <div className="relative aspect-[16/10] overflow-hidden">
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover"
            />
        </div>
    );
}
