export interface Model {
  ModelMetaData: ModelMetaData;
  ProductsForModelItem: ProductsForModelItem[],
  Receipts:ProductDateKeys,
  DailyOpenOrders:ProductDateKeys,
  DailyDemandForecast:ProductDateKeys,
  ProductFormulation:ProductFormulationsObject,
  ScheduleItem:UnitProductDateKeys,
  UnitYieldItem:UnitYieldObject;
}

export interface ModelMetaData {
  createdDate: number;
  lastUpdated: number;
  startDate: number;
  runDays: number;
  uid: string;
  modelName: string;
  id_description: string;
}

export interface ProductsForModelItem {
  ProductCode: string
  ProductDescription: string
  TankCapacityGals: number
  CurrentInventoryGals: number
}

export interface ProductDateKeys {
  [ProductCode:string]:{
      [Date:string]:
      number;
  };
}

export interface ProductFormulationItem {
  Finished_ProductCode: string;
  Component_ProductCode: string;
  FormulaPercent: number;
}

export interface UnitProductDateKeys {
  [Unit:string]:{
       [ProductCode:string]:{
          [Date:string]:number
       }
      }
  }

export type UnitYieldObject = {
  [Unit: string]: {
  [Charge_ProductCode: string]:{Output_ProductCode: string,OutputPercent: number}[];     
  }
  }

export type ProductFormulationsObject = {
  [ProductCode: string]: { ComponentCode: string, FormulaPercent: number }[];
  }

export interface ModelContextType {
  model: Model | null;
  metadata: ModelMetaData | null;
  products: ProductsForModelItem[];
  receipts: ProductDateKeys;
  dailyOpenOrders: ProductDateKeys;
  dailyDemandForecast: ProductDateKeys;
  productFormulation: ProductFormulationsObject;
  scheduleItem: UnitProductDateKeys;
  unitYieldItem: UnitYieldObject;
  loadModel: (id: string) => Promise<void>;
  saveModel: () => Promise<void>;
  updateMetaData: (data: Partial<ModelMetaData>) => void;
  updateProduct: (index: number, product: ProductsForModelItem) => void;
  updateReceipts: (productCode: string, date: string, value: number) => void;
  updateDailyOpenOrders: (productCode: string, date: string, value: number) => void;
  updateDailyDemandForecast: (productCode: string, date: string, value: number) => void;
  updateProductFormulation: (productCode: string, componentCode: string, formulaPercent: number) => void;
  updateScheduleItem: (unit: string, productCode: string, date: string, value: number) => void;
  updateUnitYield: (unit: string, chargeProductCode: string, outputProductCode: string, outputPercent: number) => void;
} 