"use client";

import { reportContent } from "@/actions/reportActions";
import { Status } from "@/app/actions";
import { forwardRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

interface ReportModalProps {
  commentId?: number;
  blogPostId?: number;
  onSaved?: () => void;
}

const ReportModal = forwardRef<HTMLDialogElement, ReportModalProps>(
  (props, ref) => {
    const initialState = { type: "default" } as Status;
    const [formState, formAction] = useFormState<Status, FormData>(
      reportContent,
      initialState
    );

    useEffect(() => {
      if (formState.type === "success") {
        toast.success("Reported successfully");
        props.onSaved?.();
      } else if (formState.type === "error") {
        toast.error(formState.message || "Failed to report");
      }

      formState.type = initialState.type;
    }, [formState.type, initialState.type, formState, props]);

    return (
      <dialog className="modal" ref={ref}>
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-2">Report</h3>
          <form action={formAction}>
            {props.commentId && (
              <input type="hidden" name="commentId" value={props.commentId} />
            )}

            {props.blogPostId && (
              <input type="hidden" name="blogPostId" value={props.blogPostId} />
            )}

            <textarea
              name="explanation"
              className="textarea textarea-bordered w-full"
              placeholder="Enter your explanation"
              required
            ></textarea>
            <div className="modal-action">
              <button className="btn btn-primary" type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </dialog>
    );
  }
);

ReportModal.displayName = "ReportModal";
export default ReportModal;
