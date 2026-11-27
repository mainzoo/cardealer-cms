"use client";

import React, { useActionState, useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubscribeSchema, type SubscribeInput } from "@/app/schemas/subscribe.schema";
import { subscribeAction, type SubscribeActionState } from "@/app/actions/subscribe.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const initialState: SubscribeActionState = {
  success: false,
  message: "",
};

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeAction, initialState);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscribeInput>({
    resolver: zodResolver(SubscribeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (state.success) {
      reset();
    }
  }, [state.success, reset]);

  const onSubmit = (data: SubscribeInput) => {
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {state.message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium ${
            state.success
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Input
            placeholder="First name"
            {...register("firstName")}
            disabled={isPending}
            className="bg-background text-xs"
          />
          {errors.firstName && (
            <p className="text-[10px] text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Input
            placeholder="Last name"
            {...register("lastName")}
            disabled={isPending}
            className="bg-background text-xs"
          />
          {errors.lastName && (
            <p className="text-[10px] text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          disabled={isPending}
          className="bg-background text-xs"
        />
        {errors.email && (
          <p className="text-[10px] text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full text-xs font-semibold uppercase tracking-wider"
        size="sm"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Subscribing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  );
}