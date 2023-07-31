import { proveWithWebProver } from "./prove";
import { IdentityPCDArgs } from "pcd-country-identity";
import { ArgumentTypeName } from "@pcd/pcd-types";
import styled from "styled-components";

export const ProveButton = ({
  msgBigInt,
  modulusBigInt,
  sigBigInt,
  validInputs,
}: {
  msgBigInt?: bigint;
  modulusBigInt?: bigint;
  sigBigInt?: bigint;
  validInputs: boolean;
}) => {
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

  return (
    <Btn
      disabled={!validInputs}
      onClick={async () => {
        await proveWithWebProver(args);
      }}
    >
      Request Identity Proof
    </Btn>
  );
};

const Btn = styled.button`
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

  /* &:hover {
    background: #fafafa;
  } */

  &:active {
    background: #f8f8f8;
  }

  &:disabled {
    color: #a8aaaf;
    background: #e8e8e8;
    cursor: default;
  }
`;
