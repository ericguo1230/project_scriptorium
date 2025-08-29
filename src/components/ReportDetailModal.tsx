import { modifyReportStatus } from "@/actions/reportActions";
import { Status } from "@/app/actions";
import { components } from "@/clients/api/v1";
import Link from "next/link";
import { forwardRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { LinkIcon } from "@heroicons/react/24/solid";

type Report = components["schemas"]["Report"];
interface ReportDetailModalProps {
  report: Report;
  onClose?: () => void;
}

const ReportDetailModal = forwardRef<HTMLDialogElement, ReportDetailModalProps>(
  (props, ref) => {
    const initialState = { type: "default" } as Status;
    const [closeFormState, closeReport] = useFormState<Status, FormData>(
      modifyReportStatus,
      initialState
    );
    const [approveFormState, approveReport] = useFormState<Status, FormData>(
      modifyReportStatus,
      initialState
    );

    useEffect(() => {
      if (closeFormState.type === "success") {
        toast.success("Report closed");
        props.onClose?.();
      } else if (closeFormState.type === "error") {
        toast.error("Failed to close report");
      }
    }, [closeFormState.type, props]);

    useEffect(() => {
      if (approveFormState.type === "success") {
        toast.success("Report approved");
        props.onClose?.();
      } else if (approveFormState.type === "error") {
        toast.error("Failed to approve report");
      }
    }, [approveFormState.type, props]);

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

          <textarea
            className="textarea textarea-bordered w-full"
            value={props.report.explanation}
            readOnly
          ></textarea>
          { props.report.blogPostId && (
            <Link href={`/blogs/${props.report.blogPostId}`} className="btn btn-ghost">
              <LinkIcon className="w-5 h-5" />
              View blog post
            </Link>
          )}

          { props.report.commentId && (
            <Link href={`/blogs/${props.report.blogPostId}/comments/${props.report.commentId}`} className="btn btn-ghost">
              <LinkIcon className="w-5 h-5" />
              View comment
            </Link>
          )}

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-ghost">Cancel</button>
            </form>
            <form action={closeReport}>
              <input type="hidden" name="status" value="close" />
              <input type="hidden" name="reportId" value={props.report.id} />

              <div
                className={props.report.status === "closed" ? "tooltip" : ""}
                data-tip="Already closed"
              >
                <button
                  className="btn"
                  type="submit"
                  disabled={props.report.status === "closed"}
                >
                  Close Case
                </button>
              </div>
            </form>
            <form action={approveReport}>
              <input type="hidden" name="status" value="approve" />
              <input type="hidden" name="reportId" value={props.report.id} />

              <div
                className={props.report.status === "closed" ? "tooltip" : ""}
                data-tip="Already closed"
              >
                <button
                  className={`btn btn-success `}
                  type="submit"
                  disabled={props.report.status === "closed"}
                >
                  Approve Case
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    );
  }
);

ReportDetailModal.displayName = "ReportDetailModal";
export default ReportDetailModal;
