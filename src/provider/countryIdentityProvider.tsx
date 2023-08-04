import { ReactNode, useEffect, useState } from "react";
import {
  CountryIdentityContext,
  CountryIdentityRequest,
  CountryIdentityState,
} from "../hooks/useCountryIdentity";
import { IdentityPCD, IdentityPCDPackage } from "pcd-country-identity";
import React from "react";
import { proveWithWebProver } from "../prove";
import { SerializedPCD } from "@pcd/pcd-types";

export function CountryIdentityProvider(props: { children: ReactNode }) {
  // Read state from local storage on page load
  const [pcdStr, setPcdStr] = useState<SerializedPCD<IdentityPCD> | "">("");
  const [pcd, setPcd] = useState<IdentityPCD | "">("");
  const [state, setState] = useState<CountryIdentityState>({
    status: "logged-out",
  });
  useEffect(() => {
    readFromLocalStorage().then(setAndWriteState);
  }, []);

  // Write state to local storage whenever a login starts, succeeds, or fails
  const setAndWriteState = (newState: CountryIdentityState) => {
    console.log(`[COUNTRY-IDENTITY] new state ${shallowToString(newState)}`);
    setState(newState);
    writeToLocalStorage(newState);
  };

  // Send login requests
  const startReq = React.useCallback(
    (request: CountryIdentityRequest) => {
      console.log(`[COUNTRY-IDENTITY] startReq ${shallowToString(request)}`);
      setAndWriteState(handleLoginReq(request, setPcdStr, setPcd));
    },
    [setAndWriteState]
  );

  // Receive PCDs from passport popup
  React.useEffect(() => {
    if (pcdStr === "" || pcd === "") return;
    console.log(`[COUNTRY-IDENTITY] trying to log in with ${pcdStr}`);
    handleLogin(state, pcdStr, pcd)
      .then((newState) => {
        if (newState) setAndWriteState(newState);
        else
          console.log(
            `[COUNTRY-IDENTITY] ${state.status}, ignoring pcd: ${pcdStr}`
          );
      })
      .catch((e: unknown) => {
        console.error(e);
        console.error(
          `[COUNTRY-IDENTITY] error logging in, ignoring pcd: ${pcdStr}`
        );
      });
  }, [pcdStr]);

  // Provide context
  const val = React.useMemo(() => ({ state, startReq }), [state]);

  return (
    <CountryIdentityContext.Provider value={val}>
      {props.children}
    </CountryIdentityContext.Provider>
  );
}

export async function readFromLocalStorage(): Promise<CountryIdentityState> {
  const json = window.localStorage["countryIdentity"];
  try {
    const state = await parseAndValidate(json);
    console.log(
      `[COUNTRY-IDENTITY] read stored state: ${shallowToString(state)}`
    );
    return state;
  } catch (e) {
    console.error(`[COUNTRY-IDENTITY] error parsing stored state: ${e}`);
    return { status: "logged-out" };
  }
}

function writeToLocalStorage(state: CountryIdentityState) {
  console.log(
    `[COUNTRY-IDENTITY] writing to local storage, status ${state.status}`
  );
  window.localStorage["countryIdentity"] = serialize(state);
}

export function serialize(state: CountryIdentityState): string {
  const { status } = state;
  let serState;
  if (status === "logged-in") {
    serState = {
      status,
      serializedPCD: state.serializedPCD,
      pcd: state.pcd,
    };
  } else {
    serState = {
      status: "logged-out",
    };
  }
  return JSON.stringify(serState);
}

export async function parseAndValidate(
  json?: string
): Promise<CountryIdentityState> {
  if (json == null || json.trim() === "") {
    return { status: "logged-out" };
  }

  const stored = JSON.parse(json);

  // Validate status
  if (!["logged-out", "logged-in"].includes(stored.status)) {
    throw new Error(`Invalid status ${stored.status}`);
  }

  if (stored.status === "logged-out") {
    return { status: stored.status };
  }

  // Parse and validate PCD and accompanying metadata.
  const { status, serializedPCD, pcd } = stored;
  if (serializedPCD == null) {
    throw new Error(`Missing serialized PCD`);
  } else if (pcd == null) {
    throw new Error(`Missing PCD`);
  } else if (serializedPCD.type !== IdentityPCDPackage.name) {
    throw new Error(`Invalid PCD type ${serializedPCD.type}`);
  }

  return {
    status,
    pcd: await IdentityPCDPackage.deserialize(serializedPCD.pcd),
    serializedPCD: serializedPCD,
  };
}

function shallowToString(obj: any) {
  return JSON.stringify(obj, function (key: string, val: any) {
    if (key === "") return val;
    if (val == null) return null;
    if (typeof val === "bigint") return "" + val;
    if (Array.isArray(val)) return "<array>";
    if (typeof val === "object") return "<object>";
    return val;
  });
}

/** Pops up the passport, requesting a login. Returns a `logging-in` state */
function handleLoginReq(
  request: CountryIdentityRequest,
  setPcdStr: any,
  setPcd: any
): CountryIdentityState {
  const { type } = request;
  console.log("Type of request received: ", type);
  switch (type) {
    case "login":
      try {
        const { args } = request;
        proveWithWebProver(args).then(
          ({
            pcd,
            serialized,
          }: {
            pcd: IdentityPCD;
            serialized: SerializedPCD<IdentityPCD>;
          }) => {
            setPcdStr(serialized);
            setPcd(pcd);
          }
        );
      } catch (error) {
        console.log(error);
      }
      return { status: "logging-in" };

    case "logout":
      return { status: "logged-out" };

    default:
      throw new Error(`Invalid request type ${type}`);
  }
}

/** Returns either a `logged-in` state, null to ignore, or throws on error. */
async function handleLogin(
  state: CountryIdentityState,
  pcdStr: SerializedPCD<IdentityPCD>,
  _pcd: IdentityPCD
): Promise<CountryIdentityState | null> {
  if (state.status !== "logging-in") {
    console.log(
      `[COUNTRY-IDENTITY] ignoring message. State != logging-in: ${state}`
    );
    return null;
  }

  console.log(`[COUNTRY-IDENTITY] verifying ${pcdStr.type}`);

  if (!(await IdentityPCDPackage.verify(_pcd))) {
    throw new Error("Invalid proof");
  }

  return {
    status: "logged-in",
    serializedPCD: pcdStr,
    pcd: _pcd,
  };
}
