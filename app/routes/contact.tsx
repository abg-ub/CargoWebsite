import { type ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { getValidatedFormData } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { toast } from "react-toastify";
import ContactForm, { contactSchema } from "~/components/form/contact-form";
import { saveContact } from "~/api/actions.server";

type ActionData = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string>;
  action?: "create";
  validatedData?: any;
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const validatedForm = await getValidatedFormData(
      request,
      zodResolver(contactSchema)
    );

    if (validatedForm.errors) {
      return json(
        {
          success: false,
          errors: validatedForm.errors,
          defaultValues: validatedForm.receivedValues,
        },
        { status: 400 }
      );
    }

    // Use the saveContact action
    const result = await saveContact(validatedForm.data);

    if (!result.success) {
      return json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return json({
      success: true,
      action: "create",
      data: result.data,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
};

export default function Contact() {
  const actionData = useActionData<ActionData>();

  // Handle form submission results with toasts
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        toast.error(actionData.error);
      } else if (actionData.errors) {
        toast.error("Please check the form for errors");
      } else if (actionData.success) {
        toast.success("Message sent successfully!");
      }
    }
  }, [actionData]);

  return (
    <main className="pt-14">
      <div className="bg-white px-6 py-32 sm:py-48 lg:py-56 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Contact Our Shipping Support Center
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Have questions about our shipping services? Our dedicated team is
            here to assist you with all your logistics needs. Whether
            you&apos;re sending packages locally or internationally, we&apos;re
            committed to providing reliable and timely solutions.
          </p>
        </div>
      </div>
      <ContactForm />
    </main>
  );
}
