"use client";
import React, { useContext, useEffect, useState, Fragment } from "react";
import { GlobalContext } from "../_app";
import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Map as yMap } from "yjs";
import { useSession, signIn, signOut } from "next-auth/react";
import AwareNess from "../../components/Awareness";
import {
  InputField,
  InputLabelGroup,
  Label,
  SelectDocument,
} from "../../components/Form";
import { useRouter } from "next/router";
import Link from "next/link";
import MyDialog from "../../components/Dialog";

// This function is used to give the Map used for a particular page.
// This concept is helpful when multiple groups of people are trying
// to checkin at the same time, we could have them go to different virutal
// rooms to checkin so that they can all checkin at the same time.
function useMap(): [string | undefined, yMap<any | null>] {
  const { doc } = useContext(GlobalContext);
  const router = useRouter();
  let roomName = router?.query?.roomid;
  const sessionsMap = doc.getMap("sessionsMap");
  if (typeof roomName !== "string") {
    return [undefined, null];
  } else {
    const roomMap = sessionsMap.get(roomName) as yMap<any>;
    // Both roomName and roomMap have to be passed so that
    // at times when the router query gives us an undefined value
    // we don't use the empty map to wipe up our data instead of
    // setting our current state to match that
    if (roomMap) {
      return [roomName, roomMap];
    } else {
      const yMapNested = new yMap();
      sessionsMap.set(roomName, yMapNested);
      return [roomName, sessionsMap.get(roomName) as yMap<any>];
    }
  }
}

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
  const defaultPersonList = ["default"];
  const initialValues = {
    comingFrom: "",
    goingTo: "",
    noOfAdults: 1,
    noOfChildren: 0,
    people: defaultPersonList,
  };
  const [fields, setFields] = useState(initialValues);

  // Global Sync map
  // const fieldsMap = doc.getMap(useCheckInId());
  const [roomName, fieldsMap] = useMap();

  // List of keys; for convinience
  const fieldKeys = Object.keys(initialValues);

  const { data: session } = useSession();

  function updateFields(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const updated = fieldKeys.find((x) => x === e.target.name);
    if (updated) {
      fieldsMap.set(updated, e.target.value);
    }
  }

  function generatePersonId() {
    return (Date.now() * Math.random()).toFixed().toString();
  }

  // add a person
  function addPerson() {
    const personId = generatePersonId();
    let currentPersonList = fieldsMap.get("people") as string[];
    // Safeguard in case data is dirty
    try {
      [...currentPersonList];
    } catch (err) {
      throw err;
      currentPersonList = defaultPersonList;
    } finally {
      fieldsMap.set("people", [...currentPersonList, personId]);
    }
  }

  // Set list of person in global store if not set
  useEffect(() => {
    // Proceed only if we're in a valid room name
    if (roomName && fieldsMap) {
      const currentPersonList = fieldsMap.get("people") as string[];
      if (!currentPersonList || currentPersonList.length === 0) {
        fieldsMap.set("people", defaultPersonList);
      }
    }
  }, [roomName]);

  useEffect(() => {
    // Proceed only if we're in a valid room name
    if (roomName && fieldsMap) {
      fieldKeys.forEach((entry) => {
        // Prevent from having no people
        if (entry === "people") {
          setFields((prev) => ({
            ...prev,
            people: (fieldsMap.get("people") || fields.people) as string[],
          }));
        } else {
          setFields((prev) => ({
            ...prev,
            [entry]: fieldsMap.get(entry),
          }));
        }
      });
    }
  }, [fieldsMap, roomName]);

  // UseEffect to observer the map
  // Observe yMap when yMap isn't null
  useEffect(() => {
    function observer(event) {
      const changedEntries = Array.from(event.keysChanged);
      changedEntries.forEach((entry: string) => {
        setFields((prev) => ({ ...prev, [entry]: fieldsMap.get(entry) }));
      });
    }
    if (fieldsMap) {
      fieldsMap.observe(observer);
      return () => {
        fieldsMap.unobserve(observer);
      };
    }
  }, [fieldsMap, roomName]);

  return (
    <div className="mt-8 md:mt-16">
      <form onSubmit={(e) => e.preventDefault()}>
        {fields.people.map((id, index) => (
          <Person key={id} id={id} index={index} />
        ))}
        {JSON.stringify(fields, null, 2)}
        <div className="mt-4 mb-8">
          <div
            role="button"
            onClick={addPerson}
            className="inline-block text-sm hover:cursor-pointer hover:bg-blue-800 bg-blue-600 text-white px-4 py-2"
          >
            Add a person
          </div>
        </div>
        <InputLabelGroup>
          {Label("comingFrom", "Where are you coming from today?")}
          {InputField("comingFrom", "text", fields.comingFrom, updateFields)}
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("goingTo", "Where are you plannning to go from here?")}
          {InputField("goingTo", "text", fields.goingTo, updateFields)}
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("noOfAdults", "No of Adults")}
          {InputField(
            "noOfAdults",
            "number",
            fields.noOfAdults,
            updateFields,
            (x) => Number(x) >= 1,
            "Are you sure there are no adults?"
          )}
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("noOfChildren", "No of Children")}
          {InputField(
            "noOfChildren",
            "number",
            fields.noOfChildren,
            updateFields,
            (x) => x === "" || x === undefined || Number(x) >= 0,
            "Please enter a non negative value"
          )}
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

interface PersonType {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  document?: string;
  documentNumber?: string;
}

const documentChoices = ["Citizenship", "Passport", "Driving License"];
function Person({ id, index }) {
  const emptyInfo: PersonType = {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    document: documentChoices[0],
    documentNumber: "",
  };

  const [fields, setFields] = useState<PersonType>(emptyInfo);

  // Globally synced map
  const [roomName, fieldsMap] = useMap();

  // List of field names, kept for convenience
  const fieldNames = Object.keys(emptyInfo);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  // This is the key by which the person will be saved in the map
  function myKey() {
    return `person${id}`;
  }

  function sync(keysToSync) {
    const person = fieldsMap.get(myKey());
    keysToSync.forEach((fieldName) => {
      // If the person exists and the fieldName is not null
      if (person && person[fieldName]) {
        setFields((prev) => ({
          ...prev,
          [fieldName]: fieldsMap.get(myKey())[fieldName],
        }));
      }
    });
  }

  // The following function determines how local edits are handled
  function updateFields(e: React.ChangeEvent<HTMLInputElement>) {
    const newPerson = { ...fields, [e.target.name]: [e.target.value] };
    // Set Locally
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Send global update
    fieldsMap.set(myKey(), newPerson);
  }
  function handleDelete() {
    // Do nothing
    setShowDeleteModal(true);
  }

  useEffect(() => {
    function observer(event) {
      const changedEntries = Array.from(event.keysChanged);
      // If ChangedEntries contains key for the person, rerender the person details
      if (changedEntries.find((x) => x === myKey())) {
        sync(fieldNames);
      }
    }
    if (roomName && fieldsMap) {
      fieldsMap.observe(observer);
      return () => {
        fieldsMap.unobserve(observer);
      };
    }
  }, [fieldsMap]);

  return (
    <>
      <DeletePersonModal
        setDeleting={setDeleting}
        isOpen={showDeleteModal}
        setIsOpen={setShowDeleteModal}
        id={id}
        title={
          fields.first_name
            ? `You're deleting ${fields.first_name}'s record`
            : "Are you sure you want to delete this record?"
        }
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
          {InputField("first_name", "text", fields.first_name, updateFields)}
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("last_name", "Last Name")}
          {InputField("last_name", "text", fields.last_name, updateFields)}
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("phone", "Phone")}
          {InputField("phone", "phone", fields.phone, updateFields)}
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("email", "Email")}
          {InputField("email", "email", fields.email, updateFields)}
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("document", "Document Type")}
          <SelectDocument
            choices={documentChoices}
            value={fields.document}
            updateFields={(newValue) => {
              const newPerson = {
                ...(fieldsMap.get(myKey()) as Object),
                document: newValue,
              };
              setFields((prev) => ({ ...prev, document: newValue }));
              fieldsMap.set(myKey(), newPerson);
            }}
          />
        </InputLabelGroup>
        <InputLabelGroup>
          {Label("documentNumber", "Document Number")}
          {InputField(
            "documentNumber",
            "documentNumber",
            fields.documentNumber,
            updateFields
          )}
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
  const [_, fieldsMap] = useMap();

  function confirmDelete() {
    const currentPeopleList = fieldsMap.get("people") as string[];
    setIsOpen(false);
    // Delete after a certain interval for UX
    setDeleting(true);
    setTimeout(() => {
      fieldsMap.set(
        "people",
        currentPeopleList.filter((x) => x != id)
      );
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
