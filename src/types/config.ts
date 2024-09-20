export interface APIConfig {
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
