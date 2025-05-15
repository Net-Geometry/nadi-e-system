
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataCardProps {
    assetType: string;
    assetSpec: string;
    started?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    requesterName: string;
    AssetName?: string;
    label?: React.ReactNode
    duration?: string;
    children?: React.ReactNode;
}

export const BookingAssetCard = ({
    assetType,
    assetSpec,
    started,
    AssetName,
    requesterName,
    duration,
    label,
    icon,
    className,
    children,
}: DataCardProps) => {
    return (
        <Card className={cn("h-full scale-100 transition-transform duration-200 ease-in-out", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className='flex items-center justify-center gap-3'>
                    {icon && <div className="h-4 flex justify-center items-center w-4 text-muted-foreground">{icon}</div>}
                    <CardTitle className="text-lg font-medium">{assetType}</CardTitle>
                </div>
                {(label)}
            </CardHeader>
            <CardContent className='flex flex-col justify-center items-center'>
                <div className="text-xl font-light">{AssetName}</div>
                {assetSpec && (
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                        {assetSpec}
                    </CardDescription>
                )}
                {requesterName && (
                    <CardDescription className='font-semibold text-lg text-black'>
                        {requesterName}
                    </CardDescription>
                )}
                {children}
            </CardContent>
            {(started && duration) && <CardFooter className="pt-1 flex justify-center items-center text-[10px] font-light text-gray-500">{`Started: ${started} | Duration: ${duration}`}</CardFooter>}
        </Card>
    );
};

export default BookingAssetCard;