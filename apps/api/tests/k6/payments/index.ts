import { subscriptionLifecycle } from "./01-subscription-lifecycle";
import { invoiceLifecycle } from "./02-invoice-lifecycle";
import {
  enterprisePricingGetPrices,
  enterprisePricingApplyTemplate,
  enterprisePricingApplyCustom,
  enterprisePricingValidation,
} from "./04-enterprise-pricing";

export async function PaymentTests() {
  await subscriptionLifecycle();
  await invoiceLifecycle();
}

export async function EnterprisePricingTests() {
  await enterprisePricingGetPrices();
  await enterprisePricingApplyTemplate();
  await enterprisePricingApplyCustom();
  await enterprisePricingValidation();
}
