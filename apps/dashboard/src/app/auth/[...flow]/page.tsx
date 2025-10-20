import React from "react";
import { FlowRouter, protectedRoute } from "@omnibase/nextjs/auth";
import {
  LoginForm,
  RecoveryForm,
  RegistrationForm,
  SettingsForm,
  TenantCreator,
  VerificationForm,
} from "@omnibase/shadcn";
import { client } from "@/lib/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function page({ params, searchParams }: any) {
  return (
    <div className="mt-[20vh]">
      <FlowRouter
        flowMap={{
          login: (flow) => {
            return <LoginForm flow={flow} register_url="/auth/registration" />;
          },
          registration: (flow) => {
            return <RegistrationForm flow={flow} login_url="/auth/login" />;
          },
          recovery: (flow) => {
            return <RecoveryForm flow={flow} />;
          },
          settings: (flow) => {
            return <SettingsForm flow={flow} />;
          },
          verification: (flow) => {
            return <VerificationForm flow={flow} />;
          },
          onboarding: async () => {
            const session = await protectedRoute("/auth/login");
            const { token } = await searchParams;
            return (
              <TenantCreator
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

                    const tenant = await client.tenants.manage.createTenant({
                      billing_email: billingEmail,
                      user_id: session.identity?.id!,
                      name: organizationName,
                    });

                    const c = await cookies();
                    c.set("omnibase_postgrest_jwt", tenant.data?.token!);
                    redirect("/");
                  },
                }}
              />
            );
          },
        }}
        params={params}
        searchParams={searchParams}
        returnTo="/"
        url="/auth"
        onNotFound={<></>}
      />
    </div>
  );
}
