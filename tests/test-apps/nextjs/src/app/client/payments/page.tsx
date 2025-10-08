"use client";
import Link from "next/link";
import PricingTableClient from "./pricing-table";
import { omnibase } from "../../lib/omnibase";
import { useSession } from "@omnibase/react";
import { useEffect, useState } from "react";
import type { ProductWithPricingUI } from "@omnibase/core-js/payments";

export default function PaymentsPage() {
  const { session, loading } = useSession();
  const [products, setProducts] = useState<ProductWithPricingUI[]>([]);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    // Fetch products on mount
    omnibase.payments.config
      .getAvailableProducts()
      .then((result) => {
        setProducts(result);
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoadingProducts(false);
      });
  }, []);

  useEffect(() => {
    // Fetch portal URL when session is available
    if (session && !loading) {
      setLoadingPortal(true);
      omnibase.payments.portal
        .create({
          return_url: "http://127.0.0.1:3000/",
        })
        .then((result) => {
          if (result.data?.url) {
            setPortalUrl(result.data.url);
          }
          setLoadingPortal(false);
        })
        .catch((err) => {
          console.error("Failed to create portal:", err);
          setLoadingPortal(false);
        });
    }
  }, [session, loading]);

  const renderLogin = () => {
    return (
      <div className="flex items-center gap-4">
        <Link
          href={"/auth/registration"}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign up
        </Link>
        <Link
          href={"/auth/login"}
          className="text-sm px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Login
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with auth actions */}
      <header className="w-full border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
          <div>{!session && renderLogin()}</div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💳 Payments Testing
            </h1>
            <p className="text-gray-600">
              Test Stripe integration, pricing tables, checkout sessions, and
              customer portal
            </p>
          </div>

          <div className="space-y-8">
            {/* Pricing Table Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pricing Table & Checkout
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Click on a price to test checkout session creation
              </p>
              {loadingProducts ? (
                <div className="text-center py-8 text-gray-600">
                  Loading products...
                </div>
              ) : (
                <PricingTableClient products={products} />
              )}
            </div>

            {/* Customer Portal Section */}
            {session && portalUrl && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Customer Portal
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Access the Stripe Customer Portal to manage subscriptions and
                  billing
                </p>
                {loadingPortal ? (
                  <div className="text-gray-600">Loading portal...</div>
                ) : (
                  <Link
                    href={portalUrl}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Open Customer Portal
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
