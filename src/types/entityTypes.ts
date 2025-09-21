export interface GramaPanchayatEntity {
  id: string;
  name: string; // Grama Panchayat Name
  district: string; // District
  organisationalDistrict: string; // Organisational District
  assemblyConstituency: string; // Assembly Constituency
  organisationalMandal: string; // Organisational Mandal
  president: string; // President
  progress: number; // Progress (assuming a percentage 0-100)
  lastUpdated: Date; // Last Updated
  contact: string; // Contact (phone/email)
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// This interface can be used for both the database model and the UI table
export interface GramaPanchayatTableRow {
  id: string;
  name: string;
  district: string;
  organisationalDistrict: string;
  assemblyConstituency: string;
  organisationalMandal: string;
  president: string;
  progress: number;
  lastUpdated: string; // Formatted date string for display
  contact: string;
}

// Type for creating a new entity
export type CreateGramaPanchayatEntity = Omit<GramaPanchayatEntity, 
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

// Type for updating an entity
export type UpdateGramaPanchayatEntity = Partial<CreateGramaPanchayatEntity>;
