import { Skeleton } from "@/components/ui/skeleton";

interface LoadingFormSkeletonProps {
    inputSum?: number
}

export const LoadingFormSkeleton =  ({
    inputSum = 5
}: LoadingFormSkeletonProps) => {
    return (
        <div className="w-full flex flex-col gap-4">
            <Skeleton className="w-full h-20 rounded-lg bg-gray-200"/>
            {
                Array.from({length: inputSum}).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="w-[30%] h-7 bg-gray-200" />
                        <Skeleton className="w-full h-14 bg-gray-200" />
                    </div>
                ))
            }
        </div>
    )
}