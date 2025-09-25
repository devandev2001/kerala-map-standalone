/**
 * Drilldown Data Manager
 * Ensures data loads properly at every drilldown level
 */

import { getACVoteShareData } from './loadACVoteShareData';
import { getMandalVoteShareData } from './loadMandalVoteShareData';
import { getLocalBodyVoteShareData } from './loadLocalBodyVoteShareData';
import { getZoneTargetData } from './loadZoneTargetData';
import { getOrgDistrictTargetData } from './loadOrgDistrictTargetData';
import { getACTargetData } from './loadACTargetData';
import { getMandalTargetData } from './loadMandalTargetData';
import { getZoneContactData } from './loadZoneContactData';
import { getMandalContactData } from './loadMandalContactData';
import { getLocalBodyContactData } from './loadLocalBodyContactData';

export interface MapContext {
  level: 'zones' | 'orgs' | 'acs' | 'mandals' | 'panchayats' | 'wards';
  zone: string;
  org: string;
  ac: string;
  mandal: string;
}

export interface DrilldownData {
  performance: any[];
  targets: any[];
  contacts: any[];
  errors: string[];
  warnings: string[];
}

/**
 * Get data for the current drilldown level
 */
export function getDrilldownData(context: MapContext): DrilldownData {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    console.log('🎯 Getting drilldown data for context:', context);
    
    // Get performance data based on level
    const performance = getPerformanceData(context, errors, warnings);
    
    // Get target data based on level
    const targets = getTargetData(context, errors, warnings);
    
    // Get contact data based on level
    const contacts = getContactData(context, errors, warnings);
    
    console.log('✅ Drilldown data retrieved:', {
      performance: performance.length,
      targets: targets.length,
      contacts: contacts.length,
      errors: errors.length,
      warnings: warnings.length
    });
    
    return {
      performance,
      targets,
      contacts,
      errors,
      warnings
    };
    
  } catch (error) {
    console.error('❌ Error getting drilldown data:', error);
    errors.push(`Failed to get drilldown data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      performance: [],
      targets: [],
      contacts: [],
      errors,
      warnings
    };
  }
}

/**
 * Get performance data for the current context
 */
function getPerformanceData(context: MapContext, errors: string[], warnings: string[]): any[] {
  try {
    switch (context.level) {
      case 'zones':
        // Show zone-level summary data
        return getZonePerformanceData();
        
      case 'orgs':
        if (context.zone) {
          // Show org district level data for the current zone
          const acData = getACVoteShareData(context.org, context.zone);
          if (acData.length === 0) {
            warnings.push(`No AC data found for ${context.org} in ${context.zone}`);
          }
          return acData;
        }
        break;
        
      case 'acs':
        if (context.zone && context.org) {
          // Show AC-level data for the current org district
          const acData = getACVoteShareData(context.org, context.zone);
          if (acData.length === 0) {
            warnings.push(`No AC data found for ${context.org} in ${context.zone}`);
          }
          return acData;
        }
        break;
        
      case 'mandals':
        if (context.zone && context.org && context.ac) {
          // Show Mandal-level data for the current AC
          const mandalData = getMandalVoteShareData(context.ac, context.org, context.zone);
          if (mandalData.length === 0) {
            warnings.push(`No mandal data found for ${context.ac} in ${context.org}, ${context.zone}`);
          }
          return mandalData;
        }
        break;
        
      case 'panchayats':
      case 'wards':
        if (context.zone && context.org && context.ac && context.mandal) {
          // Show Local Body data for the current Mandal
          const localBodyData = getLocalBodyVoteShareData(context.mandal, context.ac, context.org, context.zone);
          if (localBodyData.length === 0) {
            warnings.push(`No local body data found for ${context.mandal} in ${context.ac}, ${context.org}, ${context.zone}`);
          }
          return localBodyData;
        }
        break;
    }
    
    return [];
    
  } catch (error) {
    console.error('❌ Error getting performance data:', error);
    errors.push(`Failed to get performance data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}

/**
 * Get target data for the current context
 */
function getTargetData(context: MapContext, errors: string[], warnings: string[]): any[] {
  try {
    switch (context.level) {
      case 'zones':
        return getZoneTargetData();
        
      case 'orgs':
        if (context.zone) {
          return getOrgDistrictTargetData(context.zone);
        }
        break;
        
      case 'acs':
        if (context.zone && context.org) {
          return getACTargetData(context.zone, context.org);
        }
        break;
        
      case 'mandals':
        if (context.zone && context.org && context.ac) {
          return getMandalTargetData(context.zone, context.org, context.ac);
        }
        break;
        
      case 'panchayats':
      case 'wards':
        // Local body targets - could be implemented if data is available
        warnings.push('Local body target data not yet implemented');
        return [];
    }
    
    return [];
    
  } catch (error) {
    console.error('❌ Error getting target data:', error);
    errors.push(`Failed to get target data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}

/**
 * Get contact data for the current context
 */
function getContactData(context: MapContext, errors: string[], warnings: string[]): any[] {
  try {
    switch (context.level) {
      case 'zones':
        return getZoneContactData();
        
      case 'orgs':
        if (context.zone) {
          // Org district contacts - could be implemented if data is available
          warnings.push('Org district contact data not yet implemented');
          return [];
        }
        break;
        
      case 'acs':
        if (context.zone && context.org) {
          // AC contacts - could be implemented if data is available
          warnings.push('AC contact data not yet implemented');
          return [];
        }
        break;
        
      case 'mandals':
        if (context.zone && context.org && context.ac) {
          return getMandalContactData(context.zone, context.org, context.ac);
        }
        break;
        
      case 'panchayats':
      case 'wards':
        if (context.zone && context.org && context.ac && context.mandal) {
          return getLocalBodyContactData(context.zone, context.org, context.ac, context.mandal);
        }
        break;
    }
    
    return [];
    
  } catch (error) {
    console.error('❌ Error getting contact data:', error);
    errors.push(`Failed to get contact data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}

/**
 * Get zone-level performance data (summary)
 */
function getZonePerformanceData(): any[] {
  // This could be implemented to show zone-level summaries
  // For now, return empty array as zone-level data is handled differently
  return [];
}

/**
 * Validate context for data loading
 */
export function validateContext(context: MapContext): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  if (!context.level) {
    missingFields.push('level');
  }
  
  if (!context.zone) {
    missingFields.push('zone');
  }
  
  if (['orgs', 'acs', 'mandals', 'panchayats', 'wards'].includes(context.level) && !context.org) {
    missingFields.push('org');
  }
  
  if (['acs', 'mandals', 'panchayats', 'wards'].includes(context.level) && !context.ac) {
    missingFields.push('ac');
  }
  
  if (['mandals', 'panchayats', 'wards'].includes(context.level) && !context.mandal) {
    missingFields.push('mandal');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Get data loading status for the current context
 */
export function getDataLoadingStatus(context: MapContext): {
  isLoading: boolean;
  isLoaded: boolean;
  hasErrors: boolean;
  dataCounts: {
    performance: number;
    targets: number;
    contacts: number;
  };
} {
  const validation = validateContext(context);
  
  if (!validation.isValid) {
    return {
      isLoading: false,
      isLoaded: false,
      hasErrors: true,
      dataCounts: { performance: 0, targets: 0, contacts: 0 }
    };
  }
  
  try {
    const data = getDrilldownData(context);
    
    return {
      isLoading: false,
      isLoaded: true,
      hasErrors: data.errors.length > 0,
      dataCounts: {
        performance: data.performance.length,
        targets: data.targets.length,
        contacts: data.contacts.length
      }
    };
    
  } catch (error) {
    return {
      isLoading: false,
      isLoaded: false,
      hasErrors: true,
      dataCounts: { performance: 0, targets: 0, contacts: 0 }
    };
  }
}
