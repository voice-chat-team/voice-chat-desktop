import AuthorizationForm from "@/features/authorization/ui/AuthorizationForm";
import { useFormSwitcher } from "../context";
import { FormTypeModel } from "../model/form-type.model";
import RegistrationForm from "@/features/registration/ui/RegistrationForm";

export const DisplayForm = () => {
  const { activeForm } = useFormSwitcher();

  if (activeForm === FormTypeModel.REGISTRATION) {
    return <RegistrationForm />;
  }

  return <AuthorizationForm />;
};
