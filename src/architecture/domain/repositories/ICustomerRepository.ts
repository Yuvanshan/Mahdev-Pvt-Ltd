/**
 * Customer Repository Interface - Domain Layer
 * Defines the contract for customer data access
 * Implementation is in the Data layer
 */

import { CustomerEntity } from '../entities/Customer';

export interface ICustomerRepository {
  /**
   * Create a new customer
   */
  create(customer: CustomerEntity): Promise<string>;

  /**
   * Get customer by ID
   */
  getById(id: string): Promise<CustomerEntity | null>;

  /**
   * Get all customers
   */
  getAll(): Promise<CustomerEntity[]>;

  /**
   * Update an existing customer
   */
  update(id: string, customer: Partial<CustomerEntity>): Promise<void>;

  /**
   * Delete a customer (hard delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Soft delete a customer
   */
  softDelete(id: string): Promise<void>;

  /**
   * Restore a soft-deleted customer
   */
  restore(id: string): Promise<void>;

  /**
   * Search customers by criteria
   */
  search(criteria: CustomerSearchCriteria): Promise<CustomerEntity[]>;

  /**
   * Find customers by status
   */
  findByStatus(status: string): Promise<CustomerEntity[]>;

  /**
   * Find customers by company
   */
  findByCompany(companyId: string): Promise<CustomerEntity[]>;
}

export interface CustomerSearchCriteria {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  tags?: string[];
  companyId?: string;
  limit?: number;
  offset?: number;
}

export interface CustomerRepositoryFactory {
  createRepository(): ICustomerRepository;
}
