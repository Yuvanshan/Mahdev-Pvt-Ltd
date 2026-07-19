/**
 * Customer Repository Implementation - Data Layer
 * Implements the ICustomerRepository interface
 * Handles all communication with Firebase/data sources
 */

import { CustomerEntity } from '../../domain/entities/Customer';
import { ICustomerRepository, CustomerSearchCriteria } from '../../domain/repositories/ICustomerRepository';
import { getCustomers, saveCustomers } from '../../../utils/storage';

/**
 * Firebase/LocalStorage based implementation of customer repository
 */
export class CustomerRepository implements ICustomerRepository {
  async create(customer: CustomerEntity): Promise<string> {
    try {
      const customers = (await getCustomers()) as CustomerEntity[];
      const newId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newCustomer: CustomerEntity = {
        ...customer,
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      customers.push(newCustomer);
      await saveCustomers(customers);
      return newId;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    try {
      const customers = (await getCustomers()) as CustomerEntity[];
      return customers.find(c => c.id === id) || null;
    } catch (error) {
      throw new Error(`Failed to get customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAll(): Promise<CustomerEntity[]> {
    try {
      return (await getCustomers()) as CustomerEntity[];
    } catch (error) {
      throw new Error(`Failed to get customers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: string, customer: Partial<CustomerEntity>): Promise<void> {
    try {
      const customers = (await getCustomers()) as CustomerEntity[];
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error(`Customer with ID ${id} not found`);
      }
      customers[index] = {
        ...customers[index],
        ...customer,
        id: customers[index].id, // Ensure ID doesn't change
        updatedAt: new Date()
      };
      await saveCustomers(customers);
    } catch (error) {
      throw new Error(`Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      let customers = (await getCustomers()) as CustomerEntity[];
      customers = customers.filter(c => c.id !== id);
      await saveCustomers(customers);
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.update(id, { deleted: true });
    } catch (error) {
      throw new Error(`Failed to soft delete customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async restore(id: string): Promise<void> {
    try {
      await this.update(id, { deleted: false });
    } catch (error) {
      throw new Error(`Failed to restore customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(criteria: CustomerSearchCriteria): Promise<CustomerEntity[]> {
    try {
      let customers = (await getCustomers()) as CustomerEntity[];

      // Filter by active status (not deleted by default)
      customers = customers.filter(c => !c.deleted);

      // Apply filters
      if (criteria.name) {
        customers = customers.filter(c =>
          c.name.toLowerCase().includes(criteria.name!.toLowerCase())
        );
      }

      if (criteria.email) {
        customers = customers.filter(c =>
          c.email.toLowerCase().includes(criteria.email!.toLowerCase())
        );
      }

      if (criteria.phone) {
        customers = customers.filter(c =>
          c.phone.includes(criteria.phone!)
        );
      }

      if (criteria.status) {
        customers = customers.filter(c => c.status === criteria.status);
      }

      if (criteria.companyId) {
        customers = customers.filter(c => c.companyId === criteria.companyId);
      }

      if (criteria.tags && criteria.tags.length > 0) {
        customers = customers.filter(c =>
          c.tags?.some(tag => criteria.tags!.includes(tag))
        );
      }

      // Apply pagination
      const offset = criteria.offset || 0;
      const limit = criteria.limit || 50;
      return customers.slice(offset, offset + limit);
    } catch (error) {
      throw new Error(`Failed to search customers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByStatus(status: string): Promise<CustomerEntity[]> {
    try {
      const customers = (await getCustomers()) as CustomerEntity[];
      return customers.filter(c => c.status === status && !c.deleted);
    } catch (error) {
      throw new Error(`Failed to find customers by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCompany(companyId: string): Promise<CustomerEntity[]> {
    try {
      const customers = (await getCustomers()) as CustomerEntity[];
      return customers.filter(c => c.companyId === companyId && !c.deleted);
    } catch (error) {
      throw new Error(`Failed to find customers by company: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Singleton instance of customer repository
 */
let customerRepositoryInstance: CustomerRepository | null = null;

export const getCustomerRepository = (): CustomerRepository => {
  if (!customerRepositoryInstance) {
    customerRepositoryInstance = new CustomerRepository();
  }
  return customerRepositoryInstance;
};
