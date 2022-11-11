import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";

export function Label(id: string, title: string) {
  return (
    <label htmlFor={id} className="block text-sm text-gray-600">
      {title}
    </label>
  );
}

export function InputLabelGroup({
  isPrivate,
  children,
}: {
  isPrivate?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      {isPrivate ? (
        <div className="mb-2">
          <span className="text-white bg-red-400 px-2 py-1 text-xs rounded-sm">
            Hiden from guests
          </span>
        </div>
      ) : null}
      {children}
    </div>
  );
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

export function InputChoose({ choices, selected, setSelected }) {
  return (
    <Listbox value={selected} onChange={setSelected} name="document">
      <div className="w-full">
        <Listbox.Button className="flex justify-between w-full text-gray-700 px-4 py-2 border-gray-200 border-2 focus:outline-blue-500">
          <span className="block truncate">{selected}</span>
          <span className="">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="w-full mt-1 max-h-60 overflow-hidden rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {choices.map((choice, idx) => (
              <Listbox.Option
                key={idx}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? "bg-blue-100 text-gray-900" : "text-gray-900"
                  }`
                }
                value={choice}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {choice}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
