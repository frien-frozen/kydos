export const ROLE_PERMISSIONS: Record<string, { label: string; href: string }[]> = {
  ADMIN: [
    { label: "Admin Hub", href: "/admin" },
    { label: "Course Catalog", href: "/admin/courses" },
    { label: "Tuition CRM", href: "/admin/tuition" }
  ],
  PRINCIPAL: [
    { label: "School Stats", href: "/dashboard/school-stats" },
    { label: "Revenue", href: "/dashboard/revenue" },
    { label: "Catalog", href: "/catalog" }
  ],
  DIRECTOR: [
    { label: "Courses", href: "/admin/courses" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Course Stats", href: "/dashboard/course-stats" }
  ],
  TEACHER: [
    { label: "Teacher Portal", href: "/teacher/courses" },
    { label: "Students", href: "/teacher/students" },
    { label: "Grading", href: "/teacher/grading" }
  ],
  ACCOUNTANT: [
    { label: "Accounting", href: "/accounting" },
    { label: "Revenue", href: "/accounting/revenue" }
  ],
  STUDENT: [
    { label: "My Courses", href: "/dashboard" },
    { label: "Catalog", href: "/courses" },
    { label: "Classroom", href: "/classroom" }
  ],
  PARENT: [
    { label: "Child Progress", href: "/parent" }
  ],
  PENDING: []
};

// Raw path prefixes that represent sub-directory level capabilities
export const ROLE_PATHS: Record<string, string[]> = {
  ADMIN: ['*'],
  PRINCIPAL: ['/dashboard/school-stats', '/dashboard/revenue', '/catalog'],
  DIRECTOR: ['/admin/courses', '/admin/teachers', '/dashboard/course-stats'],
  TEACHER: ['/teacher/courses', '/teacher/students', '/teacher/grading'],
  ACCOUNTANT: ['/accounting', '/accounting/revenue'],
  STUDENT: ['/dashboard', '/courses', '/classroom'],
  PARENT: ['/parent'],
  PENDING: []
};

export function hasAccess(role: string, currentPath: string): boolean {
  if (role === "ADMIN") return true; 

  // Normalize path by removing trailing slashes except for root
  const normalizedPath = currentPath.endsWith('/') && currentPath.length > 1 
    ? currentPath.slice(0, -1) 
    : currentPath;

  const allowedPaths = ROLE_PATHS[role] || [];
  
  return allowedPaths.some(allowedPath => {
    // Exact match or sub-route match (e.g. /courses matches /courses/123)
    if (allowedPath === normalizedPath) return true;
    if (normalizedPath.startsWith(allowedPath + '/')) return true;
    return false;
  });
}
