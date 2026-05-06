import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/context';
import axios from 'axios';

interface CampaignData {
  id: string;
  name: string;
  status: string;
  spend: string;
}

interface TransactionData {
  id: string;
  amount: string;
  status: string;
  created_at: string;
}

interface DashboardData {
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalAppLists: number;
    totalDomainLists: number;
    totalIpLists: number;
    totalSpend: string;
  };
  campaigns: {
    total: number;
    active: number;
    top: CampaignData[];
  };
  recentTransactions: TransactionData[];
  performance: {
    totalSpend: string;
    averageSpend: string;
  };
}

interface PerformanceMetrics {
  id: string;
  name: string;
  status: string;
  spend: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: string;
  cpc: string;
  cpm: string;
  conversionRate: string;
  startDate: string;
  endDate: string;
  budget: string;
}

interface CampaignPerformance {
  campaigns: PerformanceMetrics[];
  aggregate: {
    totalSpend: string;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    overallCTR: string;
    overallCPC: string;
    overallCPM: string;
    overallConversionRate: string;
  };
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    pausedCampaigns: number;
  };
}

interface UseDashboardReturn {
  dashboardData: DashboardData | null;
  campaignPerformance: CampaignPerformance | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  refreshCampaignPerformance: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const { token, advertiserData } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/advertiser/dashboard?token=${token}`);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCampaignPerformance = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/advertiser/campaign-performance?token=${token}`);
      
      if (response.data.success) {
        setCampaignPerformance(response.data.data);
      } else {
        setError('Failed to fetch campaign performance data');
      }
    } catch (err) {
      console.error('Error fetching campaign performance data:', err);
      setError('Failed to fetch campaign performance data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshDashboard = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshCampaignPerformance = useCallback(async () => {
    await fetchCampaignPerformance();
  }, [fetchCampaignPerformance]);

  // Initial data fetch
  useEffect(() => {
    if (token && advertiserData) {
      fetchDashboardData();
      fetchCampaignPerformance();
    }
  }, [token, advertiserData, fetchDashboardData, fetchCampaignPerformance]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchCampaignPerformance();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, fetchDashboardData, fetchCampaignPerformance]);

  return {
    dashboardData,
    campaignPerformance,
    loading,
    error,
    refreshDashboard,
    refreshCampaignPerformance
  };
}; 