import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { Model, ModelMetaData, ProductsForModelItem, ProductDateKeys, ProductFormulationsObject, UnitProductDateKeys, UnitYieldObject, ModelContextType } from '../types';

const ModelContext = createContext<ModelContextType | null>(null);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Separate state for each part of the model
  const [metadata, setMetadata] = useState<ModelMetaData | null>(null);
  const [products, setProducts] = useState<ProductsForModelItem[]>([]);
  const [receipts, setReceipts] = useState<ProductDateKeys>({});
  const [dailyOpenOrders, setDailyOpenOrders] = useState<ProductDateKeys>({});
  const [dailyDemandForecast, setDailyDemandForecast] = useState<ProductDateKeys>({});
  const [productFormulation, setProductFormulation] = useState<ProductFormulationsObject>({});
  const [scheduleItem, setScheduleItem] = useState<UnitProductDateKeys>({});
  const [unitYieldItem, setUnitYieldItem] = useState<UnitYieldObject>({});

  // Combine all parts into a complete model
  const getCompleteModel = (): Model | null => {
    if (!metadata) return null;
    
    return {
      ModelMetaData: metadata,
      ProductsForModelItem: products,
      Receipts: receipts,
      DailyOpenOrders: dailyOpenOrders,
      DailyDemandForecast: dailyDemandForecast,
      ProductFormulation: productFormulation,
      ScheduleItem: scheduleItem,
      UnitYieldItem: unitYieldItem
    };
  };

  const loadModel = async (id: string) => {
    console.debug('loadModel: loading model with id', id);
    try {
      const response = await axios.post(`http://localhost:8001/forecast-model/load/${id}`);
      const modelData: Model = response.data;
      console.debug('loadModel: received data', modelData);
      
      // Set each part separately
      setMetadata(modelData.ModelMetaData);
      setProducts(modelData.ProductsForModelItem);
      setReceipts(modelData.Receipts);
      setDailyOpenOrders(modelData.DailyOpenOrders);
      setDailyDemandForecast(modelData.DailyDemandForecast);
      setProductFormulation(modelData.ProductFormulation);
      setScheduleItem(modelData.ScheduleItem);
      setUnitYieldItem(modelData.UnitYieldItem);
      console.debug('loadModel: state updated successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
      }
      throw error;
    }
  };

  const saveModel = async () => {
    console.debug('saveModel: attempting to save');
    const completeModel = getCompleteModel();
    if (!completeModel) {
      console.error('saveModel: cannot save, model is null');
      return;
    }

    try {
      const endpoint = completeModel.ModelMetaData.uid
        ? `http://localhost:8001/forecast-model/save/${completeModel.ModelMetaData.uid}`
        : 'http://localhost:8001/forecast-model/save';
      
      console.debug('saveModel: saving to endpoint', endpoint);
      const response = await axios.post(endpoint, completeModel);
      console.debug('saveModel: save successful', response.data);
    } catch (error) {
      console.error('Error saving model:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
      }
      throw error;
    }
  };

  const updateMetaData = (data: Partial<ModelMetaData>) => {
    if (!metadata) {
      console.warn('updateMetaData: metadata is null, update skipped');
      return;
    }
    console.debug('updateMetaData: updating with', data);
    setMetadata({ ...metadata, ...data });
  };

  const updateProduct = (index: number, product: ProductsForModelItem) => {
    console.debug('updateProduct: updating index', index, 'with', product);
    const newProducts = [...products];
    newProducts[index] = product;
    setProducts(newProducts);
  };

  const updateReceipts = (productCode: string, date: string, value: number) => {
    console.debug('updateReceipts:', { productCode, date, value });
    setReceipts(prev => {
      const updated = {
        ...prev,
        [productCode]: {
          ...prev[productCode],
          [date]: value
        }
      };
      console.debug('updateReceipts: new state', updated);
      return updated;
    });
  };

  const updateDailyOpenOrders = (productCode: string, date: string, value: number) => {
    console.debug('updateDailyOpenOrders:', { productCode, date, value });
    setDailyOpenOrders(prev => {
      const updated = {
        ...prev,
        [productCode]: {
          ...prev[productCode],
          [date]: value
        }
      };
      console.debug('updateDailyOpenOrders: new state', updated);
      return updated;
    });
  };

  const updateDailyDemandForecast = (productCode: string, date: string, value: number) => {
    console.debug('updateDailyDemandForecast:', { productCode, date, value });
    setDailyDemandForecast(prev => {
      const updated = {
        ...prev,
        [productCode]: {
          ...prev[productCode],
          [date]: value
        }
      };
      console.debug('updateDailyDemandForecast: new state', updated);
      return updated;
    });
  };

  const updateProductFormulation = (productCode: string, componentCode: string, formulaPercent: number) => {
    console.debug('updateProductFormulation:', { productCode, componentCode, formulaPercent });
    setProductFormulation(prev => {
      const updated = {
        ...prev,
        [productCode]: prev[productCode]?.map(component => 
          component.ComponentCode === componentCode 
            ? { ...component, FormulaPercent: formulaPercent }
            : component
        ) || []
      };
      console.debug('updateProductFormulation: new state', updated);
      return updated;
    });
  };

  const updateScheduleItem = (unit: string, productCode: string, date: string, value: number) => {
    console.debug('updateScheduleItem:', { unit, productCode, date, value });
    setScheduleItem(prev => {
      const updated = {
        ...prev,
        [unit]: {
          ...prev[unit],
          [productCode]: {
            ...prev[unit]?.[productCode],
            [date]: value
          }
        }
      };
      console.debug('updateScheduleItem: new state', updated);
      return updated;
    });
  };

  const updateUnitYield = (unit: string, chargeProductCode: string, outputProductCode: string, outputPercent: number) => {
    console.debug('updateUnitYield:', { unit, chargeProductCode, outputProductCode, outputPercent });
    setUnitYieldItem(prev => {
      const updated = {
        ...prev,
        [unit]: {
          ...prev[unit],
          [chargeProductCode]: prev[unit]?.[chargeProductCode]?.map(output =>
            output.Output_ProductCode === outputProductCode
              ? { ...output, OutputPercent: outputPercent }
              : output
          ) || []
        }
      };
      console.debug('updateUnitYield: new state', updated);
      return updated;
    });
  };

  return (
    <ModelContext.Provider value={{
      model: getCompleteModel(),
      metadata,
      products,
      receipts,
      dailyOpenOrders,
      dailyDemandForecast,
      productFormulation,
      scheduleItem,
      unitYieldItem,
      loadModel,
      saveModel,
      updateMetaData,
      updateProduct,
      updateReceipts,
      updateDailyOpenOrders,
      updateDailyDemandForecast,
      updateProductFormulation,
      updateScheduleItem,
      updateUnitYield
    }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}; 