import { Customer } from '../../../types';

export interface CustomerEntity extends Customer {
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: boolean;
}

export const createCustomerEntity = (data: Partial<CustomerEntity>): CustomerEntity => {
  return {
    id: data.id || '',
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    status: (data.status as any) || 'New Lead',
    companyId: data.companyId,
    companyName: data.companyName,
    customerType: data.customerType,
    tags: data.tags || [],
    notes: data.notes || '',
    address: data.address || '',
    city: data.city || '',
    country: data.country || '',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    deleted: data.deleted || false,
    history: data.history || [],
    documents: data.documents || []
  };
};

export class CustomerStatus {
  private readonly value: string;

  constructor(value: string) {
    const validStatuses = ['New Lead', 'Active', 'Inactive', 'Blacklisted', 'Lead', 'Active Customer', 'Returning Customer', 'VIP Customer', 'Corporate Customer', 'Government Customer', 'Inactive Customer'];
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
