export interface CreateServerMetricDto {
  idNemsm?: number;
  cpu?: number;
  memory?: number;
  diskSpaceUsed?: number;
  networkTraffic?: number;
  netstat?: string;
  notes?: string;
} 