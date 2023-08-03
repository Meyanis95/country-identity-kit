import { useState } from "react";
import { Modal } from "./ProveModal";
import styled from "styled-components";
import { text } from "../utils";

export const LogInWithCountryIdentity = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Btn onClick={openModal}>
        {text("🌏", "Log In with Country Identity")}
      </Btn>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        setIsModalOpen={setIsModalOpen}
      ></Modal>
    </div>
  );
};

const Btn = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: #000000;
  font-weight: bold;
  border-radius: 1.3125rem;
  background: #fff;
  box-shadow: 0px 3px 8px 1px rgba(0, 0, 0, 0.25);
  border: none;
  min-width: 12rem;
  min-height: 3rem;
  border-radius: 0.5rem;

  &:hover {
    background: #fafafa;
  }

  &:active {
    background: #f8f8f8;
  }

  &:disabled {
    color: #a8aaaf;
    background: #e8e8e8;
    cursor: default;
  }
`;
