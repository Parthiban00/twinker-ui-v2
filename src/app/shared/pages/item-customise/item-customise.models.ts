export interface CustomizationOption {
  _id: string;
  name: string;
  price: number;
  isDefault?: boolean;
  isAvailable?: boolean;
}

export interface CustomizationGroup {
  _id: string;
  groupName: string;
  type: 'single' | 'multi';
  required: boolean;
  maxSelect?: number;
  options: CustomizationOption[];
}
