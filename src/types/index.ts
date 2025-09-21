export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export interface FilterDropdownProps {
  name: string;
  options: string[];
  onSelect?: (option: string) => void;
  disabled?: boolean;
  selectedValue?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface LoginPageProps {
  onLogin: () => void;
}

export interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  isOpen: boolean;
}

export interface ProgressBarProps {
  value: number;
  max: number;
}

export interface PercentageBarProps {
  percentage: number;
}

export interface OrganizationalVoters {
  total: number;
  male: number;
  female: number;
  thirdGender: number;
  hindu: number;
  muslim: number;
  christian: number;
}

export interface DistrictData {
  name: string;
  corporations: number;
  municipalities: number;
  panchayats: number;
  totalWards: number;
  completionPercentage: number;
}

export interface WardTarget {
  id: number;
  ward: string;
  contactTarget: number;
  contactActual: number;
  committeeStatus: 'Formed' | 'In Progress' | 'Not Started';
}

export interface TargetData {
  overview: {
    voterContactTarget: number;
    voterContactActual: number;
    boothCommitteeTarget: number;
    boothCommitteeActual: number;
    newKaryakarthaTarget: number;
    newKaryakarthaActual: number;
  };
  wardTargets: WardTarget[];
}

export interface Leader {
  position: string;
  name: string;
  phone: string;
}

export interface ProminentLeader {
  name: string;
  position: string;
  number: string;
}

export interface VikasitaKeralamMember {
  name: string;
  details: string;
}

export interface MicroLevelOrgData {
  leaders: Leader[];
  prominentLeaders: ProminentLeader[];
  vikasitaKeralamTeam: VikasitaKeralamMember[];
}