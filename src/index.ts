import { pdfUpload, cerUpload } from "./utils";
import { FileInput } from "./UploadButton";
import { OpenPassportRequest } from "./ProveWithPassport";
import { useIdentityProof, requestIdentitypProof } from "./passport";
import { ProveButton } from "./ProveButton";
import { OpenModal } from "./OpenModalButton";
import { useLoadingSpinner } from "./useLoadingSpinner";

export {
  FileInput,
  pdfUpload,
  cerUpload,
  OpenPassportRequest,
  useIdentityProof,
  requestIdentitypProof,
  ProveButton,
  OpenModal,
  useLoadingSpinner,
};
