import { FlowRouter, getServerSession } from "@omnibase/nextjs/auth";
import {
  LoginForm,
  RecoveryForm,
  RegistrationForm,
  SettingsForm,
  VerificationForm,
} from "@omnibase/shadcn";
import TenantCreatorClient from "./tenant-creator";
import { Session } from "@omnibase/core-js/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { omnibase } from "@/app/lib/server";

export default async function AuthPage({ params, searchParams }: any) {
  return (
    <div className="mt-[20vh]">
      <FlowRouter
        params={params}
        searchParams={searchParams}
        url="/auth"
        flowMap={{
          login: (flow) => {
            console.log(JSON.stringify(flow, null, 4));
            return (
              <LoginForm
                flow={{
                  ...flow,
                }}
              />
            );
          },
          registration: (flow) => {
            flow.return_to = "/auth/onboarding";
            console.log(JSON.stringify(flow, null, 4));
            return <RegistrationForm flow={flow} />;
          },

          recovery: (flow) => {
            console.log(JSON.stringify(flow.ui, null, 4));
            return <RecoveryForm flow={flow} />;
          },
          settings: (flow) => {
            console.log(JSON.stringify(flow.ui, null, 4));
            return <SettingsForm flow={flow} />;
          },
          verification: (flow) => {
            console.log(JSON.stringify(flow.ui, null, 4));
            return <VerificationForm flow={flow} />;
          },
          onboarding: async () => {
            const session: Session | null = await getServerSession();
            if (!session) return null;
            return (
              <TenantCreatorClient
                config={{
                  createForm: {
                    billingEmail: {
                      defaultValue: session.identity?.traits.email,
                    },
                    organizationName: {
                      defaultValue:
                        session.identity?.traits.name.first +
                        " " +
                        session.identity?.traits.name.last,
                    },
                  },
                }}
                formActions={{
                  createOrganizationAction: async (formData: FormData) => {
                    "use server";

                    const organizationName = formData.get(
                      "organizationName"
                    ) as string | null;
                    const billingEmail = formData.get("billingEmail") as
                      | string
                      | null;

                    if (!organizationName || !billingEmail) {
                      return;
                    }

                    const tenant = await omnibase.tenants.manage.createTenant({
                      billing_email: billingEmail,
                      user_id: session.identity?.id!,
                      name: organizationName,
                    });

                    const c = await cookies();
                    c.set("omnibase_postgrest_jwt", tenant.data?.token!);
                    redirect("/");
                  },

                  joinOrganizationAction: async () => {
                    "use server";
                  },
                }}
              />
            );
          },
        }}
        onNotFound={<>Not Found</>}
      />
    </div>
  );
}
