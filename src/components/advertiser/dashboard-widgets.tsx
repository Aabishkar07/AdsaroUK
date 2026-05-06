export type WidgetType = 
  | 'quick-stats'
  | 'performance-metrics'
  | 'campaign-overview'
  | 'top-campaigns'
  | 'budget-tracking'
  | 'recent-transactions'
  | 'chart'
  | 'table'
  | 'custom';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  isVisible: boolean;
  config?: Record<string, unknown>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Default dashboard widgets component
export const DashboardWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
        <p className="text-gray-600">Dashboard widget placeholder</p>
      </div>
    </div>
  );
}; 