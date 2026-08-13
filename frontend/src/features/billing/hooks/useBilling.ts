import { useState } from 'react';

import { api } from '../../../shared/api/axios';

export const useCheckout = () => {
  const [isPending, setIsPending] = useState(false);

  const checkout = async () => {
    setIsPending(true);
    try {
      const response = await api.post('/billing/checkout');
      const data = response.data;
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

export const useKaspiCheckout = () => {
  const [isPending, setIsPending] = useState(false);

  const checkoutKaspi = async () => {
    setIsPending(true);
    try {
      const response = await api.post('/billing/checkout/kaspi');
      const data = response.data;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      alert('Failed to initiate Kaspi checkout. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return { checkoutKaspi, isPending };
};
