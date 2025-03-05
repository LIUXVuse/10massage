export type Gender = "MALE" | "FEMALE";

export interface GenderPrice {
  id?: string;
  gender: Gender;
  price: number;
  serviceName?: string;
}

export interface AreaPrice {
  id?: string;
  areaName: string;
  price: number;
  gender?: Gender | null;
  description?: string;
}

export interface AddonOption {
  id?: string;
  name: string;
  description?: string;
  price: number;
  isRequired: boolean;
}

export interface CustomOption {
  id?: string;
  bodyPart?: string;
  customDuration?: number;
  customPrice?: number;
}

export interface Service {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  duration: number;
  price: number;
  isLimitedTime?: boolean;
  limitedTimeStart?: Date;
  limitedTimeEnd?: Date;
  limitedSpecialPrice?: number;
  limitedDiscountPercent?: number;
  limitedNote?: string;
  isFlashSale?: boolean;
  flashSaleStart?: Date;
  flashSaleEnd?: Date;
  flashSaleNote?: string;
  active?: boolean;
  masseursIds?: string[];
  durations?: {
    id?: string;
    duration: number;
    price: number;
  }[];
  genderPrices?: GenderPrice[];
  areaPrices?: AreaPrice[];
  addons?: AddonOption[];
  customOptions?: CustomOption[];
} 