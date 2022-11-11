import { useRouter } from "next/router";
import React, { useState } from "react";
import MyDialog from "../components/Dialog";
import { InputField, InputLabelGroup, Label } from "../components/Form";

export default function Home() {
  const [checkRoomDialog, setCheckRoomDialog] = useState(false);
  return (
    <div className="px-4 my-8 md:my-12 max-w-lg mx-auto">
      <h1 className="text-3xl lg:text-4xl pl-2 text-gray-800 rounded inline-block px-8">
        Welcome to <span className="text-blue-600">Himali Lodge, Dhampus</span>
      </h1>
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setCheckRoomDialog(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          CheckIn
        </button>
      </div>
      <PromptVirutalRoom
        isOpen={checkRoomDialog}
        setIsOpen={setCheckRoomDialog}
      />
    </div>
  );
}

export function PromptVirutalRoom({ isOpen, setIsOpen }) {
  function closeModal() {
    setIsOpen(false);
  }
  const [code, setCode] = useState("");
  const router = useRouter();
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code !== "") {
      router.push(`/checkin/${code}`);
    }
  }

  return (
    <MyDialog isOpen={isOpen} closeModal={closeModal} titleString="Code">
      <div className="mt-2">
        <form action="" onSubmit={handleSubmit}>
          <InputLabelGroup>
            {Label("code", "Please enter your Check-In code.")}
            {InputField("code", "text", code, (e) => {
              setCode(e.target.value);
            })}
          </InputLabelGroup>
          <div className="flex gap-x-4">
            <button
              type="submit"
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Star Check-In
            </button>
            <button
              type="submit"
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              onClick={closeModal}
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </MyDialog>
  );
}
