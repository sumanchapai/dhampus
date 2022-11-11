export default function handler(req, res) {
  res.status(200).json({
    group: [
      {
        type: "date",
        value: {
          id: "checkInDate",
          adminOnly: true,
          label: "Check In Date",
        },
      },
      {
        type: "date",
        value: {
          id: "checkOutDate",
          adminOnly: true,
          label: "Check Out Date",
        },
      },
      {
        type: "memo",
        value: {
          id: "memo",
          adminOnly: true,
          label: "Memo",
        },
      },
      {
        type: "text",
        value: {
          id: "comingFrom",
          adminOnly: false,
          label: "Where are you coming from today?",
        },
      },
      {
        type: "text",
        value: {
          id: "goingTo",
          adminOnly: false,
          label: "Where are you planning to go from here?",
        },
      },
      {
        type: "number",
        value: {
          id: "numberOfAdults",
          adminOnly: false,
          label: "Number of Adults",
          min: 1,
        },
      },
      {
        type: "number",
        value: {
          id: "numberOfChildren",
          adminOnly: false,
          label: "Number of Children",
          min: 1,
        },
      },
    ],
    individual: [
      {
        type: "text",
        value: {
          id: "first_name",
          adminOnly: false,
          label: "First Name",
        },
      },
      {
        type: "text",
        value: {
          id: "last_name",
          adminOnly: false,
          label: "Last Name",
        },
      },
      {
        type: "email",
        value: {
          id: "email",
          adminOnly: false,
          label: "Email",
        },
      },
      {
        type: "text",
        value: {
          id: "phone",
          adminOnly: false,
          label: "Phone Number",
        },
      },
      {
        type: "choice",
        value: {
          id: "document",
          adminOnly: false,
          label: "Document Type",
          choices: ["Citizenship", "Passport", "Driving License"],
        },
      },
      {
        type: "text",
        value: {
          id: "documentNumber",
          adminOnly: false,
          label: "Document Number",
        },
      },
    ],
  });
}
