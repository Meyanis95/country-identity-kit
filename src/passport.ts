import {
  constructPassportPcdProveAndAddRequestUrl,
  openPassportPopup,
  usePassportPopupMessages,
  usePCDMultiplexer,
  usePendingPCD,
  useSerializedPCD,
} from "@pcd/passport-interface";
import { IdentityPCDPackage } from "pcd-country-identity";
import { ArgumentTypeName } from "@pcd/pcd-types";

export const ZUPASS_URL = "http://localhost:3000/";

export function requestIdentitypProof(
  debug: boolean,
  proveOnServer: boolean,
  args: { msgBigInt: bigint; sigBigInt: bigint; modulusBigInt: bigint }
) {
  const popupUrl = "http://localhost:3001/popup";
  const proofUrl = constructPassportPcdProveAndAddRequestUrl<
    typeof IdentityPCDPackage
  >(
    ZUPASS_URL,
    popupUrl,
    IdentityPCDPackage.name,
    {
      message: {
        argumentType: ArgumentTypeName.BigInt,
        userProvided: false,
        value: args.msgBigInt?.toString(),
        description: "",
      },
      signature: {
        argumentType: ArgumentTypeName.BigInt,
        userProvided: false,
        value: args.sigBigInt?.toString(),
        description: "",
      },
      exp: {
        argumentType: ArgumentTypeName.BigInt,
        value: BigInt(65337).toString(),
        userProvided: false,
        description: "",
      },
      mod: {
        argumentType: ArgumentTypeName.BigInt,
        userProvided: false,
        value: args.modulusBigInt?.toString(),
        description: "",
      },
    },
    {
      genericProveScreen: true,
      description: "Generate a proof of identity using your Aadhaar card.",
      title: "Identity Proof",
      debug: debug,
      proveOnServer: proveOnServer,
    }
  );

  openPassportPopup(popupUrl, proofUrl);
}
