"use client";

import { forwardRef } from "react";

interface DeleteConfirmationProps {
  message: string;
  onConfirm: () => void;
}

const DeleteConfirmation = forwardRef<HTMLDialogElement, DeleteConfirmationProps>((props, ref) => {
  return (
    <dialog className="modal modal-bottom sm:modal-middle" ref={ref}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm</h3>
        <p className="py-4">
          {props.message}
        </p>
        <div className="modal-action">
          {/* Close button */}
          <form method="dialog">
            <button className="btn btn-ghost">
              Cancel 
            </button>
          </form>

          {/* Confirm button */}
          <button
            type="button"
            className="btn btn-error"
            onClick={props.onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
});

DeleteConfirmation.displayName = "DeleteConfirmation";
export default DeleteConfirmation;
