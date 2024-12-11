import { Modal } from "antd";
import React from "react";

function DeleteModal({ name, isOpen, onOk, onClose }) {
  return (
    name && (
      <Modal
        title={`Delete ${name.charAt(0).toUpperCase() + name.slice(1)}`}
        open={isOpen}
        onOk={() => {
          onOk();
          onClose();
        }}
        onCancel={onClose}
        centered
      >
        <p>Are you sure you want to delete this {name.toLowerCase()}?</p>
      </Modal>
    )
  );
}

export default DeleteModal;
