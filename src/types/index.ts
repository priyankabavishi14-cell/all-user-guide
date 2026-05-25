export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  frontendUrl: string;
  backendUrl: string;
  isActive: boolean;
  welcomeScreenEnabled: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Page {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  sequence: number;
  icon: string;
  parentId: string | null;
  description: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export interface ProjectUser {
  id: string;
  projectId: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  accessType: 'full' | 'restricted';
  createdAt: string;
  allowedPageIds: string[];
}

export interface DashboardStats {
  totalPages: number;
  welcomeScreenEnabled: boolean;
}

export interface ReaderType {
  id: string;
  projectId: string;
  name: string;
  token: string;
  readerSlug: string;
  pageIds: string[];
  createdAt: string;
}
