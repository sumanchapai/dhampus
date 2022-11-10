import { CursorArrowRaysIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../pages/_app";

interface LocalUserState {
  name: string;
  cursor?: CursorState;
  color: string;
}

interface CursorState {
  x: number;
  y: number;
}

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

export default function AwareNess() {
  const { network } = useContext(GlobalContext);
  const awareness = network.awareness;

  const [users, setUsers] = useState([] as LocalUserState[]);

  // You can observe when a user updates their awareness information
  awareness.on("change", (changes) => {
    // Whenever somebody updates their awareness information,
    // we log all awareness information from all users.
    const newStates = Array.from(awareness.getStates().values()).map(
      (x) => x.user
    ) as Array<LocalUserState>;
    setUsers(() => [...newStates]);
  });

  // On mouse move
  useEffect(() => {
    function onMouseMove(event) {
      // Get local awareness state
      const oldState = awareness.getLocalState()["user"] as LocalUserState;
      const newState: LocalUserState = {
        ...oldState,
        cursor: { x: event.clientX, y: event.clientY },
      };
      awareness.setLocalStateField("user", newState);
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  });

  // First time after loggging in, send your awareness state
  useEffect(() => {
    const localUserState: LocalUserState = {
      name: (Math.random() * 1000).toFixed(),
      color: randomColor(),
    };
    awareness.setLocalStateField("user", localUserState);
  }, []);
  //   console.log(users.filter((x) => x.name));
  console.log(users.filter((x) => x?.name));
  return (
    <>
      {users
        .slice(1)
        .filter((x) => x?.name && x?.cursor?.x)
        .map(({ name, cursor, color }: LocalUserState) => (
          <div
            key={name}
            className="absolute w-4 y-4 md:w-6 md:h-6 lg:h-8 lg:w-8 mt-4"
            style={{
              color,
              top: cursor?.y ?? 0,
              left: cursor?.x ?? 0,
            }}
          >
            <CursorArrowRaysIcon />
          </div>
        ))}
      <div>USERS: {JSON.stringify(users.length)}</div>
    </>
  );
}
