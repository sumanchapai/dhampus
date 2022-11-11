import classNames from "classnames";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { InputChoose } from ".";
import { GlobalContext } from "../../pages/_app";

type InitialValueType = number | string | Array<string>;

interface YJSBoundInputType {
  id: string;
  type: string;
  initial: InitialValueType;
  min?: number;
  name?: string;
  choices?: string[];
  extraClasses?: string[];
}
export function YJSBoundInput(
  { id, name, type, initial, min, choices }: YJSBoundInputType,
  extraClasses
) {
  const { value, updateValue } = useYJSBoundData(initial, id);
  if (type === "number") {
    return (
      <input
        name={name || id}
        className="w-full text-gray-700 px-4 py-2 border-gray-200 border-2 focus:outline-blue-500"
        id={id}
        type={type}
        value={value}
        onChange={(e) => updateValue(e.target.value)}
        min={Number(min).toString()}
      />
    );
  }
  if (type === "choice") {
    return (
      <InputChoose
        choices={choices}
        selected={value}
        setSelected={(newValue) => updateValue(newValue)}
      />
    );
  }

  if (type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => updateValue(e.target.value)}
        className={classNames(
          "w-full text-gray-700 px-4 py-2 border-gray-200 border-2 focus:outline-blue-500",
          extraClasses
        )}
      />
    );
  }

  return (
    <input
      name={name || id}
      className={classNames(
        "w-full text-gray-700 px-4 py-2 border-gray-200 border-2 focus:outline-blue-500",
        extraClasses
      )}
      id={id}
      type={type}
      value={value}
      onChange={(e) => updateValue(e.target.value)}
    />
  );
}

export function useYJSBoundData(initial: InitialValueType, id: string) {
  const [value, setValue] = useState(initial);
  const [myMap, setMyMap] = useState(null);
  const [myMapKey, setMyMapKey] = useState(null);
  const router = useRouter();
  const { doc } = useContext(GlobalContext);

  // To setup myMapKey correctly
  useEffect(() => {
    if (router.isReady) {
      setMyMapKey(router.asPath);
    }
  }, [router]);

  useEffect(() => {
    if (myMapKey) {
      setMyMap(doc.getMap(myMapKey));
    }
  }, [doc, myMapKey]);

  // Load initial value
  useEffect(() => {
    if (myMap) {
      const value = myMap.get(id) as InitialValueType;
      if (value) {
        setValue(value);
      }
    }
  }, [myMap, id]);

  useEffect(() => {
    function observer(event) {
      const changedEntries = Array.from(event.keysChanged);
      if (changedEntries.includes(id)) {
        setValue(myMap.get(id) as InitialValueType);
      }
    }
    if (myMap) {
      myMap.observe(observer);
    }
    return () => {
      if (myMap) {
        myMap.unobserve(observer);
      }
    };
  }, [id, myMap]);

  function updateValue(newValue: InitialValueType) {
    if (myMap) {
      myMap.set(id, newValue);
    } else {
      // Can't update update myMap isn't set
    }
  }
  return {
    value,
    updateValue,
  };
}
