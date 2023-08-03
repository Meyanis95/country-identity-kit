import { IdentityPCDArgs } from "pcd-country-identity";
import { ArgumentTypeName } from "@pcd/pcd-types";
import styled from "styled-components";
import { useContext, useEffect, Dispatch, SetStateAction } from "react";
import {
  CountryIdentityContext,
  CountryIdentityState,
} from "../useCountryIdentity";
import { Spinner } from "./LoadingSpinner";

export const ProveButton = ({
  msgBigInt,
  modulusBigInt,
  sigBigInt,
  validInputs,
  setIsModalOpen,
}: {
  msgBigInt?: bigint;
  modulusBigInt?: bigint;
  sigBigInt?: bigint;
  validInputs: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { state, startReq } = useContext(CountryIdentityContext);

  useEffect(() => {
    if (state.status === "logged-in") setIsModalOpen(false);
  });

  const args: IdentityPCDArgs = {
    base_message: {
      argumentType: ArgumentTypeName.BigInt,
      userProvided: false,
      value: msgBigInt?.toString(),
      description: "",
    },
    signature: {
      argumentType: ArgumentTypeName.BigInt,
      userProvided: false,
      value: sigBigInt?.toString(),
      description: "",
    },
    modulus: {
      argumentType: ArgumentTypeName.BigInt,
      userProvided: false,
      value: modulusBigInt?.toString(),
      description: "",
    },
  };

  return (() => {
    switch (state.status) {
      case "logged-out":
        return (
          <Btn
            disabled={!validInputs}
            onClick={() => {
              startReq({ type: "login", args });
            }}
          >
            Request Identity Proof
          </Btn>
        );
      case "logging-in":
        return (
          <Btn>
            Generating proof...
            {"\u2003"}
            <Spinner />
          </Btn>
        );
    }
  })();
};

const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: #f8f8f8;
  font-weight: bold;
  box-shadow: 0px 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border: none;
  min-width: 12rem;
  min-height: 3rem;
  border-radius: 0.5rem;
  background: linear-gradient(345deg, #10fe53 0%, #09d3ff 100%);

  &:hover {
    opacity: 70%;
    background: linear-gradient(345deg, #10fe53 0%, #09d3ff 100%);
  }

  &:active {
    background: #f8f8f8;
  }

  &:disabled {
    color: #a8aaaf;
    background: #e8e8e8;
    cursor: default;
  }
`;
