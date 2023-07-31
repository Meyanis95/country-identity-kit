import { pdfUpload, cerUpload } from "./utils";
import { FileInput } from "./components/UploadButton";
import { OpenPassportRequest } from "./components/ProveWithPassport";
import { useIdentityProof, requestIdentitypProof } from "./passport";
import { ProveButton } from "./components/ProveButton";
import { OpenModal } from "./components/OpenModalButton";
import { Spinner } from "./components/LoadingSpinner";

export {
  FileInput,
  pdfUpload,
  cerUpload,
  OpenPassportRequest,
  useIdentityProof,
  requestIdentitypProof,
  ProveButton,
  OpenModal,
  Spinner,
};
