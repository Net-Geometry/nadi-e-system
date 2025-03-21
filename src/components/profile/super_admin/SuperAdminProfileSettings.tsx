
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useDUSPID from "@/hooks/use-dusp-id";
import usePositionData from "@/hooks/use-position-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const SuperAdminProfileSettings = () => {
  const { user } = useAuth();
  
  // Fetch user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Get first character of name for avatar fallback
  const getNameInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    return 'A'; // Default to 'A' for Admin if no name is available
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/lovable-uploads/31e9f7ec-175a-48af-9ad7-eefda1ea40db.png" />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {getNameInitial()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-5xl font-bold">YOU ARE SUPER ADMIN 🦹</h1>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuperAdminProfileSettings;
