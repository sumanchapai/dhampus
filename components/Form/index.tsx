import { useState } from "react";

export function Label(id: string, title: string) {
  return (
    <label htmlFor={id} className="block text-sm text-gray-600">
      {title}
    </label>
  );
}

export function InputLabelGroup({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>;
}

export function InputField(
  name: string,
  type: string,
  value: string | number,
  updateFields,
  validation?: (x: string | number) => boolean,
  errMsg?: string
) {
  const [focused, setFocused] = useState(false);
  const [err, setErr] = useState("");
  function checkValidation() {
    if (validation && !validation(value)) {
      setErr(errMsg);
    } else {
      setErr("");
    }
  }
  return (
    <div className="max-w-sm">
      <input
        onFocus={() => setFocused(true)}
        onBlur={checkValidation}
        autoComplete="off"
        id={name}
        name={name}
        type={type}
        value={value || ""}
        className="w-full text-gray-700 px-4 py-2 border-gray-200 border-2 focus:outline-blue-500"
        onChange={updateFields}
      />
      {err ? <p className="text-red-600 text-sm">{err}</p> : null}
    </div>
  );
}
