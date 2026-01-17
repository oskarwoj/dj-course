---
name: vsa-refactor
description: Guides refactoring code to Vertical Slices Architecture. Use when creating new features, reorganizing code by feature boundaries, or migrating from layered architecture to feature-based structure.
---

# Vertical Slices Architecture (VSA)

The application must follow the **vertical slices architecture** pattern. Each functional module should have its own directory inside the `features` directory (e.g., `src/features/orders-listing`, `src/features/driver-management`).

## Vertical Slice Principles

- Organizes code by feature or use case, not by technical layer.
- Groups all logic for a feature (UI, business, data access) together.
- Aims for high cohesion within each slice.
- Minimizes coupling between different slices.
- Encourages independent development, testing, and deployment of features.
- Simplifies understanding and navigation by focusing on business functionality.
- Avoids large, monolithic layers shared by unrelated features.
- Prevents code scattering and tangling across multiple layers.
- Reduces risk of unintended side effects when changing a feature.
- Discourages shared abstractions and infrastructure unless truly needed.

## Tech Details

Most code should live inside its respective module in `src/features`, even if this leads to some redundancy. Only highly reusable code (used by many modules) should be placed outside `features`:

**Shared code locations:**
- `src/components/ui/` - shadcn/ui primitives (Button, Card, Table, etc.)
- `src/components/layout/` - App shell (Layout, Header, Sidebar)
- `src/components/` - Truly shared components (ErrorBoundary, LoadingSpinner, Currency)
- `src/hooks/` - Generic hooks used across features (use-mobile, useOnClickOutside)
- `src/lib/` - Utilities (date, pdf, tailwind utils)
- `src/auth/` - Authentication context and session management

## Feature Slice Structure

Each feature slice has its own directory. All feature code keeps its code locally. This includes (but is not limited to):

### Components

- **Main page file** for the whole page, e.g., `OrdersListing.tsx`
- **Sub-components** extracted from the main page file according to UI structure:
  - Separate component for data tables
  - Separate component for filtering
  - Separate component for stats/summaries
  - Separate component for modals/dialogs

Example structure:
```
src/features/orders-listing/
├── OrdersListing.tsx           # Main page component
├── OrdersTable.tsx             # Data table component
├── OrderFilters.tsx            # Filtering component
├── OrderStatsCard.tsx          # Stats summary component
└── NewOrderDialog.tsx          # Modal for creating new order
```

### Models (Types)

- Files should be named `*.model.ts`
- Contains TypeScript interfaces and types for the feature
- Example: `order.model.ts`

```typescript
// src/features/orders-listing/order.model.ts
export interface Order {
  id: number;
  customer: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';
  amount: string;
  date: string;
}

export interface OrderFilters {
  status?: string;
  dateRange?: [Date, Date];
}
```

### API Layer

Data loading should be split into HTTP functions and React Query hooks:

**HTTP file (`*.http.ts`):**
- Contains async fetch functions
- Handles mock mode via `MOCK_MODE` from `@/http/mock-utils`
- Uses `API_BASE_URL` from `@/http/http.config`
- Example: `orders.http.ts`

```typescript
// src/features/orders-listing/orders.http.ts
import { Order } from './order.model';
import { mockOrders } from './orders.mocks';
import { API_BASE_URL } from '@/http/http.config';
import { getAuthHeaders } from '@/auth/session.token';
import { delay, MOCK_MODE } from '@/http/mock-utils';

export async function getOrders(): Promise<Order[]> {
  if (MOCK_MODE) {
    await delay(300, 500);
    return mockOrders;
  }
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
```

**Queries file (`*.queries.ts`):**
- Contains React Query hooks using `@tanstack/react-query`
- Wraps HTTP functions with `useQuery` or `useMutation`
- Example: `orders.queries.ts`

```typescript
// src/features/orders-listing/orders.queries.ts
import { useQuery } from '@tanstack/react-query';
import { getOrders, getOrderDetails } from './orders.http';

export const useOrdersQuery = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(),
  });
};

export const useOrderDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderDetails(id),
    enabled: !!id,
  });
};
```

### Mocks

- Files should be named `*.mocks.ts`
- Relies on model files from its own slice
- Example: `orders.mocks.ts`

```typescript
// src/features/orders-listing/orders.mocks.ts
import { Order } from './order.model';

export const mockOrders: Order[] = [
  { id: 1, customer: 'Acme Corp', status: 'Processing', amount: '$1,500', date: '2024-01-15' },
  { id: 2, customer: 'Tech Ltd', status: 'Shipped', amount: '$2,300', date: '2024-01-14' },
];
```

### Local State (Stores)

- Use Jotai atoms for feature-specific state
- Files should be named `*.store.ts`
- Apart from existing global stores (e.g., `src/auth/AuthContext.tsx`) don't create new global stores
- Example: `orders.store.ts`

```typescript
// src/features/orders-listing/orders.store.ts
import { atom } from 'jotai';
import { OrderFilters } from './order.model';

export const orderFiltersAtom = atom<OrderFilters>({});
export const selectedOrderIdAtom = atom<string | null>(null);
```

### Utilities

- Feature-specific utility functions
- Files should be named `*.utils.ts`
- Example: `order.utils.ts`

```typescript
// src/features/orders-listing/order.utils.ts
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-green-100 text-green-800';
    case 'delivered': return 'bg-emerald-100 text-emerald-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```

### Index File

- Each feature should have an `index.ts` for clean exports
- Example: `index.ts`

```typescript
// src/features/orders-listing/index.ts
export { default as OrdersListing } from './OrdersListing';
export * from './order.model';
export * from './orders.queries';
```

## Complete Feature Slice Example

```
src/features/orders-listing/
├── index.ts                    # Public exports
├── OrdersListing.tsx           # Main page component
├── OrdersTable.tsx             # Table component
├── OrderFilters.tsx            # Filters component
├── OrderStatsCard.tsx          # Stats component
├── NewOrderDialog.tsx          # Create order modal
├── order.model.ts              # TypeScript types
├── orders.http.ts              # HTTP fetch functions
├── orders.queries.ts           # React Query hooks
├── orders.mocks.ts             # Mock data
├── orders.store.ts             # Jotai atoms
└── order.utils.ts              # Feature utilities
```

## Pages/Routing Integration

The files within the `src/pages/` directory should be as minimal as possible and basically route to the main page components inside feature slices.

```tsx
// src/pages/Orders.tsx
import { OrdersListing } from '@/features/orders-listing';

const OrdersPage = () => {
  return <OrdersListing />;
};

export default OrdersPage;
```

Routes are defined in `src/AppRoutes.tsx`. Protected routes use the `ProtectedRoute` component which checks `AuthContext`.

## Import Rules

1. **Within a feature slice:** Use relative imports
   ```typescript
   import { Order } from './order.model';
   import { useOrdersQuery } from './orders.queries';
   ```

2. **From shared code:** Use `@/` alias
   ```typescript
   import { Button } from '@/components/ui/button';
   import { cn } from '@/lib/tailwind/utils';
   import { useAuth } from '@/auth/AuthContext';
   ```

3. **Between feature slices:** Import through index files with `@/` alias (but minimize cross-slice dependencies)
   ```typescript
   import { Driver } from '@/features/drivers/driver.model';
   ```

## Refactoring to Vertical Slices

When migrating existing code to VSA:

1. **Identify the feature boundary** - What screens/functionality form a cohesive unit?

2. **Create the feature directory** in `src/features/`

3. **Move related files:**
   - Move page components from `src/pages/` subdirectories
   - Move models from `src/model/`
   - Move HTTP functions from `src/http/`
   - Move query hooks from `src/hooks/queries/`

4. **Update imports** throughout the codebase

5. **Clean up original locations:**
   - After moving items into verticals, verify whether the original function/type/etc. is used anywhere in the project
   - If not used elsewhere, **remove it** - we don't want leftovers after refactoring

6. **Update the page file** in `src/pages/` to be a thin wrapper that imports from the feature

## Testing

- Feature-specific tests should live within the feature directory
- E2E tests remain in `tests/` directory but can be organized by feature
- Component stories can be co-located: `OrdersTable.stories.tsx`

## What Should NOT Be in Features

Keep these in their current shared locations:

- **shadcn/ui components** (`src/components/ui/`) - Design system primitives
- **Layout components** (`src/components/layout/`) - App shell
- **Auth context** (`src/auth/`) - Application-wide authentication
- **HTTP config/utils** (`src/http/http.config.ts`, `src/http/mock-utils.ts`) - Shared infrastructure
- **Generic hooks** (`src/hooks/use-mobile.tsx`) - Not feature-specific
- **Tailwind utils** (`src/lib/tailwind/`) - Styling utilities
