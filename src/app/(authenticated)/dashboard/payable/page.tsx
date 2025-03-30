"use client";

import { api } from "@/trpc/react";
import { MercoaSession, PayableDetails } from "@mercoa/react";
import React from "react";

const page = () => {
  const { data: mercoaToken } = api.mercoa.generateMercoaToken.useQuery({
    entityId: "ent_eeca3fc6-658b-45bb-aae1-f746c71385c3",
  });

  return (
    <>
      {mercoaToken ? (
        <div>
          <MercoaSession token={mercoaToken}>
            <PayableDetails invoiceId="inv_75120d92-58a2-4d05-8b3f-b8e6c01f879f " />
          </MercoaSession>
          <p>hey</p>
        </div>
      ) : (
        <div>loading...</div>
      )}
    </>
  );
};

export default page;
