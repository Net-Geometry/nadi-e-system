import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LockIcon, PowerOff, RefreshCcw, Unlock } from "lucide-react"


const initialButtons = [
    {
        name: "Power Off",
        icon: <PowerOff />,
        value: "Power Off All Pc",
        customClass: "bg-red-500 hover:bg-red-400",
        Action: () => console.log("Clicked")
    },
    {
        name: "Restart PC",
        icon: <RefreshCcw />,
        value: "Restart All PC",
        customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
        Action: () => console.log("Clicked")
    },
    {
        name: "Lock PC",
        icon: <LockIcon />,
        value: "Lock All PC",
        customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
        Action: () => console.log("Clicked")
    },
    {
        name: "Unlock PC",
        icon: <Unlock />,
        value: "Unlock All PC",
        customClass: "bg-white text-black hover:bg-slate-100 border border-gray-200",
        Action: () => console.log("Clicked")
    },
]

interface BulkActionButtonsProps {
    buttonsData?: {
        name: string,
        icon: React.ReactNode,
        value: string,
        customClass?: string
        action?: () => void
    }[],
    className?: string,
    useHeader?: boolean
}

export const BulkActionButtons = ({
    buttonsData = initialButtons,
    className,
    useHeader = true
}: BulkActionButtonsProps) => {
    return (
        <div className={`flex flex-col ${useHeader ? "my-5" : ""}`}>
            {useHeader &&
                <h1 className="text-2xl font-semibold">Bulk Action</h1>
            }
            <div className={cn("flex items-center justify-between gap-4 mt-4", className)}>
                {buttonsData.map((button) => (
                    <Button onClick={button?.action} className={`flex items-center gap-3 flex-grow ${button?.customClass}`} key={button.name}>
                        {button.icon}
                        {button.value}
                    </Button>
                ))}
            </div>
        </div>
    )
}