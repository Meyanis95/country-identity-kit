import {
  prove,
  PCDInitArgs,
  init,
  IdentityPCD,
  IdentityPCDArgs,
  serialize,
} from "pcd-country-identity";
import { SerializedPCD } from "@pcd/pcd-types";

export const proveWithWebProver = async (
  pcdArgs: IdentityPCDArgs,
  onProve: (pcd: any, serialized: SerializedPCD) => void
) => {
  const pcdInitArgs: PCDInitArgs = {
    wasmURL: "https://d3dxq5smiosdl4.cloudfront.net/main.wasm",
    zkeyURL: "https://d3dxq5smiosdl4.cloudfront.net/circuit_final.zkey",
    isWebEnv: true,
  };

  await init(pcdInitArgs);

  const pcd = await prove(pcdArgs);
  const serialized = await serialize(pcd);

  onProve(pcd as any, serialized);
};
