import { requestIdentitypProof } from "./passport";

export const ProvingButton = ({
  msgBigInt,
  modulusBigInt,
  sigBigInt,
}: {
  msgBigInt: bigint;
  modulusBigInt: bigint;
  sigBigInt: bigint;
}) => {
  return (
    <button
      onClick={() => {
        if (msgBigInt && modulusBigInt && sigBigInt) {
          requestIdentitypProof({
            msgBigInt,
            modulusBigInt,
            sigBigInt,
          });
        }
      }}
      //   disabled={valid}
    >
      Request Identity Proof
    </button>
  );
};
