export interface FormFields {
  group: Array<FormField>;
  individual: Array<FormField>;
}

export interface FormField {
  type: "text" | "number" | "choice" | "date" | "email" | "memo";
  value: TextTypeField | NumberTypeField | ChoiceTypeField | DateField;
}

export interface TextTypeField {
  label: string;
  id: string;
  adminOnly: boolean;
}

export interface NumberTypeField {
  label: string;
  id: string;
  min?: number;
  adminOnly: boolean;
}

export interface ChoiceTypeField {
  label: string;
  id: string;
  adminOnly: boolean;
  choices: string[];
}

export interface DateField {
  label: string;
  id: string;
  adminOnly: boolean;
}
