import { IdentityPCD, IdentityPCDArgs } from "pcd-country-identity";
import { createContext, useContext } from "react";
import { SerializedPCD } from "@pcd/pcd-types";

export function useCountryIdentity(): [
  CountryIdentityState,
  (request: CountryIdentityRequest) => void,
] {
  const val = useContext(CountryIdentityContext);
  return [val.state, val.startReq];
}

export const CountryIdentityContext = createContext<CountryIdentityContextVal>({
  state: { status: "logged-out" },
  startReq: () => {},
});

export interface CountryIdentityContextVal {
  state: CountryIdentityState;
  startReq: (request: CountryIdentityRequest) => void;
}

export type CountryIdentityRequest =
  | { type: "login"; args: IdentityPCDArgs }
  | { type: "logout" };

export type CountryIdentityState = {
  /** Whether the user is logged in. @see ZupassLoginButton */
  status: "logged-out" | "logged-in" | "logging-in";
} & (
  | {
      status: "logged-out";
    }
  | {
      status: "logging-in";
    }
  | {
      status: "logged-in";
      serializedPCD: SerializedPCD<IdentityPCD>;
      pcd: IdentityPCD;
    }
);
