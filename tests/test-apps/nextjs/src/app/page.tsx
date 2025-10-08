import { Button } from "@/components/ui/button";
import { Session } from "@omnibase/core-js/auth";
import { getLogoutFlow, getServerSession } from "@omnibase/nextjs/auth";
import Link from "next/link";

export default async function Home() {
  const session: Session | null = await getServerSession();

  const renderSessionUI = async () => {
    const flow = await getLogoutFlow({ returnTo: "/" });
    if (!flow) return null;

    return (
      <div className="flex items-center gap-4">
        <Link
          href={"/auth/settings"}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Settings
        </Link>
        <form action={flow.action}>
          <Button variant="outline" size="sm">
            Logout
          </Button>
        </form>
      </div>
    );
  };

  const renderLogin = async () => {
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

  const testPages = [
    {
      title: "Payments",
      description:
        "Test Stripe integration, pricing tables, checkout sessions, and customer portal",
      icon: "💳",
    },
    {
      title: "Storage",
      description:
        "Test file upload, download, delete, and RLS via tenant switching",
      icon: "📁",
    },
    {
      title: "Tenants",
      description:
        "Test tenant creation, switching, deletion, and invite management",
      icon: "🏢",
    },
    {
      title: "Permissions",
      description:
        "Test permission checking, relationship tuples, and access control",
      icon: "🔐",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with auth actions */}
      <header className="w-full border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Omnibase Test Dashboard
          </h1>
          <div>{session ? await renderSessionUI() : await renderLogin()}</div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              SDK Testing Hub
            </h2>
            <p className="text-gray-600">
              Test all Omnibase SDK functionality with client-side or
              server-side implementations
            </p>
          </div>

          {/* Client-Side Tests Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">⚛️</span>
              <h3 className="text-2xl font-bold text-gray-900">
                Client-Side Tests
              </h3>
              <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
                Client Components
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testPages.map((page) => (
                <Link
                  key={`client-${page.title}`}
                  href={`/client/${page.title.toLowerCase()}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{page.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {page.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {page.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Server-Side Tests Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🖥️</span>
              <h3 className="text-2xl font-bold text-gray-900">
                Server-Side Tests
              </h3>
              <span className="px-3 py-1 text-xs font-semibold text-green-600 bg-green-50 rounded-full">
                Server Components
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testPages.map((page) => (
                <Link
                  key={`server-${page.title}`}
                  href={`/server/${page.title.toLowerCase()}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{page.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {page.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {page.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
