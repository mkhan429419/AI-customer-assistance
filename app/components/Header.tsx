import Link from "next/link";
import React from "react";
import Avatar from "./Avatar";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

type Props = {};

const Header = (props: Props) => {
  return (
    <header className="bg-white shadow-sm text-gray-800 flex justify-between p-5">
      <Link href="/" className="flex items-center texxt-4xl font-thin">
        <Avatar seed="support agent" />
        <div className="space-y-1">
          <h1 className="">Customer Support AI</h1>
          <h2>Your customizable AI chat agent</h2>
        </div>
      </Link>
      <div className="flex items-center">
        <SignedIn>
          <UserButton showName />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
};

export default Header;
