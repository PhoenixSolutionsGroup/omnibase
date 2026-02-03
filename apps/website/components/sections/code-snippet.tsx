import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/code-block";

const codeExamples = {
  tenant: {
    language: "typescript",
    code: `import { Configuration, V1AuthApi, V1TenantsApi } from '@omnibase/core-js';

const config = new Configuration({
  basePath: 'https://api.omnibase.tech',
  headers: { 'X-Service-Key': process.env.OMNIBASE_SERVICE_KEY },
});

// Create a tenant (organization)
const tenantsApi = new V1TenantsApi(config);
const { data } = await tenantsApi.createTenant({
  createTenantRequest: {
    name: 'Acme Corporation',
    billingEmail: 'billing@acme.com',
  },
});

console.log('Tenant:', data.data.tenant.id);
console.log('Stripe Customer:', data.data.tenant.stripe_customer_id);`,
  },
  permission: {
    language: "typescript",
    code: `import { Configuration, V1PermissionsApi } from '@omnibase/core-js';

const permissionsApi = new V1PermissionsApi(config);

// Check if user can write to a project
const { data } = await permissionsApi.checkPermission({
  checkPermissionRequest: {
    namespace: 'Project',
    object: projectId,
    relation: 'write',
    subjectId: userId,
    subjectNamespace: 'User',
  },
});

if (data.data.allowed) {
  // User can write to this project
}`,
  },
  stripe: {
    language: "json",
    code: `{
  "$schema": "https://dashboard.omnibase.tech/api/stripe-config.schema.json",
  "version": "1.0.0",
  "products": [
    {
      "id": "pro_plan",
      "name": "Professional",
      "description": "For growing teams",
      "type": "service",
      "prices": [
        {
          "id": "pro_monthly",
          "amount": 1999,
          "currency": "usd",
          "interval": "month"
        }
      ]
    }
  ]
}`,
  },
};

export function CodeSnippetSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Developer-friendly by design
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Clean APIs that just work. Get productive in minutes, not weeks.
          </p>
        </div>

        <div className="mt-12 mx-auto max-w-3xl">
          <Tabs defaultValue="tenant" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tenant">Multi-Tenancy</TabsTrigger>
              <TabsTrigger value="permission">Permissions</TabsTrigger>
              <TabsTrigger value="stripe">Stripe Config</TabsTrigger>
            </TabsList>
            {Object.entries(codeExamples).map(([key, { language, code }]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <CodeBlock code={code} language={language} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
