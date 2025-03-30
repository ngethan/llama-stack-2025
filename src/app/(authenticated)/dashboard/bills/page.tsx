"use client";

import "@mercoa/react/dist/tailwind.base.css";
import "@mercoa/react/dist/style.css";

import { api } from "@/trpc/react";
import dynamic from "next/dynamic";
import React from "react";

const MercoaSession = dynamic(
  () => import("@mercoa/react").then((mod) => mod.MercoaSession),
  { ssr: false },
);

const page = () => {
  const { data: mercoaToken } = api.mercoa.generateMercoaToken.useQuery({
    entityId: "ent_eeca3fc6-658b-45bb-aae1-f746c71385c3",
  });

  return (
    <>
      {mercoaToken ? (
        <div>
          <MercoaSession token={mercoaToken} />
        </div>
      ) : (
        <div>loading...</div>
      )}
    </>
  );
};

export default page;
