import { useState } from 'react';
import { useAuthStore } from '../../../entities/user/model/store';

export const useCheckout = () => {
  const [isPending, setIsPending] = useState(false);
  const { accessToken } = useAuthStore();

  const checkout = async () => {
    setIsPending(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/billing/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Checkout failed');
      }
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return { checkout, isPending };
};
