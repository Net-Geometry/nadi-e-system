import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MemberIdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membershipId: string | null;
}

export const MemberIdDialog = ({
  open,
  onOpenChange,
  membershipId,
}: MemberIdDialogProps) => {
  if (!membershipId) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[40vw]">
        <AlertDialogHeader>
          <AlertDialogTitle>Membership Registration</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-center">
                Successfully registered!
              </p>
              <p className="text-center">
                Your Membership ID is <span className="font-bold">{membershipId}</span>.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};