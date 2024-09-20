export interface APIConfig {
  details?: {
    name: string;
    oneLiner?: string;
    tag?: string;
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
}
