import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "../utils/api";

const GuestBookEntries = () => {
  const { data: guestBookEntries, isLoading } = api.guestbook.getAll.useQuery();

  if (isLoading) return <div>Henter beskeder...</div>;

  return (
    <div className="flex flex-col gap-4">
      {guestBookEntries?.map((entry, index) => {
        return (
          <div
            key={index}
            className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
          >
            <p>{entry.message}</p>
            <span>- {entry.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const Form = () => {
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  const utils = api.useContext();

  const postMessage = api.guestbook.postMessage.useMutation({
    onMutate: async (newEntry) => {
      await utils.guestbook.getAll.cancel();

      utils.guestbook.getAll.setData(undefined, (prevEntries) => {
        if (prevEntries) {
          return [newEntry, ...prevEntries];
        } else {
          return [newEntry];
        }
      });
    },
    onSettled: async () => {
      await utils.guestbook.getAll.invalidate();
    },
  });

  if (status !== "authenticated") return null;

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        postMessage.mutate({
          name: session.user?.name as string,
          message,
        });

        setMessage("");
      }}
    >
      <input
        type="text"
        className="w-full rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
        placeholder="Din hilsen..."
        minLength={2}
        maxLength={100}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />

      <button
        type="submit"
        className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
      >
        Submit
      </button>
    </form>
  );
};

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  return (
    <>
      <main className="flex flex-col items-center">
        <h1 className="pt-4 text-3xl">Squirrels Lair Gæstebog</h1>
        <div className="pt-10">
          {session ? (
            <>
              <p className="mb-4 text-center">Hej {session.user?.name}</p>
              <button
                type="button"
                className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
                onClick={() => {
                  signOut().catch(console.log);
                }}
              >
                Log ud
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
                onClick={() => {
                  signIn("discord").catch(console.log);
                }}
              >
                Login med discord
              </button>
              <button
                type="button"
                className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
                onClick={() => {
                  signIn("auth0").catch(console.log);
                }}
              >
                Login med Email/Password
              </button>
            </>
          )}
        </div>
        <div className="pt-6">
          <div>
            <Form />
          </div>
          <div className="pt-5">
            <GuestBookEntries />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
