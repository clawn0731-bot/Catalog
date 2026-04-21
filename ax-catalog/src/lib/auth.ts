/**
 * Mock authentication module.
 * Structured so SSO (SAML/OIDC) can replace the mock user lookup later.
 * The getCurrentUser() function is the single entry point for auth context.
 */

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  avatarUrl?: string;
};

const MOCK_USERS: AuthUser[] = [
  {
    id: "user-admin",
    email: "admin@kt.com",
    name: "김관리",
    role: "ADMIN",
  },
  {
    id: "user-editor",
    email: "editor@kt.com",
    name: "이편집",
    role: "EDITOR",
  },
  {
    id: "user-viewer",
    email: "viewer@kt.com",
    name: "박열람",
    role: "VIEWER",
  },
];

// Default mock user for development
let currentUserId = "user-admin";

export function getCurrentUser(): AuthUser {
  return MOCK_USERS.find((u) => u.id === currentUserId) ?? MOCK_USERS[0];
}

export function setCurrentUser(userId: string) {
  currentUserId = userId;
}

export function getAllUsers(): AuthUser[] {
  return MOCK_USERS;
}

export function canEdit(user: AuthUser): boolean {
  return user.role === "ADMIN" || user.role === "EDITOR";
}

export function canAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN";
}
