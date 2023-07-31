import {
  prove,
  PCDInitArgs,
  init,
  IdentityPCD,
  IdentityPCDArgs,
} from "pcd-country-identity";

export const proveWithWebProver = async (
  pcdArgs: IdentityPCDArgs
): Promise<IdentityPCD> => {
  const pcdInitArgs: PCDInitArgs = {
    wasmURL: "https://d3dxq5smiosdl4.cloudfront.net/main.wasm",
    zkeyURL: "https://d3dxq5smiosdl4.cloudfront.net/circuit_final.zkey",
    isWebEnv: true,
  };

  await init(pcdInitArgs);

  const pcd = await prove(pcdArgs);

  return pcd;
};
