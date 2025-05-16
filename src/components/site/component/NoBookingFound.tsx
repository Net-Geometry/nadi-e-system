import React from "react"
import { cn } from "@/lib/utils"

interface NoBookingFoundProps {
    icon: React.ReactNode,
    title: string,
    description: string,
    className?: string 
}

export const NoBookingFound = ({
    icon,
    title,
    className,
    description
}: NoBookingFoundProps) => {
    return (
        <section className={cn("flex flex-col items-center mt-8 gap-3", className)}>
            { ( icon ) }
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-gray-500">{description}</p>
        </section>
    )
}