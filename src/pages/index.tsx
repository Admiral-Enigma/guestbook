import { sign } from "crypto";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";


const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }


  return (
    <>
      <main className="flex flex-col items-center">
        <h1 className="text-3xl pt-4">Gæstebog</h1>
        <div className="pt-10">
          {session ? (
            <>
              <p className="mb-4 text-center">Hej {session.user?.name}</p>
              <button 
                type="button"
                className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
                onClick={() => {
                signOut().catch(console.log)
              }}>Log ud</button>
            </>
          ) : (
            <button 
              type="button"
              className="mx-auto block rounded-md bg-neutral-800 py-3 px-6 text-center hover:bg-neutral-700"
              onClick={() => {
                signIn("discord").catch(console.log)

            }}>Login med discord</button>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

