import { ChangeEvent, useState } from "react";

export const pdfUpload = (e: ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    try {
      const fileReader = new FileReader();
      fileReader.readAsBinaryString(e.target.files[0]);
      const userFilename = e.target.files[0].name;
      fileReader.onload = (e) => {
        if (e.target) {
          console.log("OkOk");
          try {
            const { signedData, signature, ByteRange } = extractSignature(
              Buffer.from(e.target.result as string, "binary")
            );
            console.log("Data extracted from PDF: ", signedData, signature);
            if (signature != "") {
              const signatureExp = (window as any).forge.asn1.fromDer(signature)
                .value as string;
              return { signatureExp, signedData };
            }
          } catch (error) {
            //setpdfStatus("error");
          }
        }
      };
    } catch {
      // setpdfStatus("");
      // setsignatureValidity("");
    }
  }
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
