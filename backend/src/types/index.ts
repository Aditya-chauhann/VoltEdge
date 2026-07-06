export interface CJVariant {
  vid: string;
  variantName: string;
  variantImage?: string;
  variantSellPrice: number;
  variantSku?: string;
  stock?: number;
}

export interface CJProduct {
  pid: string;
  productName: string;
  productNameEn: string;
  productImage: string;
  productImages?: string[];
  sellPrice: number;
  sourcePrice?: number;
  categoryId: string;
  categoryName: string;
  description?: string;
  productWeight?: number;
  packMaterial?: string;
  materials?: string[];
  rating?: number; // added rating
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: string;
  };
  variants?: CJVariant[];
}

export interface CJProductListResponse {
  list: CJProduct[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface CJCategoryFirst {
  categoryFirstId: string;
  categoryFirstName: string;
  categoryFirstList: Array<{
    categorySecondId: string;
    categorySecondName: string;
    categorySecondList: Array<{
      categoryId: string;
      categoryName: string;
    }>;
  }>;
}

export interface CJHomeCategory {
  id: string;
  name: string;
  slug?: string;
  cjCategoryId?: string;
  categoryFirstId?: string;
  categoryFirstName?: string;
  categorySecondId?: string;
  categorySecondName?: string;
  children?: Array<{
    id: string;
    name: string;
  }>;
}

export interface CJOrderPayload {
  orderNumber: string;
  shippingZip: string;
  shippingCountryCode: string;
  shippingCountry: string;
  shippingProvince: string;
  shippingCity: string;
  shippingAddress: string;
  shippingCustomerName: string;
  shippingPhone: string;
  remark?: string;
  fromCountryCode: string;
  logisticName: string;
  products: Array<{
    vid: string;
    quantity: number;
  }>;
}

export interface CJItemFulfillment {
  orderId?: string;
  orderNumber?: string;
  vid?: string;
  warehouseCountryCode?: string;
  availableQty?: number;
}

export interface CJTrackingInfo {
  trackingNumber: string;
  logisticName?: string;
  status: string;
  carrier?: string;
  details?: Array<{
    date: string;
    activity: string;
    location: string;
  }>;
  events?: any; // To fix TS error for mock data
}

export interface CJFreightRequest {
  startCountryCode: string;
  endCountryCode: string;
  zip?: string;
  products: Array<{ quantity: number; vid: string }>;
}

export interface CJFreightOption {
  logisticName?: string;
  price?: number;
  aging?: string;
  id?: string;
  name?: string;
  cost?: number;
  days?: string;
  carrier?: string;
}
