import { useContext, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrialDataContext, ComplexityItem, CATEGORIES } from "@/contexts/TrialDataContext";
import { AgGridReact } from "ag-grid-react";
import { ColDef, RowDragEndEvent } from "ag-grid-community";

// Import AG Grid styles in the actual page component
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function TrialComplexityCard() {
  const { trialData, moveItem, resetItems } = useContext(TrialDataContext);
  
  // Get the data for the available items list
  const availableItemsData = useMemo(() => {
    return trialData.availableItems;
  }, [trialData.availableItems]);
  
  // Create the column definitions for available items
  const availableItemsColDefs: ColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Available Trial Complexity Elements',
      flex: 1,
      rowDrag: true,
    }
  ], []);
  
  // Create category grid configurations
  const categoryGridConfigs = useMemo(() => {
    return [
      {
        category: CATEGORIES.LOGISTICS,
        title: CATEGORIES.LOGISTICS,
        color: 'primary', // Blue color
        data: trialData.complexityItems[CATEGORIES.LOGISTICS]
      },
      {
        category: CATEGORIES.MOTIVATION,
        title: CATEGORIES.MOTIVATION,
        color: 'pink-500', // Pink color
        data: trialData.complexityItems[CATEGORIES.MOTIVATION]
      },
      {
        category: CATEGORIES.HEALTHCARE,
        title: CATEGORIES.HEALTHCARE,
        color: 'green-500', // Green color
        data: trialData.complexityItems[CATEGORIES.HEALTHCARE]
      },
      {
        category: CATEGORIES.QUALITY,
        title: CATEGORIES.QUALITY,
        color: 'purple-500', // Purple color
        data: trialData.complexityItems[CATEGORIES.QUALITY]
      },
    ];
  }, [trialData.complexityItems]);
  
  // Create column definitions for category grids
  const getCategoryColDefs = useMemo((): ColDef[] => [
    {
      field: 'name',
      headerName: 'Element',
      flex: 1,
      rowDrag: true,
    }
  ], []);
  
  // Handle row drag end for available items
  const onAvailableItemDragEnd = (event: RowDragEndEvent) => {
    const item = event.node.data as ComplexityItem;
    // Check if the drop was external (to one of the category grids)
    if (event.overNode && event.overNode.data) {
      // This is not needed as it handled by the category grid
    } else if (event.vDirection === 'up') {
      // Get the containing element of the grid
      const gridEl = event.event?.target as HTMLElement;
      const closestContainer = gridEl.closest('.category-container');
      
      if (closestContainer) {
        const category = closestContainer.getAttribute('data-category');
        if (category) {
          moveItem(item, category);
        }
      }
    }
  };

  // Handle row drag end for category items
  const onCategoryItemDragEnd = (event: RowDragEndEvent, category: string) => {
    const item = event.node.data as ComplexityItem;
    
    // Check if the drop was external
    if (event.vDirection === 'up') {
      // Get the containing element of the grid
      const gridEl = event.event?.target as HTMLElement;
      const closestContainer = gridEl.closest('.category-container');
      
      if (closestContainer) {
        const targetCategory = closestContainer.getAttribute('data-category');
        if (targetCategory && targetCategory !== category) {
          moveItem(item, targetCategory);
        }
      } else {
        // Move back to available items
        moveItem(item, '');
      }
    }
  };
  
  return (
    <Card className="border border-gray-100 shadow-sm lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Trial Complexity Elements</h2>
            <p className="text-sm text-gray-500">
              Drag elements to categorize them and affect patient experience metrics
            </p>
          </div>
          <Button onClick={resetItems} variant="outline">
            Reset Elements
          </Button>
        </div>
        
        {/* Available items grid */}
        <div className="mb-6 border rounded-md p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Available Elements</h3>
          <div className="ag-theme-alpine w-full" style={{ height: '150px' }}>
            <AgGridReact
              rowData={availableItemsData}
              columnDefs={availableItemsColDefs}
              rowDragManaged={true}
              animateRows={true}
              onRowDragEnd={onAvailableItemDragEnd}
              suppressMovableColumns={true}
              suppressRowClickSelection={true}
            />
          </div>
        </div>
        
        {/* Category grids in a grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryGridConfigs.map((config) => (
            <div key={config.category} className={`category-container border rounded-md p-4`} data-category={config.category}>
              <h3 className={`text-md font-medium text-${config.color} mb-3`}>
                {config.title} ({config.data.length})
              </h3>
              <div className="ag-theme-alpine w-full" style={{ height: '150px' }}>
                <AgGridReact
                  rowData={config.data}
                  columnDefs={getCategoryColDefs}
                  rowDragManaged={true}
                  animateRows={true}
                  onRowDragEnd={(e) => onCategoryItemDragEnd(e, config.category)}
                  suppressMovableColumns={true}
                  suppressRowClickSelection={true}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
