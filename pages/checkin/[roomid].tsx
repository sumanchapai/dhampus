"use client";
import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import AwareNess from "../../components/Awareness";
import { InputLabelGroup, Label } from "../../components/Form";
import Link from "next/link";
import MyDialog from "../../components/Dialog";
import { useYJSBoundData, YJSBoundInput } from "../../components/Form/yjs";
import classNames from "classnames";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="px-4 my-8 md:my-12 max-w-lg mx-auto">
      <Link href="/">
        <h1 className="text-2xl pl-2 bg-blue-800 text-white rounded inline-block px-8">
          Himali Lodge, Dhampus
        </h1>
      </Link>
      <p className="mt-8 text-sm">
        Your data is encrypted and safely stored in Himali Green servers.
      </p>
      <AwareNess />
      <CheckIn />
      <div className="mt-16">
        <p className="text-sm text-gray-400">Made by dwellers of Annapurna</p>
        <div className="text-sm -mx-4 px-4 py-2 mb-4">
          {session ? (
            <p
              role="button"
              className="hover:text-gray-400 text-gray-600 inline"
              onClick={() => signOut()}
            >
              Logout
            </p>
          ) : (
            <p
              role="button"
              className="hover:text-gray-400 text-gray-600 inline"
              onClick={() => signIn()}
            >
              Admin Login{" "}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckIn() {
  const { data: session } = useSession();
  const { value: people, updateValue: addPerson } = useYJSBoundData(
    ["defaultPerson"],
    "people"
  ) as { value: string[]; updateValue: (InitialValueType) => void };
  function generatePersonId() {
    return (Date.now() * Math.random()).toFixed().toString();
  }
  return (
    <div className="mt-8 md:mt-16">
      <form onSubmit={(e) => e.preventDefault()}>
        {people.map((id, index) => (
          <Person key={id} id={id} index={index} />
        ))}
        <div className="mt-4 mb-8">
          <div
            role="button"
            onClick={() => {
              let oldPeople = people as string[];
              // In case the old value isn't an array
              try {
                [...oldPeople];
              } catch (err) {
                oldPeople = ["defaultPerson"];
              }
              addPerson([...oldPeople, generatePersonId()]);
            }}
            className="inline-block text-sm hover:cursor-pointer hover:bg-blue-800 bg-blue-600 text-white px-4 py-2"
          >
            Add a person
          </div>
        </div>
        <InputLabelGroup>
          {Label("comingFrom", "Where are you coming from today?")}
          <YJSBoundInput id="comingFrom" type="text" initial="" />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("goingTo", "Where are you plannning to go from here?")}
          <YJSBoundInput id="goingTo" type="text" initial="" />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("noOfAdults", "No of Adults")}
          <YJSBoundInput id="noOfAdults" type="number" initial="" min={1} />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("noOfChildren", "No of Children")}
          <YJSBoundInput id="noOfChildren" type="number" initial="" min={0} />
        </InputLabelGroup>

        {/* Allow saving to persistent database if users signed in */}
        {/* Guests aren't meant to sign in, only the receptionist.
        The receptionist can get data from guests by having guets to to 
        the same address without signing in */}

        {session ? (
          <div className="flex gap-x-4">
            <button
              onClick={() => {
                // Code to save data to backend
              }}
              className="mt-6 text-sm px-4 text-white py-2 bg-blue-600 hover:bg-blue-800"
            >
              Save
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}

function Person({ id, index }: { id: string; index: number }) {
  const myKey = (name: string) => `person${id}-${name}`;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  function handleDelete() {
    // Open delete modal
    setShowDeleteModal(true);
  }
  const documentChoices = ["Citizenship", "Passport", "Driving License"];
  return (
    <>
      <DeletePersonModal
        setDeleting={setDeleting}
        isOpen={showDeleteModal}
        setIsOpen={setShowDeleteModal}
        id={id}
        title="foobar"
        // title={
        //   // fields.first_name
        //   //   ? `You're deleting ${fields.first_name}'s record`
        //   //   : "Are you sure you want to delete this record?"
        // }
      />
      <div className="border-l mb-8 pl-4">
        <div className="flex flex-row gap-x-4 items-center">
          <div
            className={classNames(
              { "bg-blue-400": index % 6 === 0 },
              { "bg-blue-500": index % 6 === 1 },
              { "bg-blue-500": index % 6 === 2 },
              { "bg-blue-600": index % 6 === 3 },
              { "bg-blue-700": index % 6 === 4 },
              "bg-blue-800 rounded-full w-8 h-8 flex justify-center items-center"
            )}
          >
            <p className="text-sm text-white">{index + 1}</p>
          </div>
          {index > 0 ? (
            <div
              role="button"
              onClick={handleDelete}
              className={classNames(
                "bg-blue-200 text-sm px-2 hover:bg-red-600 hover:text-white",
                { "bg-red-600 text-white": isDeleting }
              )}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </div>
          ) : null}
        </div>
        <InputLabelGroup>
          {Label("first_name", "First Name")}
          <YJSBoundInput
            id={myKey("first_name")}
            name="first_name"
            type="text"
            initial=""
          />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("last_name", "Last Name")}
          <YJSBoundInput
            id={myKey("last_name")}
            name="last_name"
            type="text"
            initial=""
          />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("phone", "Phone")}
          <YJSBoundInput
            id={myKey("phone")}
            name="phone"
            type="text"
            initial=""
          />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("email", "Email")}
          <YJSBoundInput
            id={myKey("email")}
            name="email"
            type="email"
            initial=""
          />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("document", "Document Type")}
          <YJSBoundInput
            id={myKey("document")}
            name="documentt"
            type="choice"
            initial={documentChoices.length > 0 ? documentChoices[0] : ""}
            choices={documentChoices}
          />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("documentNumber", "Document Number")}
          <YJSBoundInput
            id={myKey("documentNumber")}
            name="documentNumber"
            type="text"
            initial=""
          />
        </InputLabelGroup>
      </div>
    </>
  );
}

export function DeletePersonModal({
  isOpen,
  setIsOpen,
  id,
  title,
  setDeleting,
}) {
  function closeModal() {
    setIsOpen(false);
  }

  // Globally synced map
  const { value: people, updateValue: deletePerson } = useYJSBoundData(
    ["defaultPerson"],
    "people"
  ) as { value: string[]; updateValue: (InitialValueType) => void };

  function confirmDelete() {
    const currentPeopleList = people;
    setIsOpen(false);
    // Delete after a certain interval for UX
    setDeleting(true);
    setTimeout(() => {
      deletePerson(currentPeopleList.filter((x) => x != id));
    }, 300);
  }

  return (
    <MyDialog isOpen={isOpen} closeModal={closeModal} titleString="Delete?">
      <div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">{title}</p>
        </div>
        <div className="mt-4 flex gap-4">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={closeModal}
          >
            Nop
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={confirmDelete}
          >
            Yes, Delete
          </button>
        </div>{" "}
      </div>
    </MyDialog>
  );
}
