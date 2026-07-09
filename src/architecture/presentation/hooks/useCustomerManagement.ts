/**
 * useCustomerManagement Hook - Presentation Layer
 * React hook for managing customer operations in the UI
 * Uses the domain use cases and repositories
 */

import { useState, useCallback, useEffect } from 'react';
import { CustomerEntity } from '../../domain/entities/Customer';
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository';
import { CreateCustomerUseCase, CreateCustomerRequest, CreateCustomerResponse } from '../../domain/use-cases/CreateCustomerUseCase';

interface UseCustomerManagementReturn {
  customers: CustomerEntity[];
  loading: boolean;
  error: string | null;
  createCustomer: (request: CreateCustomerRequest) => Promise<CreateCustomerResponse>;
  updateCustomer: (id: string, data: Partial<CustomerEntity>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  softDeleteCustomer: (id: string) => Promise<void>;
  restoreCustomer: (id: string) => Promise<void>;
  searchCustomers: (criteria: any) => Promise<CustomerEntity[]>;
  refreshCustomers: () => Promise<void>;
}

/**
 * Hook for managing customer operations
 * @param repository ICustomerRepository instance
 * @returns Object with all customer management functions and state
 */
export const useCustomerManagement = (repository: ICustomerRepository): UseCustomerManagementReturn => {
  const [customers, setCustomers] = useState<CustomerEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize - load all customers
  useEffect(() => {
    refreshCustomers();
  }, []);

  const refreshCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allCustomers = await repository.getAll();
      setCustomers(allCustomers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load customers';
      setError(message);
      console.error('Error loading customers:', message);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createCustomer = useCallback(async (request: CreateCustomerRequest): Promise<CreateCustomerResponse> => {
    setError(null);
    try {
      const useCase = new CreateCustomerUseCase(repository);
      const response = await useCase.execute(request);

      if (response.success) {
        // Refresh customer list
        await refreshCustomers();
      } else {
        setError(response.error || 'Failed to create customer');
      }

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      setError(message);
      return { success: false, error: message };
    }
  }, [repository, refreshCustomers]);

  const updateCustomer = useCallback(async (id: string, data: Partial<CustomerEntity>): Promise<void> => {
    setError(null);
    try {
      await repository.update(id, data);
      await refreshCustomers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update customer';
      setError(message);
      throw err;
    }
  }, [repository, refreshCustomers]);

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await repository.delete(id);
      await refreshCustomers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(message);
      throw err;
    }
  }, [repository, refreshCustomers]);

  const softDeleteCustomer = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await repository.softDelete(id);
      await refreshCustomers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to soft delete customer';
      setError(message);
      throw err;
    }
  }, [repository, refreshCustomers]);

  const restoreCustomer = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await repository.restore(id);
      await refreshCustomers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore customer';
      setError(message);
      throw err;
    }
  }, [repository, refreshCustomers]);

  const searchCustomers = useCallback(async (criteria: any) => {
    setError(null);
    try {
      return await repository.search(criteria);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search customers';
      setError(message);
      throw err;
    }
  }, [repository]);

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    softDeleteCustomer,
    restoreCustomer,
    searchCustomers,
    refreshCustomers
  };
};

/**
 * Example usage in a component:
 * 
 * const MyComponent = () => {
 *   const customerMgmt = useCustomerManagement(getCustomerRepository());
 *   
 *   const handleCreateCustomer = async () => {
 *     const result = await customerMgmt.createCustomer({
 *       name: 'John Doe',
 *       email: 'john@example.com',
 *       phone: '+1234567890'
 *     });
 *     
 *     if (result.success) {
 *       console.log('Customer created:', result.customerId);
 *     } else {
 *       console.error('Error:', result.error);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {customerMgmt.loading && <p>Loading...</p>}
 *       {customerMgmt.error && <p>Error: {customerMgmt.error}</p>}
 *       <button onClick={handleCreateCustomer}>Create Customer</button>
 *     </div>
 *   );
 * };
 */
