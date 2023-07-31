import React, { useEffect, useState } from "react";
import { Modal } from "./ProveModal";
import { FileInput } from "./UploadButton";
import { ProveButton } from "./ProveButton";
import { pdfUpload, cerUpload } from "../utils";

export const OpenModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signedPdfData, setSignedPdfData] = useState(Buffer.from([]));
  const [signature, setSignature] = useState("");
  const [msgBigInt, setMsgBigInt] = useState<bigint>();
  const [sigBigInt, setSigBigInt] = useState<bigint>();
  const [modulusBigInt, setModulusBigInt] = useState<bigint>();
  const [validInputs, setValidInputs] = useState<boolean>(false);

  useEffect(() => {
    if (
      sigBigInt !== undefined &&
      modulusBigInt !== undefined &&
      msgBigInt !== undefined
    ) {
      setValidInputs(true);
    }
  }, [sigBigInt, modulusBigInt, msgBigInt]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { signature, signedData } = await pdfUpload(e);
    setSignature(signature);
    setSignedPdfData(signedData);
  };

  const handleCerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { msgBigInt, sigBigInt, modulusBigInt } = await cerUpload(
      e,
      signedPdfData,
      signature
    );

    setMsgBigInt(msgBigInt);
    setSigBigInt(sigBigInt);
    setModulusBigInt(modulusBigInt);
  };

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <>
          <FileInput onChange={handlePdfChange} />

          <FileInput onChange={handleCerUpload} />

          <ProveButton
            sigBigInt={sigBigInt}
            modulusBigInt={modulusBigInt}
            msgBigInt={msgBigInt}
            validInputs={validInputs}
          />
        </>
      </Modal>
    </div>
  );
};
