import CustomLoginForm from "@/app/home/login-form";
import { FlowRouter } from "@omnibase/nextjs/auth";
import {
  LoginForm,
  RegistrationForm,
  RecoveryForm,
  VerificationForm,
  SettingsForm,
  ErrorForm,
} from "@omnibase/shadcn";
import { Calendar } from "lucide-react";

export default function AuthPage({ params, searchParams }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 h-full">
      <div className="col-span-3 bg-primary flex justify-center items-center">
        <div className="fixed top-0 left-0 z-50 p-6">
          <span className="flex items-center gap-2 text-white font-semibold text-lg">
            <Calendar className="w-4 h-4" />
            Shiftly
          </span>
        </div>
        <div className="text-primary-foreground w-1/3 flex flex-col gap-4 relative">
          <p className="text-9xl absolute -top-9 -left-5 text-primary-foreground/20">
            "
          </p>
          <p className="font-bold text-2xl">
            Instead of spending a month on scheduling and planing, I get shift
            planing done in minutes. My employes are happy and I have time to
            focus on what I love in the business.
          </p>
          <div className="flex items-start gap-2">
            <img
              src="/assets/avatar.jpg"
              alt="avatar"
              className="rounded-full w-10 h-10 object-cover"
            />
            <div className="flex flex-col">
              <span>Sarah Willmer</span>
              <span className="text-xs">Moretime CEO</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-col">
        <CustomLoginForm />
        <div className="">
          <FlowRouter
            params={params}
            searchParams={searchParams}
            url="/auth"
            returnTo="/"
            flowMap={{
              login: (flow) => (
                <LoginForm flow={flow} register_url="/auth/registration" />
              ),
              registration: (flow) => (
                <RegistrationForm flow={flow} login_url="/auth/login" />
              ),
              recovery: (flow) => <RecoveryForm flow={flow} />,
              verification: (flow) => <VerificationForm flow={flow} />,
              settings: (flow) => <SettingsForm flow={flow} />,
              error: (error) => (
                <ErrorForm error={error} login_url="/auth/login" />
              ),
            }}
            onNotFound={<div>Page not found</div>}
          />
        </div>
      </div>
    </div>
  );
}
