import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFetchClaimById } from "./claim-data"; // Import the hook
import GeneralTab from "./tab/GeneralTab";
import LogTab from "./tab/LogTab";
import Application from "./tab/ApplicationTab";
import TpSubmitDialog from "@/components/claims/tp/TpSubmitDialog"; // Import TpSubmitDialog
import { useUserMetadata } from "@/hooks/use-user-metadata";
import SignTab from "./tab/SignTab";
import DuspSubmitDialog from "../dusp/DuspSubmitDialog";
import DuspUpdatePaymentDialog from "../dusp/DuspUpdatePaymentDialog";

interface ClaimViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: number; // Receive only the claim ID
}

const ClaimViewDialog: React.FC<ClaimViewDialogProps> = ({ isOpen, onClose, claimId }) => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;
  const userType = parsedMetadata?.user_type;
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false); // State for TpSubmitDialog
  const [isDuspDialogOpen, setIsDuspDialogOpen] = useState(false); // State for DuspSubmitDialog
  const [isUpdatePaymentDialogOpen, setIsUpdatePaymentDialogOpen] = useState(false); // State for DuspUpdatePaymentDialog

  // Fetch claim data using the hook
  const { data: claimData, isLoading, error } = useFetchClaimById(claimId);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {/* Tabs for content */}
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <p>Error loading claim data</p>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="application">Application</TabsTrigger>
                {((userGroup === 1 || userGroup === 2) &&
                  <TabsTrigger value="sign">Signed Document</TabsTrigger>
                )}
                <TabsTrigger value="log">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <GeneralTab claimData={claimData} />
              </TabsContent>
              <TabsContent value="application">
                <Application claimData={claimData} />
              </TabsContent>
              {((userGroup === 1 || userGroup === 2) &&
                <TabsContent value="sign">
                  <SignTab claimData={claimData} />
                </TabsContent>
              )}
              <TabsContent value="log">
                <LogTab claimData={claimData} />
              </TabsContent>
            </Tabs>
          )}

          {/* Submit Button */}
          <DialogFooter className="mt-4">
            {((userGroup === 3 && claimData?.claim_status?.name === "DRAFTED") &&
              <Button
                variant="outline"
                onClick={() => setIsSubmitDialogOpen(true)} // Open TpSubmitDialog
                disabled={!claimData} // Disable if claimData is not loaded
              >
                Submit to DUSP
              </Button>
            )}

            {((userGroup === 1 && claimData?.claim_status?.name === "SUBMITTED") &&
              <Button
                variant="default"
                onClick={() => setIsDuspDialogOpen(true)} // Open DuspSubmitDialog
                disabled={!claimData} // Disable if claimData is not loaded
              >
                Submit to MCMC
              </Button>
            )}

            {((userGroup === 1 && claimData?.claim_status?.name === "PROCESSING") &&
              <Button
                variant="default"
                onClick={() => setIsUpdatePaymentDialogOpen(true)} // Open DuspUpdatePaymentDialog
                disabled={!claimData} // Disable if claimData is not loaded
              >
                Update Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TpSubmitDialog */}
      {(claimData) && (
        <TpSubmitDialog
          isOpen={isSubmitDialogOpen}
          onClose={() => setIsSubmitDialogOpen(false)} // Close TpSubmitDialog
          claim={claimData} // Pass claimData to TpSubmitDialog
        />
      )}

      {/* DuspSubmitDialog */}
      {(claimData) && (
        <DuspSubmitDialog
          isOpen={isDuspDialogOpen}
          onClose={() => setIsDuspDialogOpen(false)} // Close DuspSubmitDialog
          claim={claimData} // Pass claimData to DuspSubmitDialog
        />
      )}

      {/* DuspUpdatePaymentDialog */}
      {(claimData) && (
        <DuspUpdatePaymentDialog
          isOpen={isUpdatePaymentDialogOpen}
          onClose={() => setIsUpdatePaymentDialogOpen(false)} // Close DuspUpdatePaymentDialog
          claim={claimData} // Pass claimData to DuspUpdatePaymentDialog
        />
      )}
    </>
  );
};

export default ClaimViewDialog;