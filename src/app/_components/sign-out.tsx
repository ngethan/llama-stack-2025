"use client";

import { signOut } from "@/server/auth";
import React from "react";

const SignOut = () => {
  return (
    <div
      onClick={async () => {
        await signOut();
      }}
    >
      Sign out
    </div>
  );
};

export default SignOut;
