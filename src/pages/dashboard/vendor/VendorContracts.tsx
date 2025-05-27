
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { PageContainer } from "@/components/ui/dashboard/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Building2, Calendar, Clock, CheckCircle, XCircle, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VendorContractDialog from "@/components/vendor/VendorContractDialog";

interface VendorCompanyWithContract {
  id: number;
  business_name: string;
  registration_number: string;
  business_type: string;
  phone_number: string;
  service_detail: string;
  contract: {
    id?: number;
    contract_start?: string;
    contract_end?: string;
    duration?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  } | null;
}

const VendorContracts = () => {
  const [companies, setCompanies] = useState<VendorCompanyWithContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompaniesWithContracts();
  }, []);

  const fetchCompaniesWithContracts = async () => {
    try {
      const { data: vendorData, error } = await supabase
        .from("nd_vendor_profile")
        .select(`
          id,
          business_name,
          registration_number,
          business_type,
          phone_number,
          service_detail
        `);

      if (error) throw error;

      // Get contract data for each vendor
      const companiesWithContracts = await Promise.all(
        (vendorData || []).map(async (vendor) => {
          const { data: contractData } = await supabase
            .from("nd_vendor_contract")
            .select("*")
            .eq("registration_number", vendor.registration_number)
            .maybeSingle();

          return {
            ...vendor,
            contract: contractData || null,
          };
        })
      );

      setCompanies(companiesWithContracts);
    } catch (error) {
      console.error("Error fetching companies with contracts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contract data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditContract = (company: VendorCompanyWithContract) => {
    setSelectedCompany(company);
    setIsContractDialogOpen(true);
  };

  const getContractStatus = (contract: any) => {
    if (!contract || !contract.contract_start) {
      return { status: "No Contract", icon: XCircle, color: "bg-gray-500" };
    }

    const today = new Date();
    const startDate = new Date(contract.contract_start);
    const endDate = contract.contract_end ? new Date(contract.contract_end) : null;

    if (endDate && today > endDate) {
      return { status: "Expired", icon: XCircle, color: "bg-red-500" };
    } else if (today >= startDate && (!endDate || today <= endDate)) {
      return { status: "Active", icon: CheckCircle, color: "bg-green-500" };
    } else if (today < startDate) {
      return { status: "Pending", icon: Clock, color: "bg-yellow-500" };
    }

    return { status: "Inactive", icon: XCircle, color: "bg-gray-500" };
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div>
        <PageContainer>
          <PageHeader
            title="Vendor Contracts"
            description="Manage vendor contracts and agreements"
          />
          <div className="flex justify-center items-center h-64">
            <div>Loading contracts...</div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div>
      <PageContainer>
        <PageHeader
          title="Vendor Contracts"
          description="Manage vendor contracts and agreements"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Companies & Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No vendor companies found</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {companies.map((company) => {
                  const contractStatus = getContractStatus(company.contract);
                  const StatusIcon = contractStatus.icon;

                  return (
                    <AccordionItem key={company.id} value={`company-${company.id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4" />
                            <div className="text-left">
                              <div className="font-medium">{company.business_name}</div>
                              <div className="text-sm text-gray-500">
                                {company.registration_number}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4 text-white" />
                            <Badge className={`${contractStatus.color} text-white`}>
                              {contractStatus.status}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Business Type:</span>
                              <p className="text-gray-600">{company.business_type}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Phone:</span>
                              <p className="text-gray-600">{company.phone_number}</p>
                            </div>
                          </div>

                          {company.service_detail && (
                            <div>
                              <span className="font-medium text-gray-700">Services:</span>
                              <p className="text-gray-600 text-sm">{company.service_detail}</p>
                            </div>
                          )}

                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Contract Details
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditContract(company)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {company.contract ? "Edit Contract" : "Create Contract"}
                              </Button>
                            </div>

                            {company.contract ? (
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Start Date:</span>
                                  <p className="text-gray-600">
                                    {formatDate(company.contract.contract_start)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">End Date:</span>
                                  <p className="text-gray-600">
                                    {formatDate(company.contract.contract_end)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Duration:</span>
                                  <p className="text-gray-600">
                                    {company.contract.duration || 0} months
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Status:</span>
                                  <p className="text-gray-600">
                                    {company.contract.is_active ? "Active" : "Inactive"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No contract found for this vendor</p>
                                <p className="text-sm text-gray-400">Click "Create Contract" to add one</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Contract Management Dialog */}
        <VendorContractDialog
          isOpen={isContractDialogOpen}
          onClose={() => setIsContractDialogOpen(false)}
          vendorCompany={selectedCompany}
          onContractUpdated={fetchCompaniesWithContracts}
        />
      </PageContainer>
    </div>
  );
};

export default VendorContracts;
