"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginForm from "./login-form";

export default function CardDemo() {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 h-full">
      <div className="col-span-3 bg-primary flex justify-center items-center">
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
      <div className="flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
