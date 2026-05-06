import { NextResponse } from "next/server";

interface CampaignData {
  id: string;
  name: string;
  status: string;
  spend: string;
  impressions: string;
  clicks: string;
  conversions: string;
  start_date: string;
  end_date: string;
  budget_daily?: string;
  budget_total?: string;
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

interface ApiResponse {
  response?: {
    rows?: CampaignData[];
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const campaignId = searchParams.get('campaignId');
    
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    let url = `https://panel.adsaro.com/advertiser/api/Campaign/?version=4&token=${token}`;
    
    if (campaignId) {
      url = `https://panel.adsaro.com/advertiser/api/Campaign/${campaignId}?version=4&token=${token}`;
    }

    const response = await fetch(url);
    const data: ApiResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch campaign data" }, { status: response.status });
    }

    // Process campaign data
    const campaigns = data?.response?.rows || [];
    
    // Calculate performance metrics
    const performanceMetrics: PerformanceMetrics[] = campaigns.map((campaign: CampaignData) => {
      const spend = parseFloat(campaign.spend) || 0;
      const impressions = parseInt(campaign.impressions) || 0;
      const clicks = parseInt(campaign.clicks) || 0;
      const conversions = parseInt(campaign.conversions) || 0;
      
      const ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(2) : "0.00";
      const cpc = clicks > 0 ? (spend / clicks).toFixed(4) : "0.0000";
      const cpm = impressions > 0 ? (spend / impressions * 1000).toFixed(4) : "0.0000";
      const conversionRate = clicks > 0 ? (conversions / clicks * 100).toFixed(2) : "0.00";
      
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        spend: spend.toFixed(2),
        impressions,
        clicks,
        conversions,
        ctr: `${ctr}%`,
        cpc: `$${cpc}`,
        cpm: `$${cpm}`,
        conversionRate: `${conversionRate}%`,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        budget: campaign.budget_daily || campaign.budget_total || "0.00"
      };
    });

    // Calculate aggregate metrics
    const totalSpend = campaigns.reduce((sum: number, campaign: CampaignData) => 
      sum + (parseFloat(campaign.spend) || 0), 0
    );
    const totalImpressions = campaigns.reduce((sum: number, campaign: CampaignData) => 
      sum + (parseInt(campaign.impressions) || 0), 0
    );
    const totalClicks = campaigns.reduce((sum: number, campaign: CampaignData) => 
      sum + (parseInt(campaign.clicks) || 0), 0
    );
    const totalConversions = campaigns.reduce((sum: number, campaign: CampaignData) => 
      sum + (parseInt(campaign.conversions) || 0), 0
    );

    const aggregateMetrics = {
      totalSpend: totalSpend.toFixed(2),
      totalImpressions,
      totalClicks,
      totalConversions,
      overallCTR: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : "0.00",
      overallCPC: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(4) : "0.0000",
      overallCPM: totalImpressions > 0 ? (totalSpend / totalImpressions * 1000).toFixed(4) : "0.0000",
      overallConversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : "0.00"
    };

    return NextResponse.json({
      success: true,
      data: {
        campaigns: performanceMetrics,
        aggregate: aggregateMetrics,
        summary: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter((c: CampaignData) => 
            c.status === 'ACTIVE' || c.status === 'RUNNING'
          ).length,
          pausedCampaigns: campaigns.filter((c: CampaignData) => 
            c.status === 'PAUSED' || c.status === 'STOPPED'
          ).length
        }
      }
    });
  } catch (error) {
    console.error("Campaign performance API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign performance data" },
      { status: 500 }
    );
  }
} 