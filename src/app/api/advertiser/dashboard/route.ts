import { NextResponse } from "next/server";

interface CampaignData {
  id: string;
  name: string;
  status: string;
  spend: string;
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
    
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Fetch multiple dashboard data endpoints in parallel
    const [
      campaignsResponse,
      appListsResponse,
      domainListsResponse,
      ipListsResponse,
      paymentTransactionsResponse
    ] = await Promise.all([
      fetch(`https://panel.adsaro.com/advertiser/api/Campaign/?version=4&token=${token}`),
      fetch(`https://panel.adsaro.com/advertiser/api/AppList/?version=4&token=${token}`),
      fetch(`https://panel.adsaro.com/advertiser/api/DomainList/?version=4&token=${token}`),
      fetch(`https://panel.adsaro.com/advertiser/api/IpList/?version=4&token=${token}`),
      fetch(`https://panel.adsaro.com/advertiser/api/PaymentTransaction/?version=4&token=${token}`)
    ]);

    // Parse responses
    const campaigns: ApiResponse = await campaignsResponse.json();
    const appLists: ApiResponse = await appListsResponse.json();
    const domainLists: ApiResponse = await domainListsResponse.json();
    const ipLists: ApiResponse = await ipListsResponse.json();
    const paymentTransactions: ApiResponse = await paymentTransactionsResponse.json();

    // Calculate dashboard metrics
    const totalCampaigns = campaigns?.response?.rows?.length || 0;
    const activeCampaigns = campaigns?.response?.rows?.filter((campaign: CampaignData) => 
      campaign.status === 'ACTIVE' || campaign.status === 'RUNNING'
    )?.length || 0;
    
    const totalAppLists = appLists?.response?.rows?.length || 0;
    const totalDomainLists = domainLists?.response?.rows?.length || 0;
    const totalIpLists = ipLists?.response?.rows?.length || 0;
    
    // Calculate total spend from campaigns
    const totalSpend = campaigns?.response?.rows?.reduce((sum: number, campaign: CampaignData) => 
      sum + (parseFloat(campaign.spend) || 0), 0
    ) || 0;

    // Get recent payment transactions
    const recentTransactions = paymentTransactions?.response?.rows?.slice(0, 5) || [];

    // Get top performing campaigns (by spend)
    const topCampaigns = campaigns?.response?.rows
      ?.sort((a: CampaignData, b: CampaignData) => (parseFloat(b.spend) || 0) - (parseFloat(a.spend) || 0))
      ?.slice(0, 5) || [];

    const dashboardData = {
      summary: {
        totalCampaigns,
        activeCampaigns,
        totalAppLists,
        totalDomainLists,
        totalIpLists,
        totalSpend: totalSpend.toFixed(2)
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        top: topCampaigns
      },
      recentTransactions,
      performance: {
        totalSpend: totalSpend.toFixed(2),
        averageSpend: totalCampaigns > 0 ? (totalSpend / totalCampaigns).toFixed(2) : "0.00"
      }
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
} 