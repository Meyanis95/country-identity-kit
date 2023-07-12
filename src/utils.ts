import { ChangeEvent } from "react";
import * as peculiarX509 from "@peculiar/x509";

export const pdfUpload = (e: ChangeEvent<HTMLInputElement>) => {
  return new Promise((resolve, reject) => {
    if (e.target.files) {
      try {
        const fileReader = new FileReader();
        fileReader.readAsBinaryString(e.target.files[0]);
        const userFilename = e.target.files[0].name;
        fileReader.onload = (e) => {
          if (e.target) {
            try {
              const { signedData, signature, ByteRange } = extractSignature(
                Buffer.from(e.target.result as string, "binary")
              );
              console.log("Data extracted from PDF: ", signedData, signature);
              resolve({ signature, signedData });

              // if (signature != "") {
              //   // const signatureExp = (window as any).forge.asn1.fromDer(signature)
              //   //   .value as string;
              //   // console.log("sig after: ", signatureExp);
              // }
            } catch (error) {
              //setpdfStatus("error");
              console.log(error);
              reject(error);
            }
          }
        };
      } catch {
        // setpdfStatus("");
        // setsignatureValidity("");
        reject();
      }
    }
  });
};

/**
 * Get signature from pdf. Thank a another authors for this piece of code.
 * @param pdf pdf buffer
 * @param signaturePosition the position of signature
 * @returns {RangeByte, signature and signedData}
 */
export const extractSignature = (pdf: Buffer, signaturePosition = 1) => {
  const byteRangePos = getSubstringIndex(
    pdf,
    "/ByteRange [",
    signaturePosition
  );

  const byteRangeEnd = pdf.indexOf("]", byteRangePos);
  const byteRange = pdf.subarray(byteRangePos, byteRangeEnd + 1).toString();
  const matches = /\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+) *\]/.exec(
    byteRange
  );

  if (matches == null) {
    return {
      ByteRange: [0],
      signature: "",
      signedData: Buffer.from([]),
    };
  } else {
    const ByteRange = matches.slice(1).map(Number);
    const signedData = Buffer.concat([
      pdf.subarray(ByteRange[0], ByteRange[0] + ByteRange[1]),
      pdf.subarray(ByteRange[2], ByteRange[2] + ByteRange[3]),
    ]);
    const signatureHex = pdf
      .subarray(ByteRange[0] + ByteRange[1] + 1, ByteRange[2])
      .toString("binary")
      .replace(/(?:00|>)+$/, "");
    const signature = Buffer.from(signatureHex, "hex").toString("binary");
    return {
      ByteRange: matches.slice(1, 5).map(Number),
      signature,
      signedData,
    };
  }
};

const getSubstringIndex = (str: Buffer, substring: string, n: number) => {
  let times = 0;
  let index = 0;

  while (times < n && index !== -1) {
    index = str.indexOf(substring, index + 1);
    times += 1;
  }

  return index;
};

export const cerUpload = async (
  e: ChangeEvent<HTMLInputElement>,
  signedPdfData: Buffer,
  signature: string
) => {
  if (e.target.files) {
    try {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(e.target.files[0]);
      const userFilename = e.target.files[0].name;
      fileReader.onload = (e) => {
        if (e.target) {
          try {
            const cer = new peculiarX509.X509Certificate(
              e.target.result as Buffer
            );
            // setx509Certificate(cer);
            // (window as any) to avoid typescript complaining
            const cert = (window as any).forge.pki.certificateFromPem(
              cer.toString("pem")
            );

            const md = (window as any).forge.md.sha1.create();
            md.update(signedPdfData.toString("binary")); // defaults to raw encoding

            const decryptData = Buffer.from(
              cert.publicKey.encrypt(signature, "RAW"),
              "binary"
            );
            const hash = Buffer.from(md.digest().bytes(), "binary");

            const isValid =
              Buffer.compare(decryptData.subarray(236, 256), hash) === 0;
            console.log("Is valid? ", isValid);
            if (isValid) {
              const msgBigInt = BigInt("0x" + hash.toString("hex"));
              const sigBigInt = BigInt(
                "0x" + Buffer.from(signature, "binary").toString("hex")
              );
              const modulusBigInt = BigInt(
                "0x" + cert.publicKey.n.toString(16)
              );
              return { msgBigInt, sigBigInt, modulusBigInt };
            }
          } catch (error) {
            console.log(error);
          }
        }
      };
    } catch (error) {
      console.log(error);
    }
  }
};
