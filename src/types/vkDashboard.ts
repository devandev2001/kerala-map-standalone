export interface VKDataRow {
  tab: string;
  district: string;
  assemblyMandals: string[];
  orgMandals: string[];
  panchayats: string[];
}

export interface VKFilterState {
  tab: string;
  district: string;
  assemblyMandal: string;
  orgMandal: string;
  panchayat: string;
}

export interface VKTabUrls {
  [key: string]: string;
}

export interface VKFilterOptions {
  tabs: string[];
  districts: string[];
  assemblyMandals: string[];
  orgMandals: string[];
  panchayats: string[];
}

export interface VKFilterCounts {
  tab: number;
  district: number;
  assemblyMandal: number;
  orgMandal: number;
  panchayat: number;
}