import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { InputLabelGroup, Label } from ".";
import {
  ChoiceTypeField,
  FormField,
  NumberTypeField,
} from "../../types/api/checkin";
import { YJSBoundInput } from "./yjs";

export function FormFieldMapper({
  data,
  newKey,
  name,
}: {
  data: FormField;
  newKey?: string;
  name?: string;
}) {
  const { data: session } = useSession();
  // Return null for admin only data to non-admins
  if (data.value.adminOnly && !session) return null;
  if (data.type === "text" || data.type === "email") {
    return (
      <InputLabelGroup isPrivate={data.value.adminOnly}>
        {Label(data.value.id, data.value.label)}
        <YJSBoundInput
          name={name || data.value.id}
          id={newKey || data.value.id}
          type={data.type}
          initial=""
        />
      </InputLabelGroup>
    );
  } else if (data.type === "number") {
    let value = data.value as NumberTypeField;
    return (
      <InputLabelGroup isPrivate={value.adminOnly}>
        {Label(value.id, value.label)}
        <YJSBoundInput
          name={name || data.value.id}
          id={newKey || data.value.id}
          type={data.type}
          initial=""
          min={value.min}
        />
      </InputLabelGroup>
    );
  } else if (data.type === "choice") {
    let value = data.value as ChoiceTypeField;
    return (
      <InputLabelGroup isPrivate={value.adminOnly}>
        {Label(value.id, value.label)}
        <YJSBoundInput
          id={data.value.id}
          type={data.type}
          initial={value.choices.length > 0 ? value.choices[0] : ""}
          choices={value.choices}
        />
      </InputLabelGroup>
    );
  } else if (data.type === "date") {
    let value = data.value as ChoiceTypeField;
    return (
      <InputLabelGroup isPrivate={value.adminOnly}>
        {Label(value.id, value.label)}
        <YJSBoundInput
          id={data.value.id}
          type={data.type}
          initial={format(new Date(2014, 1, 11), "yyyy-MM-dd")}
        />
      </InputLabelGroup>
    );
  } else if (data.type === "memo") {
    let value = data.value;
    return (
      <InputLabelGroup isPrivate={value.adminOnly}>
        {Label(value.id, value.label)}
        <YJSBoundInput
          id={data.value.id}
          type="textarea"
          initial={""}
          extraClasses={["resize-y"]}
        />
      </InputLabelGroup>
    );
  } else {
    // Not implemented
    return null;
  }
}
