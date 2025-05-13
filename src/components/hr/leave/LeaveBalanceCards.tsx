import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

type LeaveBalance = {
  type: string;
  total: number;
  used: number;
  remaining: number;
  pendingApprovals: number;
};

export function LeaveBalanceCards() {
  const { user } = useAuth();

  const { data: leaveBalances, isLoading } = useQuery({
    queryKey: ["leave-balances", user?.id],
    queryFn: async () => {
      // In a real app, this would fetch from the database
      // For now, returning mock data
      return [
        {
          type: "Annual",
          total: 16,
          used: 5,
          remaining: 11,
          pendingApprovals: 2,
        },
        {
          type: "Medical",
          total: 14,
          used: 2,
          remaining: 12,
          pendingApprovals: 0,
        },
        {
          type: "Replacement",
          total: 5,
          used: 0,
          remaining: 5,
          pendingApprovals: 1,
        },
        {
          type: "Emergency",
          total: 3,
          used: 1,
          remaining: 2,
          pendingApprovals: 0,
        },
      ] as LeaveBalance[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {leaveBalances?.map((balance) => (
        <Card key={balance.type} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {balance.type} Leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance.remaining} / {balance.total}
            </div>
            <div className="grid grid-cols-2 text-xs text-muted-foreground mt-1">
              <div>Used: {balance.used}</div>
              <div>Pending: {balance.pendingApprovals}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
