import { test as base, Page } from '@playwright/test';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'ADMIN' | 'COMPANY_ADMIN' | 'EMPLOYEE' | 'VIEWER';
  companyId: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestCompany {
  id: string;
  name: string;
  registrationNumber: string;
  vatNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    primaryEmail: string;
    primaryPhone: string;
    emergencyContact: {
      name: string;
      phone: string;
      email: string;
      relationship: string;
    };
  };
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  creditLimit: number;
  creditUsed: number;
  industryType: string;
  employees: string[];
  paymentTerms: string;
  isActive: boolean;
  createdAt: string;
}

export const defaultTestUser: TestUser = {
  id: 'test-user-001',
  email: 'test@testcompany.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+48123456789',
  role: 'COMPANY_ADMIN',
  companyId: 'test-company-001',
  permissions: [
    'CREATE_REQUEST',
    'VIEW_REQUEST',
    'EDIT_REQUEST',
    'DELETE_REQUEST',
    'MANAGE_TEAM',
    'VIEW_BILLING',
    'MANAGE_BILLING',
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const defaultTestCompany: TestCompany = {
  id: 'test-company-001',
  name: 'Test Transport Company',
  registrationNumber: 'TEST123456',
  vatNumber: 'PL1234567890',
  address: {
    street: 'ul. Testowa 123',
    city: 'Warsaw',
    postalCode: '00-001',
    country: 'Poland',
  },
  contactInfo: {
    primaryEmail: 'contact@testcompany.com',
    primaryPhone: '+48123456789',
    emergencyContact: {
      name: 'Emergency Contact',
      phone: '+48987654321',
      email: 'emergency@testcompany.com',
      relationship: 'Manager',
    },
  },
  billingAddress: {
    street: 'ul. Testowa 123',
    city: 'Warsaw',
    postalCode: '00-001',
    country: 'Poland',
  },
  creditLimit: 100000,
  creditUsed: 15000,
  industryType: 'Logistics',
  employees: ['test-user-001'],
  paymentTerms: 'NET_30',
  isActive: true,
  createdAt: new Date().toISOString(),
};

async function setupAuth(page: Page, user: TestUser = defaultTestUser, company: TestCompany = defaultTestCompany): Promise<void> {
  await page.addInitScript(
    ({ user, company }) => {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_company', JSON.stringify(company));
      localStorage.setItem('auth_isAuthenticated', 'true');
    },
    { user, company }
  );
}

async function clearAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_company');
    localStorage.removeItem('auth_isAuthenticated');
  });
}

type AuthFixtures = {
  authenticatedPage: Page;
  unauthenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await setupAuth(page);
    await use(page);
  },
  unauthenticatedPage: async ({ page }, use) => {
    await clearAuth(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
