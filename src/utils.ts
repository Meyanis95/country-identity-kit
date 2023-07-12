import { ChangeEvent, useState } from "react";
import { extractSignature } from "pcd-country-identity";

export const pdfUpload = (e: ChangeEvent<HTMLInputElement>) => {
  const [signature, setsignature] = useState<string>("");
  const [signedPdfData, setsignedPdfData] = useState(Buffer.from([]));
  const [pdfStatus, setpdfStatus] = useState<string>("");
  const [signatureValidity, setsignatureValidity] = useState<string>("");

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
            if (signature != "") {
              setsignature(
                (window as any).forge.asn1.fromDer(signature).value as string
              );
              setsignedPdfData(signedData);
            }
          } catch (error) {
            setpdfStatus("error");
          }
        }
      };
    } catch {
      setpdfStatus("");
      setsignatureValidity("");
    }
  }
};
