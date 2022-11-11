"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import AwareNess from "../../components/Awareness";
import { InputLabelGroup, Label } from "../../components/Form";
import Link from "next/link";
import MyDialog from "../../components/Dialog";
import { useYJSBoundData, YJSBoundInput } from "../../components/Form/yjs";
import classNames from "classnames";
import Layout from "../../components/Layout";
import { GetStaticProps, GetStaticPaths } from "next";
import { FormField, FormFields } from "../../types/api/checkin";
import { FormFieldMapper } from "../../components/Form/mapper";

interface PageProps {
  formFields: FormFields;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking", // blocking means page will not be shown until all data is available
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const formFields: FormFields = await fetch(
    `${process.env.API_URL}/api/checkIn`
  )
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
    });
  return {
    props: { formFields } as PageProps,
  };
};

export default function Home(props: PageProps) {
  return (
    <Layout>
      <Link href="/">
        <h1 className="text-2xl px-2 bg-blue-800 text-white rounded inline-block">
          Himali Lodge, Dhampus
        </h1>
      </Link>
      <p className="mt-8 text-sm">
        Your data is encrypted and safely stored in Himali Green servers.
      </p>
      <AwareNess />
      {CheckIn(props.formFields.group, props.formFields.individual)}
    </Layout>
  );
}

function CheckIn(group: Array<FormField>, individual: Array<FormField>) {
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
          <Person key={id} id={id} index={index} questions={individual} />
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

        {/* Group Questions */}

        {group.map((question, index) => (
          <FormFieldMapper key={index} data={question} />
        ))}

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

function Person({
  id,
  index,
  questions,
}: {
  id: string;
  index: number;
  questions: Array<FormField>;
}) {
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
        title="Are you sure you want to delete this record?"
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

        {/* Individual Questions */}

        {questions.map((question, index) => (
          <FormFieldMapper
            key={index}
            data={question}
            name={question.value.id}
            newKey={myKey(question.value.id)}
          />
        ))}
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
