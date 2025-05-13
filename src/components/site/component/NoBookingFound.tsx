import React from "react"

interface NoBookingFoundProps {
    icon: React.ReactNode,
    title: string,
    description: string
}

export const NoBookingFound = ({
    icon,
    title,
    description
}: NoBookingFoundProps) => {
    return (
        <section className="flex flex-col items-center mt-8 gap-3">
            { ( icon ) }
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-gray-500">{description}</p>
        </section>
    )
}