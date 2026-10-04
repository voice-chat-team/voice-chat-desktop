import { useFormSwitcher } from "../context";
import { FormTypeModel } from "../model/form-type.model";
import { AuthorizationForm, RegistrationForm } from "@/features";

export const DisplayForm = () => {
  const { activeForm, onFormSwitch, prefilledEmail, setPrefilledEmail } =
    useFormSwitcher();

  if (activeForm === FormTypeModel.REGISTRATION) {
    return (
      <RegistrationForm
        onSuccess={(email) => {
          setPrefilledEmail(email);
          onFormSwitch(FormTypeModel.AUTHORIZATION);
        }}
      />
    );
  }

  return <AuthorizationForm defaultEmail={prefilledEmail} />;
};
