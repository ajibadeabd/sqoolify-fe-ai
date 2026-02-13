import { useState, useEffect } from 'react';
import { configService } from './api-services';
import { useAuth } from './auth-context';
import type { AppConfig } from './types';

let cachedConfig: AppConfig | null = null;

export function useAppConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);

  const canReadConfig = (user?.permissions || []).includes('read_app_config');

  useEffect(() => {
    if (cachedConfig || !canReadConfig) {
      setLoading(false);
      return;
    }

    configService.get().then((res) => {
      cachedConfig = res.data;
      setConfig(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [canReadConfig]);

  const currency = config?.settings?.currency ?? 'NGN';
  const currencySymbol = getCurrencySymbol(currency);

  return {
    config,
    loading,
    termsPerSession: config?.settings?.termsPerSession ?? 3,
    classLevels: config?.settings?.classLevels ?? [],
    sectionPresets: config?.settings?.sectionPresets ?? [],
    examTypes: config?.settings?.examTypes ?? [],
    paymentCategories: config?.settings?.paymentCategories ?? [],
    paymentTypes: config?.settings?.paymentTypes ?? [],
    paymentMethods: config?.settings?.paymentMethods ?? [],
    studentStatuses: config?.settings?.studentStatuses ?? [],
    noticeVisibility: config?.settings?.noticeVisibility ?? [],
    noticeTypes: config?.settings?.noticeTypes ?? [],
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
