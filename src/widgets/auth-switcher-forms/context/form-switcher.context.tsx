import { createContext, PropsWithChildren, useContext, useState } from "react";

import { FormTypeModel } from "../model/form-type.model";
import { type FormType } from "../types";

interface FormSwitcherContextValue {
  activeForm: FormType;
  onFormSwitch: (form: FormType) => void;
}

const FormSwitcherContext = createContext<FormSwitcherContextValue | null>(
  null,
);

export const FormSwitcherProvider = ({ children }: PropsWithChildren) => {
  const [activeForm, setActiveForm] = useState<FormType>(
    FormTypeModel.AUTHORIZATION,
  );

  const onFormSwitch = (form: FormType) => {
    setActiveForm(form);
  };

  return (
    <FormSwitcherContext.Provider value={{ activeForm, onFormSwitch }}>
      {children}
    </FormSwitcherContext.Provider>
  );
};

export const useFormSwitcher = (): FormSwitcherContextValue => {
  const context = useContext(FormSwitcherContext);

  if (!context) {
    throw new Error(
      "useFormSwitcher must be used within a FormSwitcherProvider",
    );
  }

  return context;
};
