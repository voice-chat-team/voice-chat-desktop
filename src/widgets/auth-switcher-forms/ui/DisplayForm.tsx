import { useFormSwitcher } from "../context";
import { FormTypeModel } from "../model/form-type.model";
import { AuthorizationForm, RegistrationForm } from "@/features";

export const DisplayForm = () => {
  const { activeForm } = useFormSwitcher();

  if (activeForm === FormTypeModel.REGISTRATION) {
    return <RegistrationForm />;
  }

  return <AuthorizationForm />;
};
