import { useFormSwitcher } from "../../context";
import { FormTypeModel } from "../../model/form-type.model";
import { FormSwitcherButton } from "./FormSwitcherButton";

export function FormSwitcher() {
  const { onFormSwitch, activeForm } = useFormSwitcher();

  return (
    <div className="flex rounded-lg border bg-card overflow-hidden p-0.5">
      <FormSwitcherButton
        onClick={() => onFormSwitch(FormTypeModel.AUTHORIZATION)}
        isActive={activeForm === FormTypeModel.AUTHORIZATION}
      >
        Вход
      </FormSwitcherButton>
      <FormSwitcherButton
        onClick={() => onFormSwitch(FormTypeModel.REGISTRATION)}
        isActive={activeForm === FormTypeModel.REGISTRATION}
      >
        Регистрация
      </FormSwitcherButton>
    </div>
  );
}
