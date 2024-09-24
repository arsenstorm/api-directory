export interface APIConfig {
  details?: {
    name: string;
    oneLiner?: string;
    tag?: string;
  };
  pricing?: {
    estimated?: number;
    price?: number | null; // null means the price is dynamically calculated
  };
  env?: string[];
  request: {
    method: string;
    type: string;
  };
  inputs: {
    id: string;
    type: string;
    name: string;
    blur?: boolean;
    description?: string;
    required?: boolean;
  }[];
  outputs?: {
    id: string;
    type: string;
    name: string;
    blur?: boolean;
    description?: string;
  }[];
}
