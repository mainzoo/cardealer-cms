"use server";

import { prisma } from "@/lib/prisma";
import { SubscribeSchema } from "@/app/schemas/subscribe.schema";
import { CustomerStatus } from "@prisma/client";

export interface SubscribeActionState {
  success: boolean;
  message: string;
}

export async function subscribeAction(
  prevState: SubscribeActionState,
  formData: FormData
): Promise<SubscribeActionState> {
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
  };

  const parsed = SubscribeSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input data";
    return { success: false, message: firstError };
  }

  const { firstName, lastName, email } = parsed.data;

  try {
    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing) {
      await prisma.customer.update({
        where: { email },
        data: {
          firstname: firstName,
          lastname: lastName,
          // Se omite 'status' para no sobrescribir un estado más avanzado (ej. PURCHASED)
        },
      });
    } else {
      await prisma.customer.create({
        data: {
          firstname: firstName,
          lastname: lastName,
          email,
          status: CustomerStatus.INTERESTED,
          termsAccepted: true,
        },
      });
    }

    return {
      success: true,
      message: "Successfully subscribed to our newsletter!",
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
