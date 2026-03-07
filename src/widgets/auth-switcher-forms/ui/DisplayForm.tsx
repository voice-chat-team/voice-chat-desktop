import AuthorizationForm from "@/features/authorization/ui/AuthorizationForm";
import { useFormSwitcher } from "../context";
import { FormTypeModel } from "../model/form-type.model";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/shared/ui/skeleton";

const RegistrationFormLazy = lazy(
  () => import("@/features/registration/ui/RegistrationForm"),
);

export const DisplayForm = () => {
  const { activeForm } = useFormSwitcher();

  if (activeForm === FormTypeModel.REGISTRATION) {
    return (
      <Suspense fallback={<Skeleton className="h-102.5" />}>
        <RegistrationFormLazy />
      </Suspense>
    );
  }

  return <AuthorizationForm />;
};
