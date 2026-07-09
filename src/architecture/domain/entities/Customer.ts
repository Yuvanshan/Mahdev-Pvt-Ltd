/**
 * Customer Entity - Domain Layer
 * Represents a customer in the business domain
 * Contains only data properties, no business logic
 */

export interface CustomerEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyId?: string;
  companyName?: string;
  status: 'New Lead' | 'Active' | 'Inactive' | 'Blacklisted' | 'Lead';
  customerType?: 'Individual' | 'Company';
  tags?: string[];
  notes?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: boolean;
}

/**
 * Factory function to create a new customer entity
 */
export const createCustomerEntity = (data: Partial<CustomerEntity>): CustomerEntity => {
  return {
    id: data.id || '',
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    status: data.status || 'New Lead',
    companyId: data.companyId,
    companyName: data.companyName,
    customerType: data.customerType,
    tags: data.tags || [],
    notes: data.notes || '',
    address: data.address,
    city: data.city,
    country: data.country,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    deleted: data.deleted || false
  };
};

/**
 * Value object for customer status validation
 */
export class CustomerStatus {
  private readonly value: string;

  constructor(value: string) {
    const validStatuses = ['New Lead', 'Active', 'Inactive', 'Blacklisted', 'Lead'];
    if (!validStatuses.includes(value)) {
      throw new Error(`Invalid customer status: ${value}`);
    }
    this.value = value;
  }

  static create(value: string): CustomerStatus {
    return new CustomerStatus(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CustomerStatus): boolean {
    return this.value === other.value;
  }
}
