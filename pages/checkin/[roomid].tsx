"use client";
import React, { useContext, useEffect, useState, Fragment } from "react";
import { GlobalContext } from "../_app";
import { Dialog, Transition } from "@headlessui/react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { Map as yMap } from "yjs";
import { useSession, signIn, signOut } from "next-auth/react";
import AwareNess from "../../components/Awareness";
import { InputField, InputLabelGroup, Label } from "../../components/Form";
import { useRouter } from "next/router";

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
      <h1 className="text-2xl pl-2 bg-blue-800 text-white rounded inline-block px-8">
        Himali Lodge, Dhampus
      </h1>
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

  // Observe yMap when yMap isn't null
  if (fieldsMap) {
    fieldsMap.observe((event) => {
      const changedEntries = Array.from(event.keysChanged);
      changedEntries.forEach((entry) => {
        setFields((prev) => ({ ...prev, [entry]: fieldsMap.get(entry) }));
      });
    });
  }
  function updateFields(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const updated = fieldKeys.find((x) => x === e.target.name);
    if (updated) {
      console.log("setting fieldsMap");
      fieldsMap.set(updated, e.target.value);
    }
  }

  function generatePersonId() {
    return (Date.now() * Math.random()).toFixed().toString();
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
          console.log(
            "setting daata from",
            fieldsMap.get(entry),
            "rooname",
            roomName
          );
          setFields((prev) => ({
            ...prev,
            [entry]: fieldsMap.get(entry),
          }));
        }
      });
    }
  }, [fieldsMap, roomName]);

  // add a person
  function addPerson() {
    const personId = generatePersonId();
    const currentPersonList = fieldsMap.get("people") as [];
    console.log(
      "currentpersonlist",
      currentPersonList,
      "from fieeldsMap",
      fieldsMap,
      "roomname",
      roomName
    );
    fieldsMap.set("people", [...currentPersonList, personId]);
  }
  const { data: session } = useSession();

  return (
    <div className="mt-8 md:mt-16">
      <form onSubmit={(e) => e.preventDefault()}>
        {fields.people.map((id, index) => (
          <Person key={id} id={id} index={index} />
        ))}
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
            (x) => Number(x) >= 0,
            "Please enter a non negative value"
          )}
        </InputLabelGroup>
        {/* Allow saving to persistent database if users signed in */}
        {/* Guests aren't meant to sign in, only the receptionist.
        The receptionist can get data from guests by having guets to to 
        the same address without signing in */}
        {session ? (
          <input
            className="mt-6 text-sm px-4 text-white py-2 bg-blue-600"
            type="submit"
            value="Save"
          />
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

  // This is the key by which the person will be saved in the map
  function myKey() {
    return `person${id}`;
  }

  // Observe yMap if fieldsMap isn't null
  if (fieldsMap) {
    fieldsMap.observe((event) => {
      const changedEntries = Array.from(event.keysChanged);
      // If ChangedEntries contains key for the person, rerender the person details
      if (changedEntries.find((x) => x === myKey())) {
        sync(fieldNames);
      }
    });
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

  useEffect(() => {
    // Update data on initial load based on global data
    if (roomName && fieldsMap) sync(fieldNames);
  }, [roomName]);

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

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

  function openModal() {
    setIsOpen(true);
  }

  const { doc } = useContext(GlobalContext);
  // Globally synced map
  const [roomName, fieldsMap] = useMap();

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
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete ?
                  </Dialog.Title>
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
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export function SelectDocument({ value: selected, updateFields: setSelected }) {
  return (
    <Listbox value={selected} onChange={setSelected} name="document">
      <div className="max-w-sm">
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
            {documentChoices.map((choice, idx) => (
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