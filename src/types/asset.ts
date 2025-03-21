export interface AssetStatsData {
  totalUsers: number;
  totalRoles: number;
  activeUsers: number;
  lastActivity: string;
}

export interface AssetStatsCardProps {
  title: string;
  value: string;
  color?: string;
  description: string;
}

export interface ErrorFallbackProps {
  error: Error;
}
