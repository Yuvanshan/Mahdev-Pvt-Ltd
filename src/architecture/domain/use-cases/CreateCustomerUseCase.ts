/**
 * Create Customer Use Case - Domain Layer
 * Encapsulates the business logic for creating a new customer
 * Independent of UI framework and data source
 */

import { CustomerEntity, createCustomerEntity } from '../entities/Customer';
import { ICustomerRepository } from '../repositories/ICustomerRepository';

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  companyId?: string;
  customerType?: 'Individual' | 'Company';
  tags?: string[];
  notes?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  customerId?: string;
  error?: string;
}

/**
 * Use case for creating a customer
 * Contains all business logic related to customer creation
 */
export class CreateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(request: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    try {
      // Validate input
      this.validateRequest(request);

      // Check for duplicates
      const existingCustomer = await this.findDuplicateCustomer(request.email, request.phone);
      if (existingCustomer) {
        return {
          success: false,
          error: 'Customer with this email or phone already exists'
        };
      }

      // Create entity
      const customer = createCustomerEntity({
        name: request.name,
        email: request.email.toLowerCase(),
        phone: request.phone,
        status: 'New Lead',
        companyId: request.companyId,
        customerType: request.customerType || 'Individual',
        tags: request.tags || [],
        notes: request.notes,
        address: request.address,
        city: request.city,
        country: request.country
      });

      // Persist to repository
      const customerId = await this.customerRepository.create(customer);

      return {
        success: true,
        customerId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateRequest(request: CreateCustomerRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Customer name is required');
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      throw new Error('Valid email address is required');
    }

    if (!request.phone || request.phone.trim().length === 0) {
      throw new Error('Phone number is required');
    }

    if (request.name.length > 100) {
      throw new Error('Customer name must not exceed 100 characters');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async findDuplicateCustomer(email: string, phone: string): Promise<CustomerEntity | null> {
    const customers = await this.customerRepository.getAll();
    return customers.find(
      c => c.email.toLowerCase() === email.toLowerCase() || c.phone === phone
    ) || null;
  }
}

/**
 * Factory function to create the use case with dependency injection
 */
export const createCustomerUseCaseFactory = (repository: ICustomerRepository) => {
  return new CreateCustomerUseCase(repository);
};
