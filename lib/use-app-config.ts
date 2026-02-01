import { useState, useEffect } from 'react';
import { configService } from './api-services';
import type { AppConfig } from './types';

let cachedConfig: AppConfig | null = null;

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig) return;

    configService.get().then((res) => {
      cachedConfig = res.data;
      setConfig(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const currency = config?.settings?.currency ?? 'NGN';
  const currencySymbol = getCurrencySymbol(currency);

  return {
    config,
    loading,
    termsPerSession: config?.settings?.termsPerSession ?? 3,
    currency,
    currencySymbol,
    formatCurrency: (amount?: number) => {
      if (amount == null || isNaN(amount)) return formatCurrencyValue(0, currency);
      return formatCurrencyValue(amount, currency);
    },
  };
}

export function formatCurrencyValue(amount: number, currency = 'NGN') {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function getCurrencySymbol(currency: string): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency })
    .formatToParts(0)
    .find((p) => p.type === 'currency')?.value ?? currency;
}
