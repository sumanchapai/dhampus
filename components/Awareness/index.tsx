import { CursorArrowRaysIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../pages/_app";
import randomColor from "randomcolor";
import { useRouter } from "next/router";

interface LocalUserState {
  name: string;
  cursor?: CursorState;
  color: string;
  path: string;
}

interface CursorState {
  x: number;
  y: number;
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
        cursor: {
          x: event.clientX + window.scrollX,
          y: event.clientY + window.scrollY,
        },
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
      path: "",
    };
    awareness.setLocalStateField("user", localUserState);
  }, []);
  const router = useRouter();
  const myPath = router?.asPath;
  // Filter by active users, and users in current room
  const noOfAliveUsers = users
    .filter((x) => x?.name)
    .filter((x) => x.path === myPath).length;

  // Changee awareness when user jump between different rooms to accurately show
  // the number of users in a particular room
  useEffect(() => {
    const oldState = awareness.getLocalState()["user"] as LocalUserState;
    awareness.setLocalStateField("user", { ...oldState, path: router.asPath });
  }, [router.asPath]);
  return (
    <>
      {users
        // Show current cursor as well
        .filter((x) => x?.name && x?.cursor?.x)
        .filter((x) => x?.path === myPath) // Filter by room
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

      <div className="flex items-baseline">
        <div className="flex gap-x-1">
          {users
            .filter((x) => x?.name)
            .filter((x) => x?.path === myPath) // Filter by room
            .map(({ name, cursor, color }: LocalUserState) => (
              <div
                key={name}
                className="flex justify-center items-center rounded-full h-6 w-6 lg:h-8 lg:w-8 mt-4"
                style={{
                  background: color,
                }}
              >
                <span className="text-sm opacity-0">{name.slice(1)}</span>
              </div>
            ))}
        </div>
        <div className="text-sm pl-4">
          {noOfAliveUsers} {noOfAliveUsers > 1 ? "users" : "user"} live
        </div>
      </div>
    </>
  );
}
