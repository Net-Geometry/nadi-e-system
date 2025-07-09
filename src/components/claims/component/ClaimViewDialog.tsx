import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFetchClaimById } from "./claim-data"; // Import the hook
import GeneralTab from "./tab/GeneralTab";
import LogTab from "./tab/LogTab";
import TpSubmitDialog from "@/components/claims/tp/TpSubmitDialog"; // Import TpSubmitDialog
import { useUserMetadata } from "@/hooks/use-user-metadata";
import SignTab from "./tab/SignTab";
import DuspSubmitDialog from "../dusp/DuspSubmitDialog";
import DuspUpdatePaymentDialog from "../dusp/DuspUpdatePaymentDialog";
import { useNavigate } from "react-router-dom";
import { ApplicationTab } from "./tab/ApplicationTab";
import { useToast } from "@/hooks/use-toast";
import DuspRejectDialog from "../dusp/DuspRejectDialog";
import ApplicationEditTab from "./tab/ApplicationEditTab";
// ...existing imports...
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReportEditTab from "./tab/ReportEditTab";

interface ClaimViewPageProps {
  claimId: number; // Accept claimId as a prop
}

const ClaimViewPage: React.FC<ClaimViewPageProps> = ({ claimId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;
  const userType = parsedMetadata?.user_type;
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDuspDialogOpen, setIsDuspDialogOpen] = useState(false);
  const [isUpdatePaymentDialogOpen, setIsUpdatePaymentDialogOpen] = useState(false);

  // New state for tracking edit changes
  const [isEditChanged, setIsEditChanged] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Fetch claim data using the hook
  const { data: claimData, isLoading, error, refetch } = useFetchClaimById(claimId);

  // Handle tab change with confirmation for unsaved changes
  const handleTabChange = (newTab: string) => {
    if ((activeTab === "application_edit" || activeTab === "report_edit") && isEditChanged) {
      setPendingTab(newTab);
      setShowConfirmDialog(true);
    } else {
      setActiveTab(newTab);
    }
  };

  // Confirm tab change and discard changes
  const confirmTabChange = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setIsEditChanged(false);
      setPendingTab(null);
    }
    setShowConfirmDialog(false);
  };

  // Cancel tab change
  const cancelTabChange = () => {
    setPendingTab(null);
    setShowConfirmDialog(false);
  };

  // Handle back navigation with confirmation for unsaved changes
  const handleBackClick = () => {
    if ((activeTab === "application_edit" || activeTab === "report_edit") && isEditChanged) {
      setPendingTab("back");
      setShowConfirmDialog(true);
    } else {
      navigate(-1);
    }
  };

  // Confirm back navigation
  const confirmBackNavigation = () => {
    if (pendingTab === "back") {
      navigate(-1);
    } else {
      confirmTabChange();
    }
  };

  // Handle successful submission
  const handleSubmitSuccess = () => {
    setActiveTab("application");
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Claim Details</h1>
        <Button variant="outline" onClick={handleBackClick}>
          Back to Claim Dashboard
        </Button>
      </header>
      {/* <pre>{JSON.stringify(claimData, null, 2)}</pre> */}

      <div className="rounded-md border p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <p>Error loading claim data</p>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              {(userGroup === 3 && claimData?.claim_status?.name === "DRAFTED") && (
                <TabsTrigger value="application_edit">Claim Application (Draft)</TabsTrigger>

              )}
              {(userGroup === 3 && claimData?.claim_status?.name === "DRAFTED") && (
                <TabsTrigger value="report_edit">Claim Reports and Attachments (Draft)</TabsTrigger>

              )}
              {claimData?.claim_status?.name !== "DRAFTED" && (
                <TabsTrigger value="application">Application</TabsTrigger>
              )}
              {(userGroup === 1 || userGroup === 2) && (
                <TabsTrigger value="sign">Signed Document</TabsTrigger>
              )}
              <TabsTrigger value="log">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="border border-gray-300 rounded-md p-4 shadow-sm">
                <GeneralTab claimData={claimData} />
              </div>
            </TabsContent>
            {(userGroup === 3 && claimData?.claim_status?.name === "DRAFTED") && (
              <TabsContent value="application_edit">
                <div className="border border-gray-300 rounded-md p-4 shadow-sm">
                  <ApplicationEditTab claimData={claimData} onDataChange={setIsEditChanged} refetch={refetch} />
                </div>
              </TabsContent>
            )}
            {(userGroup === 3 && claimData?.claim_status?.name === "DRAFTED") && (
              <TabsContent value="report_edit">
                <div className="border border-gray-300 rounded-md p-4 shadow-sm">
                  <ReportEditTab claimData={claimData} onDataChange={setIsEditChanged} refetch={refetch} />
                </div>
              </TabsContent>
            )}
            {claimData?.claim_status?.name !== "DRAFTED" && (
              <TabsContent value="application">
                <div className="border border-gray-300 rounded-md p-4 shadow-sm">
                  <ApplicationTab claimData={claimData} refetch={refetch} />
                </div>
              </TabsContent>
            )}
            {(userGroup === 1 || userGroup === 2) && (
              <TabsContent value="sign">
                <div className="border border-gray-300 rounded-md p-4 shadow-sm">
                  <SignTab claimData={claimData} />
                </div>
              </TabsContent>
            )}
            <TabsContent value="log">
              <div className="border border-gray-300 rounded-md p-4 shadow-sm">
                <LogTab claimData={claimData} />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Submit Button */}
        <div className="mt-4 flex justify-end space-x-4">
          {userGroup === 3 && claimData?.claim_status?.name === "DRAFTED" && (
            <Button
              variant="default"
              onClick={() => setIsSubmitDialogOpen(true)}
              disabled={!claimData}
            >
              Submit to DUSP
            </Button>
          )}

          {userGroup === 1 && claimData?.claim_status?.name === "SUBMITTED" && (
            <div>
              <Button
                className="mr-2"
                variant="destructive"
                onClick={() => {
                  setIsRejectDialogOpen(true);
                }}
                disabled={!claimData}
              >
                Reject
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (!claimData.signed_documents || claimData.signed_documents.length === 0) {
                    toast({
                      title: "Signed Document Required",
                      description: "Please upload the signed the document before submitting to MCMC.",
                      variant: "destructive",
                    });
                    setActiveTab("sign");
                    return;
                  }
                  if (claimData.noa === null || claimData.noa === "") {
                    toast({
                      title: "NOA Required",
                      description: "Please insert NOA before submitting to MCMC.",
                      variant: "destructive",
                    });
                    setActiveTab("sign");
                    return;
                  }
                  setIsDuspDialogOpen(true);
                }}
                disabled={!claimData}
              >
                Save and Submit
              </Button>
            </div>
          )}

          {userGroup === 1 && claimData?.claim_status?.name === "PROCESSING" && (
            <Button
              variant="default"
              onClick={() => setIsUpdatePaymentDialogOpen(true)}
              disabled={!claimData}
            >
              Update Payment
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Unsaved Changes */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this page? Any unsaved changes might not be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelTabChange}>
              Stay on Page
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmBackNavigation}>
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ...existing dialogs... */}
      {claimData && (
        <TpSubmitDialog
          isOpen={isSubmitDialogOpen}
          onClose={() => setIsSubmitDialogOpen(false)}
          onSuccess={handleSubmitSuccess} // Add success callback
          claim={claimData}
        />
      )}

      {claimData && (
        <DuspSubmitDialog
          isOpen={isDuspDialogOpen}
          onClose={() => setIsDuspDialogOpen(false)}
          claim={claimData}
        />
      )}

      {claimData && (
        <DuspRejectDialog
          isOpen={isRejectDialogOpen}
          onClose={() => setIsRejectDialogOpen(false)}
          claim={claimData}
        />
      )}

      {claimData && (
        <DuspUpdatePaymentDialog
          isOpen={isUpdatePaymentDialogOpen}
          onClose={() => setIsUpdatePaymentDialogOpen(false)}
          claim={claimData}
        />
      )}
    </div>
  );
};

export default ClaimViewPage;