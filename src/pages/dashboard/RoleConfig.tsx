import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  users_count: number;
}

const RoleConfig = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const {
    data: role,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      console.log("Fetching role data for ID:", id);

      // First fetch the basic role data
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("*")
        .eq("id", id)
        .single();

      if (roleError) {
        console.error("Error fetching role:", roleError);
        throw roleError;
      }

      if (!roleData) {
        throw new Error("Role not found");
      }

      // Then get the count of users
      const { count, error: countError } = await supabase
        .from("user_roles")
        .select("*", { count: "exact" })
        .eq("role_id", id);

      if (countError) {
        console.error("Error fetching user count:", countError);
        throw countError;
      }

      const transformedRole: Role = {
        id: roleData.id,
        name: roleData.name,
        description: roleData.description,
        created_at: roleData.created_at,
        users_count: count || 0,
      };

      console.log("Role data fetched:", transformedRole);
      return transformedRole;
    },
    meta: {
      onError: (error: Error) => {
        console.error("Query error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch role data. Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 text-red-500">
          Error loading role. Please try again later.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : role ? (
        <div>
          <h1 className="text-3xl font-bold mb-8">Role Configuration</h1>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Role Details</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1">{role.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">{role.description}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Users Count
                  </label>
                  <div className="mt-1">{role.users_count}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Created At
                  </label>
                  <div className="mt-1">
                    {new Date(role.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default RoleConfig;
