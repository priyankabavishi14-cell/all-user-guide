export const currentUser = {
  id: "user-1",
  name: "Priyanka Bavishi",
  email: "priyanka.bavishi14@gmail.com",
  phone: "+1234567890",
  isSuperAdmin: false,
  createdAt: "2026-01-15T10:00:00Z",
};

export const projects = [
  {
    id: "project-1",
    title: "SellSync Application",
    slug: "sellsync-app",
    description: "SellSync Application User Guide",
    frontendUrl: "sellsync-app.guide",
    backendUrl: "sellsync-app-admin.guide",
    isActive: true,
    welcomeScreenEnabled: true,
    createdBy: "user-1",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "project-2",
    title: "SellSync Website",
    slug: "sellsync-website",
    description: "Sellsync Website User Guide",
    frontendUrl: "sellsync-website.guide",
    backendUrl: "sellsync-website-admin.guide",
    isActive: true,
    welcomeScreenEnabled: true,
    createdBy: "user-1",
    createdAt: "2026-02-10T09:00:00Z",
  },
];

export const pages = [
  {
    id: "page-1",
    projectId: "project-2",
    title: "Introduction",
    slug: "introduction",
    sequence: 1,
    icon: "📄",
    parentId: null,
    description: "Getting started with SellSync Website",
    content: "# Introduction\n\nWelcome to the SellSync Website guide.",
    isActive: true,
    createdAt: "2026-04-24T14:27:00Z",
    updatedAt: "2026-04-24T14:27:00Z",
  },
  {
    id: "page-2",
    projectId: "project-2",
    title: "Locations",
    slug: "locations",
    sequence: 2,
    icon: "📄",
    parentId: null,
    description: "Managing locations in SellSync",
    content: "# Locations\n\nLearn how to manage your locations.",
    isActive: true,
    createdAt: "2026-04-23T15:03:00Z",
    updatedAt: "2026-04-23T15:03:00Z",
  },
  {
    id: "page-3",
    projectId: "project-2",
    title: "Manage Locations",
    slug: "manage-locations",
    sequence: 1,
    icon: "📑",
    parentId: "page-2",
    description: "Listing, Add, Edit, Delete, Filters",
    content: "# Manage Locations\n\nListing, Add, Edit, Delete, Filters.",
    isActive: true,
    createdAt: "2026-04-23T15:04:00Z",
    updatedAt: "2026-04-23T15:04:00Z",
  },
];

export const activeProject = projects[1];

export const dashboardStats = {
  totalPages: 3,
  welcomeScreenEnabled: true,
};
