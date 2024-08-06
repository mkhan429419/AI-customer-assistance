import LoginButton from "@/components/LoginLogoutButton";
import UserGreetText from "@/components/UserGreetText";
import Image from "next/image";

export default function Home() {
  return (
    <main className="">
      <h1>Lets build!</h1>
      <UserGreetText/>
      <LoginButton/>
    </main>
  );
}
