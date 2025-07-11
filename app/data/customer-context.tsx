import React, { createContext, useContext, useEffect, useState } from 'react';
import { HttpTypes } from '@medusajs/types';
import apiClient from '@api/client';
import { useCart } from './cart-context';

type CustomerContextType = {
  customer?: HttpTypes.StoreCustomer;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  refreshCustomer: () => Promise<void>;
  updateCustomer: (customer: HttpTypes.StoreUpdateCustomer) => Promise<void>;
};

const CustomerContext = createContext<CustomerContextType | null>(null);

type CustomerProviderProps = {
  children: React.ReactNode;
};

export const CustomerProvider = ({ children }: CustomerProviderProps) => {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>();
  const { linkCartToCustomer, resetCart } = useCart();

  useEffect(() => {
    // Check for existing session on mount
    refreshCustomer();
  }, []);

  const refreshCustomer = async () => {
    try {
      const { customer: existingCustomer } =
        await apiClient.store.customer.retrieve();
      setCustomer(existingCustomer);
    } catch (error) {
      // Customer isn't logged in
      setCustomer(undefined);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Authenticate using the auth endpoint
      const response = await apiClient.auth.login('customer', 'emailpass', {
        email,
        password,
      });

      // Check if the response is a string
      if (typeof response === 'string') {
        await Promise.all([refreshCustomer(), linkCartToCustomer()]);
      } else {
        // Handle third party auth
        console.log('Third party auth', response);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
      await resetCart();
      setCustomer(undefined);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    try {
      const token = await apiClient.auth.register('customer', 'emailpass', {
        email,
        password,
      });

      await apiClient.client.setToken(token);

      await apiClient.store.customer.create({
        first_name: firstName,
        last_name: lastName,
        email,
      });
      // There's some bug with the token received from the register endpoint
      // so we need to login again
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const updateCustomer = async (data: HttpTypes.StoreUpdateCustomer) => {
    try {
      const response = await apiClient.store.customer.update(data);
      setCustomer(response.customer);
    } catch (error) {
      throw error;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        login,
        logout,
        register,
        refreshCustomer,
        updateCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }

  return context;
};
