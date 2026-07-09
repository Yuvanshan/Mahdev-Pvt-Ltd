# Clean Architecture Structure

This directory implements Clean Architecture principles for better scalability, maintainability, and testability.

## Directory Organization

### Presentation Layer (`/presentation`)
- **Pages**: Full-page components/screens (HomeView, AdminView, etc.)
- **Components**: Reusable UI components (Navbar, Hero, Cards, etc.)
- **Hooks**: React custom hooks for state management and side effects

**Responsibility**: Handles all UI rendering and user interactions. Should be independent of business logic.

### Domain Layer (`/domain`)
- **Entities**: Core business objects (Customer, Invoice, ServiceCard, etc.) - pure data classes
- **Use Cases**: Business logic functions (CreateInvoice, UpdateCustomer, etc.)
- **Repositories**: Abstract interfaces defining data contracts (ICustomerRepository, IInvoiceRepository)

**Responsibility**: Contains business logic and rules. Must be framework-agnostic.

### Data Layer (`/data`)
- **DataSources**: Concrete implementations for accessing data (Firebase, APIs, LocalStorage)
- **Repositories**: Implements domain repository interfaces, bridges data sources

**Responsibility**: Handles all data operations and external API communications.

### Core Layer (`/core`)
- **Services**: Utility services (AuthService, StorageService, NotificationService)
- **Utilities**: Helper functions and utilities (formatters, validators, etc.)
- **Constants**: Global constants and configuration values

**Responsibility**: Provides shared functionality across layers.

## Dependency Flow

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│  (UI Components & Pages)            │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│   Domain Layer                      │
│  (Business Logic & Entities)        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│   Data Layer                        │
│  (Data Sources & Repositories)      │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│   Core Layer                        │
│  (Services & Utilities)             │
└─────────────────────────────────────┘
```

**Important Rule**: Dependencies flow INWARD. Lower layers (Presentation) depend on higher layers (Domain), never vice versa.

## Migration Strategy

1. **Phase 1**: Create entity classes and domain interfaces
2. **Phase 2**: Implement use cases with business logic
3. **Phase 3**: Move existing components to presentation layer
4. **Phase 4**: Migrate data access to repositories
5. **Phase 5**: Integrate services in core layer

## Best Practices

- ✅ Keep entities small and focused
- ✅ Use dependency injection for loose coupling
- ✅ Write business logic independently of React
- ✅ Create interfaces for repositories before implementations
- ✅ Keep presentation layer "thin" - mostly UI logic
- ✅ Test domain logic independently

- ❌ Don't import presentation components in domain
- ❌ Don't put business logic in components
- ❌ Don't create circular dependencies
- ❌ Don't expose internal implementation details

## Example: Customer Module

```
Domain (Business Rules):
├── entities/Customer.ts (data class)
├── repositories/ICustomerRepository.ts (interface)
└── use-cases/CreateCustomerUseCase.ts (business logic)

Data (Implementation):
└── repositories/CustomerRepository.ts (implements ICustomerRepository)

Presentation (UI):
├── components/CustomerForm.tsx
├── pages/CustomersPage.tsx
└── hooks/useCustomers.ts

Core (Utilities):
└── services/CustomerService.ts
```

## Benefits

1. **Testability**: Business logic can be tested without UI frameworks
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new features without affecting existing code
4. **Reusability**: Business logic can be used by multiple UI implementations
5. **Flexibility**: Easy to switch data sources (Firebase to REST API, etc.)
