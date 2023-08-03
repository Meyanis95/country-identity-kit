import {
  prove,
  PCDInitArgs,
  init,
  IdentityPCDArgs,
  serialize,
} from "pcd-country-identity";

export const proveWithWebProver = async (
  pcdArgs: IdentityPCDArgs
): Promise<{ pcd: any; serialized: any }> => {
  const pcdInitArgs: PCDInitArgs = {
    wasmURL: "https://d3dxq5smiosdl4.cloudfront.net/main.wasm",
    zkeyURL: "https://d3dxq5smiosdl4.cloudfront.net/circuit_final.zkey",
    isWebEnv: true,
  };

  await init(pcdInitArgs);

  const pcd = await prove(pcdArgs);
  const serialized = await serialize(pcd);

  return { pcd, serialized };
};
