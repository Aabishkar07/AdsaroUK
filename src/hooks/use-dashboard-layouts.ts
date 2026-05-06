import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout, DashboardWidget } from '@/components/advertiser/dashboard-widgets';

const STORAGE_KEY = 'adsaro-dashboard-layouts';

interface StoredLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ImportedLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useDashboardLayouts = () => {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load layouts from localStorage
  const loadLayouts = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedLayouts: StoredLayout[] = JSON.parse(stored);
        // Convert date strings back to Date objects
        const layoutsWithDates = parsedLayouts.map((layout: StoredLayout) => ({
          ...layout,
          createdAt: new Date(layout.createdAt),
          updatedAt: new Date(layout.updatedAt)
        }));
        setLayouts(layoutsWithDates);
        
        // Set current layout to default or first available
        const defaultLayout = layoutsWithDates.find((l: DashboardLayout) => l.isDefault);
        setCurrentLayout(defaultLayout || layoutsWithDates[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard layouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save layouts to localStorage
  const saveLayouts = useCallback((newLayouts: DashboardLayout[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayouts));
      setLayouts(newLayouts);
    } catch (error) {
      console.error('Error saving dashboard layouts:', error);
    }
  }, []);

  // Create default layout if none exists
  const createDefaultLayout = useCallback(() => {
    const defaultWidgets: DashboardWidget[] = [
      {
        id: '1',
        type: 'quick-stats',
        title: 'Quick Stats',
        size: 'medium',
        position: 0,
        isVisible: true
      },
      {
        id: '2',
        type: 'performance-metrics',
        title: 'Performance Metrics',
        size: 'small',
        position: 1,
        isVisible: true
      },
      {
        id: '3',
        type: 'campaign-overview',
        title: 'Campaign Overview',
        size: 'small',
        position: 2,
        isVisible: true
      },
      {
        id: '4',
        type: 'top-campaigns',
        title: 'Top Campaigns',
        size: 'medium',
        position: 3,
        isVisible: true
      },
      {
        id: '5',
        type: 'budget-tracking',
        title: 'Budget Tracking',
        size: 'small',
        position: 4,
        isVisible: true
      }
    ];

    const defaultLayout: DashboardLayout = {
      id: 'default',
      name: 'Default Layout',
      widgets: defaultWidgets,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newLayouts = [defaultLayout];
    saveLayouts(newLayouts);
    setCurrentLayout(defaultLayout);
    return defaultLayout;
  }, [saveLayouts]);

  // Initialize layouts
  useEffect(() => {
    loadLayouts();
  }, [loadLayouts]);

  // Create default layout if none exists
  useEffect(() => {
    if (!isLoading && layouts.length === 0) {
      createDefaultLayout();
    }
  }, [isLoading, layouts.length, createDefaultLayout]);

  // Add new layout
  const addLayout = useCallback((name: string, widgets: DashboardWidget[]) => {
    const newLayout: DashboardLayout = {
      id: Date.now().toString(),
      name,
      widgets,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newLayouts = [...layouts, newLayout];
    saveLayouts(newLayouts);
    setCurrentLayout(newLayout);
    return newLayout;
  }, [layouts, saveLayouts]);

  // Update existing layout
  const updateLayout = useCallback((layoutId: string, updates: Partial<DashboardLayout>) => {
    const newLayouts = layouts.map(layout => 
      layout.id === layoutId 
        ? { ...layout, ...updates, updatedAt: new Date() }
        : layout
    );
    
    saveLayouts(newLayouts);
    
    // Update current layout if it's the one being updated
    if (currentLayout?.id === layoutId) {
      setCurrentLayout(newLayouts.find(l => l.id === layoutId) || null);
    }
  }, [layouts, saveLayouts, currentLayout]);

  // Delete layout
  const deleteLayout = useCallback((layoutId: string) => {
    const layoutToDelete = layouts.find(l => l.id === layoutId);
    if (layoutToDelete?.isDefault) {
      throw new Error('Cannot delete default layout');
    }

    const newLayouts = layouts.filter(l => l.id !== layoutId);
    saveLayouts(newLayouts);
    
    // If current layout was deleted, switch to default
    if (currentLayout?.id === layoutId) {
      const defaultLayout = newLayouts.find(l => l.isDefault);
      setCurrentLayout(defaultLayout || newLayouts[0]);
    }
  }, [layouts, saveLayouts, currentLayout]);

  // Duplicate layout
  const duplicateLayout = useCallback((layoutId: string, newName?: string) => {
    const originalLayout = layouts.find(l => l.id === layoutId);
    if (!originalLayout) return null;

    const duplicatedWidgets = originalLayout.widgets.map(widget => ({
      ...widget,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));

    const newLayout: DashboardLayout = {
      id: Date.now().toString(),
      name: newName || `${originalLayout.name} (Copy)`,
      widgets: duplicatedWidgets,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newLayouts = [...layouts, newLayout];
    saveLayouts(newLayouts);
    return newLayout;
  }, [layouts, saveLayouts]);

  // Set layout as default
  const setDefaultLayout = useCallback((layoutId: string) => {
    const newLayouts = layouts.map(layout => ({
      ...layout,
      isDefault: layout.id === layoutId
    }));
    
    saveLayouts(newLayouts);
  }, [layouts, saveLayouts]);

  // Reset to default layout
  const resetToDefault = useCallback(() => {
    const defaultLayout = layouts.find(l => l.isDefault);
    if (defaultLayout) {
      setCurrentLayout(defaultLayout);
    }
  }, [layouts]);

  // Export layouts
  const exportLayouts = useCallback(() => {
    const dataStr = JSON.stringify(layouts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'adsaro-dashboard-layouts.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [layouts]);

  // Import layouts
  const importLayouts = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedLayouts: ImportedLayout[] = JSON.parse(e.target?.result as string);
          
          // Validate imported layouts
          if (!Array.isArray(importedLayouts)) {
            throw new Error('Invalid layout file format');
          }

          // Convert date strings and validate structure
          const validatedLayouts = importedLayouts.map((layout: ImportedLayout) => ({
            ...layout,
            createdAt: new Date(layout.createdAt),
            updatedAt: new Date(layout.updatedAt),
            widgets: Array.isArray(layout.widgets) ? layout.widgets : []
          }));

          saveLayouts(validatedLayouts);
          setCurrentLayout(validatedLayouts[0]);
          resolve();
        } catch (error) {
          reject(new Error('Failed to import layouts: ' + error));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [saveLayouts]);

  // Clear all layouts (reset to default)
  const clearAllLayouts = useCallback(() => {
    const defaultLayout = layouts.find(l => l.isDefault);
    if (defaultLayout) {
      saveLayouts([defaultLayout]);
      setCurrentLayout(defaultLayout);
    }
  }, [layouts, saveLayouts]);

  return {
    layouts,
    currentLayout,
    isLoading,
    setCurrentLayout,
    addLayout,
    updateLayout,
    deleteLayout,
    duplicateLayout,
    setDefaultLayout,
    resetToDefault,
    exportLayouts,
    importLayouts,
    clearAllLayouts,
    createDefaultLayout
  };
}; 