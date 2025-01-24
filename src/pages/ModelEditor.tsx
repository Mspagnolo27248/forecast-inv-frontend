import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Tabs, Tab, Button, Paper, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useModel } from '../context/ModelContext';
import { Model, ProductDateKeys, UnitProductDateKeys, ProductFormulationsObject, UnitYieldObject, ProductsForModelItem } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface MetadataRow {
  id: number;
  Field: string;
  Value: string | number;
}

// const formatDateToString = (timestamp: number) => {
//   return new Date(timestamp).toLocaleDateString();
// };

const convertProductDateKeysToRows = (data: ProductDateKeys) => {
  const rows: any[] = [];
  let id = 1;
  
  Object.entries(data).forEach(([productCode, dateValues]) => {
    Object.entries(dateValues).forEach(([date, value]) => {
      rows.push({
        id: id++,
        ProductCode: productCode,
        Date: date,
        Value: value
      });
    });
  });
  
  return rows;
};

const convertUnitProductDateKeysToRows = (data: UnitProductDateKeys) => {
  const rows: any[] = [];
  let id = 1;
  
  Object.entries(data).forEach(([unit, productData]) => {
    Object.entries(productData).forEach(([productCode, dateValues]) => {
      Object.entries(dateValues).forEach(([date, value]) => {
        rows.push({
          id: id++,
          Unit: unit,
          ProductCode: productCode,
          Date: date,
          Value: value
        });
      });
    });
  });
  
  return rows;
};

const convertProductFormulationToRows = (data: ProductFormulationsObject) => {
  const rows: any[] = [];
  let id = 1;
  
  Object.entries(data).forEach(([productCode, components]) => {
    components.forEach(component => {
      rows.push({
        id: id++,
        ProductCode: productCode,
        ComponentCode: component.ComponentCode,
        FormulaPercent: component.FormulaPercent
      });
    });
  });
  
  return rows;
};

const convertUnitYieldToRows = (data: UnitYieldObject) => {
  const rows: any[] = [];
  let id = 1;
  
  Object.entries(data).forEach(([unit, products]) => {
    Object.entries(products).forEach(([chargeProductCode, outputs]) => {
      outputs.forEach(output => {
        rows.push({
          id: id++,
          Unit: unit,
          ChargeProductCode: chargeProductCode,
          OutputProductCode: output.Output_ProductCode,
          OutputPercent: output.OutputPercent
        });
      });
    });
  });
  
  return rows;
};

export const ModelEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    model,
    metadata,
    products,
    receipts,
    dailyOpenOrders,
    dailyDemandForecast,
    productFormulation,
    scheduleItem,
    unitYieldItem,
    updateMetaData,
    updateProduct,
    updateReceipts,
    updateDailyOpenOrders,
    updateDailyDemandForecast,
    updateProductFormulation,
    updateScheduleItem,
    updateUnitYield,
    saveModel 
  } = useModel();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Metadata columns
  const metadataColumns: GridColDef[] = [
    { field: 'Field', headerName: 'Field', width: 200, editable: false },
    { field: 'Value', headerName: 'Value', width: 300, editable: true }
  ];

  // Products columns
  const productColumns: GridColDef[] = [
    { field: 'ProductCode', headerName: 'Product Code', width: 150, editable: true },
    { field: 'ProductDescription', headerName: 'Description', width: 250, editable: true },
    { field: 'TankCapacityGals', headerName: 'Tank Capacity (Gals)', width: 180, editable: true, type: 'number' },
    { field: 'CurrentInventoryGals', headerName: 'Current Inventory (Gals)', width: 200, editable: true, type: 'number' }
  ];

  // Product Date Keys columns (for Receipts, DailyOpenOrders, DailyDemandForecast)
  const productDateKeysColumns: GridColDef[] = [
    { field: 'ProductCode', headerName: 'Product Code', width: 150, editable: false },
    { field: 'Date', headerName: 'Date', width: 150, editable: false },
    { field: 'Value', headerName: 'Value', width: 150, editable: true, type: 'number' }
  ];

  // Schedule Item columns
  const scheduleItemColumns: GridColDef[] = [
    { field: 'Unit', headerName: 'Unit', width: 150, editable: false },
    { field: 'ProductCode', headerName: 'Product Code', width: 150, editable: false },
    { field: 'Date', headerName: 'Date', width: 150, editable: false },
    { field: 'Value', headerName: 'Value', width: 150, editable: true, type: 'number' }
  ];

  // Product Formulation columns
  const productFormulationColumns: GridColDef[] = [
    { field: 'ProductCode', headerName: 'Product Code', width: 150, editable: false },
    { field: 'ComponentCode', headerName: 'Component Code', width: 150, editable: false },
    { field: 'FormulaPercent', headerName: 'Formula Percent', width: 150, editable: true, type: 'number' }
  ];

  // Unit Yield columns
  const unitYieldColumns: GridColDef[] = [
    { field: 'Unit', headerName: 'Unit', width: 150, editable: false },
    { field: 'ChargeProductCode', headerName: 'Charge Product', width: 150, editable: false },
    { field: 'OutputProductCode', headerName: 'Output Product', width: 150, editable: false },
    { field: 'OutputPercent', headerName: 'Output Percent', width: 150, editable: true, type: 'number' }
  ];

  const metadataRows = metadata ? [
    { id: 1, Field: 'Model Name', Value: metadata.modelName },
    { id: 2, Field: 'ID Description', Value: metadata.id_description },
    { id: 3, Field: 'Created Date', Value: metadata.createdDate },
    { id: 4, Field: 'Last Updated', Value: metadata.lastUpdated },
    { id: 5, Field: 'Start Date', Value: metadata.startDate },
    { id: 6, Field: 'Run Days', Value: metadata.runDays },
    { id: 7, Field: 'UID', Value: metadata.uid }
  ] : [];

  const handleMetadataUpdate = (newRow: MetadataRow) => {
    const fieldMap: { [key: string]: string } = {
      'Model Name': 'modelName',
      'ID Description': 'id_description',
      'Created Date': 'createdDate',
      'Last Updated': 'lastUpdated',
      'Start Date': 'startDate',
      'Run Days': 'runDays',
      'UID': 'uid'
    };

    const field = metadataRows.find(row => row.id === newRow.id)?.Field;
    if (field && field in fieldMap) {
      const modelField = fieldMap[field];
      updateMetaData({ [modelField]: newRow.Value });
    }
    return newRow;
  };

  const handleProductUpdate = (newRow: ProductsForModelItem & { id: number }) => {
    const productIndex = newRow.id - 1;
    const { id, ...productData } = newRow;
    updateProduct(productIndex, productData);
    return newRow;
  };

  const handleProductDateKeysUpdate = (
    updateFn: (productCode: string, date: string, value: number) => void
  ) => (newRow: any) => {
    const { id, ProductCode, Date, Value } = newRow;
    updateFn(ProductCode, Date, Value);
    return newRow;
  };

  const handleProductFormulationUpdate = (newRow: any) => {
    const { ProductCode, ComponentCode, FormulaPercent } = newRow;
    updateProductFormulation(ProductCode, ComponentCode, FormulaPercent);
    return newRow;
  };

  const handleScheduleItemUpdate = (newRow: any) => {
    const { Unit, ProductCode, Date, Value } = newRow;
    updateScheduleItem(Unit, ProductCode, Date, Value);
    return newRow;
  };

  const handleUnitYieldUpdate = (newRow: any) => {
    const { Unit, ChargeProductCode, OutputProductCode, OutputPercent } = newRow;
    updateUnitYield(Unit, ChargeProductCode, OutputProductCode, OutputPercent);
    return newRow;
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    console.error('Error updating row:', error);
  }, []);

  const renderDataGrid = (
    rows: any[], 
    columns: GridColDef[], 
    processRowUpdate?: (newRow: any) => any,
    height: number = 400
  ) => (
    <Box sx={{ height: height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        disableRowSelectionOnClick
      />
    </Box>
  );

  const renderJsonSection = (title: string, data: any) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        <pre style={{ margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Paper>
  );

  if (!model || !metadata) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Metadata" />
            <Tab label="Products" />
            <Tab label="Receipts" />
            <Tab label="Daily Open Orders" />
            <Tab label="Daily Demand Forecast" />
            <Tab label="Product Formulation" />
            <Tab label="Schedule Items" />
            <Tab label="Unit Yield Items" />
          </Tabs>
          <Button variant="contained" onClick={saveModel}>Save Model</Button>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {renderDataGrid(metadataRows, metadataColumns, handleMetadataUpdate)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderDataGrid(
            products.map((product: ProductsForModelItem, index: number) => ({
              id: index + 1,
              ...product
            })),
            productColumns,
            handleProductUpdate
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderDataGrid(
            convertProductDateKeysToRows(receipts),
            productDateKeysColumns,
            handleProductDateKeysUpdate(updateReceipts)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderDataGrid(
            convertProductDateKeysToRows(dailyOpenOrders),
            productDateKeysColumns,
            handleProductDateKeysUpdate(updateDailyOpenOrders)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {renderDataGrid(
            convertProductDateKeysToRows(dailyDemandForecast),
            productDateKeysColumns,
            handleProductDateKeysUpdate(updateDailyDemandForecast)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          {renderDataGrid(
            convertProductFormulationToRows(productFormulation),
            productFormulationColumns,
            handleProductFormulationUpdate
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          {renderDataGrid(
            convertUnitProductDateKeysToRows(scheduleItem),
            scheduleItemColumns,
            handleScheduleItemUpdate
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={7}>
          {renderDataGrid(
            convertUnitYieldToRows(unitYieldItem),
            unitYieldColumns,
            handleUnitYieldUpdate
          )}
        </TabPanel>
      </Box>
    </Container>
  );
}; 