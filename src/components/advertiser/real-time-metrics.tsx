import React, { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  format?: "currency" | "percentage" | "number" | "decimal";
  // trend?: "up" | "down" | "neutral";
}

function MetricCard({ title, value, previousValue, format }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === "currency") {
      return `$${parseFloat(val.toString()).toFixed(2)}`;
    }
    if (format === "percentage") {
      return `${val}%`;
    }
    if (format === "decimal") {
      return parseFloat(val.toString()).toFixed(4);
    }
    if (format === "number") {
      return parseInt(val.toString()).toLocaleString();
    }
    return val;
  };

  const calculateChange = () => {
    if (!previousValue) return null;
    
    const current = parseFloat(value.toString());
    const previous = parseFloat(previousValue.toString());
    const change = ((current - previous) / previous) * 100;
    
    return {
      percentage: Math.abs(change).toFixed(1),
      direction: change > 0 ? "up" : change < 0 ? "down" : "neutral"
    };
  };

  const change = calculateChange();
  const trendIcon = change?.direction === "up" ? 
    <TrendingUp className="h-4 w-4 text-green-500" /> : 
    change?.direction === "down" ? 
    <TrendingDown className="h-4 w-4 text-red-500" /> : 
    <Minus className="h-4 w-4 text-gray-400" />;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-800">
            {formatValue(value)}
          </div>
          {change && (
            <div className="flex items-center space-x-1">
              {trendIcon}
              <span className={`text-sm font-medium ${
                change.direction === "up" ? "text-green-600" : 
                change.direction === "down" ? "text-red-600" : 
                "text-gray-600"
              }`}>
                {change.direction === "up" ? "+" : ""}{change.percentage}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RealTimeMetrics() {
  const { campaignPerformance, loading, refreshCampaignPerformance } = useDashboard();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshCampaignPerformance();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshCampaignPerformance]);

  const handleRefresh = () => {
    refreshCampaignPerformance();
  };

  if (!campaignPerformance) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Loading performance metrics...</p>
        </div>
      </Card>
    );
  }

  const { aggregate } = campaignPerformance;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Real-Time Performance</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Auto-refresh
            </label>
          </div>
          
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
            disabled={!autoRefresh}
          >
            <option value={15}>15s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Spend"
          value={aggregate.totalSpend}
          format="currency"
        />
        <MetricCard
          title="Total Impressions"
          value={aggregate.totalImpressions}
          format="number"
        />
        <MetricCard
          title="Total Clicks"
          value={aggregate.totalClicks}
          format="number"
        />
        <MetricCard
          title="Overall CTR"
          value={aggregate.overallCTR}
          format="percentage"
        />
        <MetricCard
          title="Overall CPC"
          value={aggregate.overallCPC}
          format="currency"
        />
        <MetricCard
          title="Overall CPM"
          value={aggregate.overallCPM}
          format="currency"
        />
        <MetricCard
          title="Total Conversions"
          value={aggregate.totalConversions}
          format="number"
        />
        <MetricCard
          title="Conversion Rate"
          value={aggregate.overallConversionRate}
          format="percentage"
        />
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        <span>
          {autoRefresh 
            ? `Auto-refreshing every ${refreshInterval} seconds` 
            : 'Manual refresh only'
          }
        </span>
        {loading && (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Updating...</span>
          </>
        )}
      </div>
    </div>
  );
} 