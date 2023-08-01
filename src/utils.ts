import { ChangeEvent, Dispatch, SetStateAction } from "react";
import * as peculiarX509 from "@peculiar/x509";
import * as forge from "node-forge";
import {
  AdhaarPdfValidation,
  AdhaarSignatureValidition,
  AdhaarCertificateValidation,
} from "./interface";

/**
 * Handle the upload of the pdf, extract the signature and the signed data.
 * @param pdf pdf buffer
 * @returns {Signature, signedData}
 */
export const pdfUpload = (
  e: ChangeEvent<HTMLInputElement>,
  setpdfStatus: Dispatch<SetStateAction<"" | AdhaarPdfValidation>>,
  setsignatureValidity: Dispatch<SetStateAction<"" | AdhaarSignatureValidition>>
): Promise<{ signature: string; signedData: Buffer }> => {
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

              if (signature != "") {
                resolve({
                  signature: (forge as any).asn1.fromDer(signature)
                    .value as string,
                  signedData,
                });
                setpdfStatus(AdhaarPdfValidation.SIGNATURE_PRESENT);
              } else {
                setpdfStatus(AdhaarPdfValidation.SIGNATURE_NOT_PRESENT);
              }
            } catch (error) {
              setpdfStatus(AdhaarPdfValidation.ERROR_PARSING_PDF);
              reject(error);
            }
          }
        };
      } catch {
        setpdfStatus("");
        setsignatureValidity("");
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

/**
 * Handle the upload of the certification, extract the message, the signature and the modulus.
 * @param pdf pdf buffer
 * @param signedPdfData signed data attached to the pdf
 * @param signature the signature attached to the aadhaar card
 * @returns {msgBigInt, sigBigInt, modulusBigInt}
 */
export const cerUpload = async (
  e: ChangeEvent<HTMLInputElement>,
  signedPdfData: Buffer,
  signature: string,
  pdfStatus: "" | AdhaarPdfValidation,
  setcertificateStatus: Dispatch<
    SetStateAction<"" | AdhaarCertificateValidation>
  >,
  setsignatureValidity: Dispatch<SetStateAction<"" | AdhaarSignatureValidition>>
): Promise<{ msgBigInt: bigint; sigBigInt: bigint; modulusBigInt: bigint }> => {
  return new Promise((resolve, reject) => {
    if (e.target.files) {
      try {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(e.target.files[0]);
        const userFilename = e.target.files[0].name;
        fileReader.onload = (e) => {
          if (e.target && pdfStatus == AdhaarPdfValidation.SIGNATURE_PRESENT) {
            try {
              const cer = new peculiarX509.X509Certificate(
                e.target.result as Buffer
              );

              // setx509Certificate(cer);
              // (window as any) to avoid typescript complaining
              const cert = (forge as any).pki.certificateFromPem(
                cer.toString("pem")
              );

              const md = (forge as any).md.sha1.create();
              md.update(signedPdfData.toString("binary")); // defaults to raw encoding

              const decryptData = Buffer.from(
                cert.publicKey.encrypt(signature, "RAW"),
                "binary"
              );
              const hash = Buffer.from(md.digest().bytes(), "binary");

              const isValid =
                Buffer.compare(decryptData.subarray(236, 256), hash) === 0;

              if (isValid) {
                const msgBigInt = BigInt("0x" + hash.toString("hex"));
                const sigBigInt = BigInt(
                  "0x" + Buffer.from(signature, "binary").toString("hex")
                );
                const modulusBigInt = BigInt(
                  "0x" + cert.publicKey.n.toString(16)
                );
                setsignatureValidity(AdhaarSignatureValidition.SIGNATURE_VALID);
                setcertificateStatus(
                  AdhaarCertificateValidation.CERTIFICATE_CORRECTLY_FORMATTED
                );
                resolve({ msgBigInt, sigBigInt, modulusBigInt });
              } else {
                setsignatureValidity(
                  AdhaarSignatureValidition.SIGNATURE_INVALID
                );
                setcertificateStatus(
                  AdhaarCertificateValidation.CERTIFICATE_CORRECTLY_FORMATTED
                );
                reject();
              }
            } catch (error) {
              setsignatureValidity(AdhaarSignatureValidition.SIGNATURE_INVALID);
              setcertificateStatus(
                AdhaarCertificateValidation.ERROR_PARSING_CERTIFICATE
              );
              reject();
            }
          } else {
            setcertificateStatus(AdhaarCertificateValidation.NO_PDF_UPLOADED);
            reject();
          }
        };
      } catch (error) {
        setsignatureValidity(AdhaarSignatureValidition.SIGNATURE_INVALID);
        setcertificateStatus("");
        reject();
      }
    }
  });
};
