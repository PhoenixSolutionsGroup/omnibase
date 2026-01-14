import React from "react";
import { FlowRouter, protectedRoute } from "@omnibase/nextjs/auth";
import {
  // ErrorForm,
  // - TODO: uncomment and add - Need to release shadcn package first,
  LoginForm,
  RecoveryForm,
  RegistrationForm,
  SettingsForm,
  TenantCreator,
  VerificationForm,
} from "@omnibase/shadcn";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOmnibaseConfiguration } from "@/lib/server";
import { V1TenantsApi } from "@omnibase/core-js";

// TODO - Fix type definitions
export default function page({ params, searchParams }: any) {
  return (
    <div className="mt-[20vh]">
      <FlowRouter
        flowMap={{
          login: (flow) => {
            return (
              <LoginForm flow={flow as any} register_url="/auth/registration" />
            );
          },
          registration: (flow) => {
            return (
              <RegistrationForm flow={flow as any} login_url="/auth/login" />
            );
          },
          recovery: (flow) => {
            return <RecoveryForm flow={flow as any} />;
          },
          settings: (flow) => {
            return (
              <div className="-mt-[10vh]">
                <SettingsForm flow={flow as any} />
              </div>
            );
          },
          verification: (flow) => {
            return <VerificationForm flow={flow as any} />;
          },

          // error: (error) => {
          //   return <ErrorForm error={error as any} login_url="/auth/login" />;
          // },
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

                    const config = await getOmnibaseConfiguration();
                    const client = new V1TenantsApi(config);
                    const { data } = await client.createTenant({
                      createTenantRequest: {
                        name: organizationName,
                        billingEmail: billingEmail,
                      },
                      xUserId: session.identity?.id!,
                    });

                    if (!data) {
                      throw new Error("Failed to create tenant");
                    }
                    const c = await cookies();

                    c.set("omnibase_postgrest_jwt", data.token!);
                    redirect("/");
                  },
                  async joinOrganizationAction(formData) {
                    "use server";
                    const token = formData.get("token") as string | null;

                    if (!token) {
                      return;
                    }

                    const config = await getOmnibaseConfiguration();
                    const client = new V1TenantsApi(config);
                    const { data } = await client.acceptInvite({
                      acceptInviteRequest: {
                        token,
                      },
                    });

                    if (!data) {
                      throw new Error("Failed to accept invite");
                    }

                    const c = await cookies();
                    c.set("omnibase_postgrest_jwt", data.token!);
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
