import { FlowRouter, protectedRoute } from "@omnibase/nextjs/auth";
import {
  LoginForm,
  RecoveryForm,
  RegistrationForm,
  SettingsForm,
  VerificationForm,
} from "@omnibase/shadcn";
import TenantCreatorClient from "./tenant-creator";
import {
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  Session,
  SettingsFlow,
  VerificationFlow,
} from "@omnibase/core-js/auth";
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
        returnTo="/"
        flowMap={{
          login: (flow: LoginFlow) => {
            return <LoginForm register_url="/auth/registration" flow={flow} />;
          },
          registration: (flow: RegistrationFlow) => {
            return <RegistrationForm login_url="/auth/login" flow={flow} />;
          },

          recovery: (flow: RecoveryFlow) => {
            return <RecoveryForm flow={flow} />;
          },
          settings: (flow: SettingsFlow) => {
            return <SettingsForm flow={flow} />;
          },
          verification: (flow: VerificationFlow) => {
            return <VerificationForm flow={flow} />;
          },
          onboarding: async () => {
            const session = await protectedRoute("/auth/login");
            const { token } = await searchParams;
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
                  joinForm: {
                    token: {
                      defaultValue: token,
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

                  joinOrganizationAction: async (formData: FormData) => {
                    "use server";
                    const token = formData.get("token") as string;
                    if (!token) return;
                    const response = await omnibase.tenants.invites.accept(
                      token
                    );

                    const c = await cookies();
                    c.set("omnibase_postgrest_jwt", response.data?.token!);
                    redirect("/");
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
