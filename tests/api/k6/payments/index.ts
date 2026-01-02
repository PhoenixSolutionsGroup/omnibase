import { subscriptionLifecycle } from "./01-subscription-lifecycle";
import { invoiceLifecycle } from "./02-invoice-lifecycle";
import {
  webhookConfigLifecycle,
  webhookValidationErrors,
} from "./03-webhook-config";

export async function PaymentTests() {
  await subscriptionLifecycle();
  await invoiceLifecycle();
  webhookConfigLifecycle();
  webhookValidationErrors();
}
