import React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";

interface SiteImageProps {
    images: { url: string; caption?: string }[] | undefined;
    loading: boolean;
    error: any;
}

const SiteImage: React.FC<SiteImageProps> = ({ images, loading, error }) => {
    if (loading) {
        return <div className="flex justify-center items-center h-40">Loading images...</div>;
    }

    if (error) {
        return <div className="text-red-500">Failed to load images.</div>;
    }

    if (!images || images.length === 0) {
        return <div className="text-muted-foreground">No images available.</div>;
    }

    return (
        <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
                {images.map((img, idx) => (
                    <CarouselItem key={idx} className="h-full w-full flex justify-center items-center">
                        <img
                            src={img.url}
                            alt={img.caption || `Site image ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>

    );
};

export default SiteImage;