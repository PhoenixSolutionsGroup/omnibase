package handlers

// ApplyConnectAccount sets the Connect account ID on Stripe params if configured.
// This works with any Stripe params type that implements SetStripeAccount.
func ApplyConnectAccount(accountID string, params interface{ SetStripeAccount(string) }) {
	if accountID != "" {
		params.SetStripeAccount(accountID)
	}
}
