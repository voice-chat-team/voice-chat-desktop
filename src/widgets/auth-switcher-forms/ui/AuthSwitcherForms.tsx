import { SwitcherAppLogo } from "./AuthAppLogo";
import { FormSwitcher } from "./form-switcher/FormSwitcher";
import { FormSwitcherProvider } from "../context";
import { DisplayForm } from "./DisplayForm";

export function AuthSwitcherForms() {
  return (
    <div className="flex flex-col gap-4 max-w-md w-full">
      <SwitcherAppLogo />
      <FormSwitcherProvider>
        <FormSwitcher />
        <DisplayForm />
      </FormSwitcherProvider>
    </div>
  );
}
