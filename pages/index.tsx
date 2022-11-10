"use client";
import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "./_app";

export default function Home() {
  return (
    <div className="my-16 max-w-lg mx-auto">
      <h1 className="text-2xl pl-2 bg-blue-800 text-white rounded inline-block px-8">
        Himali Lodge, Dhampus
      </h1>
      <p className="mt-8 text-sm">
        Your data is encrypted and safely stored in Himali Green servers.
      </p>
      <CheckIn />
    </div>
  );
}

function CheckIn() {
  const initialValues = {
    name: "",
    last: "",
    phone: "",
    email: "",
    comingFrom: "",
    goingTo: "",
  };
  const [fields, setFields] = useState(initialValues);
  const { doc } = useContext(GlobalContext);
  const fieldsMap = doc.getMap();
  const fieldKeys = Object.keys(initialValues);

  // Observe yMap
  fieldsMap.observe((event) => {
    const changedEntries = Array.from(event.keysChanged);
    changedEntries.forEach((entry) => {
      setFields((prev) => ({ ...prev, [entry]: fieldsMap.get(entry) }));
    });
  });

  function updateFields(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const updated = fieldKeys.find((x) => x === e.target.name);
    if (updated) {
      fieldsMap.set(updated, e.target.value);
    }
  }

  useEffect(() => {
    fieldKeys.forEach((entry) => {
      setFields((prev) => ({ ...prev, [entry]: fieldsMap.get(entry) }));
    });
  }, [fieldsMap]);

  function InputField(name, type, value) {
    return (
      <input
        name={name}
        type={type}
        value={value}
        className="lg:w-96 md:w-72 text-gray-700 px-4 py-2 border-gray-900 border-2 focus:outline-blue-500"
        onChange={updateFields}
      />
    );
  }

  return (
    <div className="mt-16 pl-2">
      <form action="" onSubmit={(e) => e.preventDefault()}>
        <div className="mt-4">
          {Label("name", "First Name")}
          {InputField("name", "text", fields.name)}
        </div>
        <div className="mt-4">
          {Label("last", "Last Name")}
          {InputField("last", "text", fields.last)}
        </div>
        <div className="mt-4">
          {Label("phone", "Phone")}
          {InputField("phone", "phone", fields.phone)}
        </div>
        <div className="mt-4">
          {Label("email", "Email")}
          {InputField("email", "email", fields.email)}
        </div>
        <div className="mt-4">
          {Label("comingFrom", "Where are you coming from today?")}
          {InputField("comingFrom", "text", fields.comingFrom)}
        </div>
        <div className="mt-4">
          {Label("goingTo", "Where are you plannning to go from here?")}
          {InputField("goingTo", "text", fields.goingTo)}
        </div>
      </form>
    </div>
  );
}

function Label(id: string, title: string) {
  return (
    <label htmlFor={id} className="block text-sm text-gray-500">
      {title}
    </label>
  );
}
