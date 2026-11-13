type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

interface FormatPriceOptions {
    currency?: CurrencyCode;
    locale?: string;
}

export default function formatPrice(
    amount: number,
    { currency = 'USD', locale = 'en-US' }: FormatPriceOptions = {}
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount / 100);
}