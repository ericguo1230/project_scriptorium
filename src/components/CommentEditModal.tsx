import { updateComment } from "@/actions/commentActions";
import { Status } from "@/app/actions";
import { components } from "@/clients/api/v1";
import { forwardRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

type Comment = components["schemas"]["BlogComment"];

interface CommentEditModalProps {
  comment: Comment;
  onSaved?: () => void;
}

const CommentEditModal = forwardRef<HTMLDialogElement, CommentEditModalProps>(
  (props, ref) => {
    const initialState = { type: "default" } as Status;
    const [formState, formAction] = useFormState<Status, FormData>(
      updateComment,
      initialState
    );

    useEffect(() => {
      if (formState.type === "success") {
        toast.success("Comment updated");
        props.onSaved?.();
      } else if (formState.type === "error") {
        toast.error("Failed to update comment");
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
          <h3 className="font-bold text-lg mb-2">Edit Comment</h3>
          <form action={formAction}>
            <input type="hidden" name="postId" value={props.comment.blogPostId} />
            <input type="hidden" name="commentId" value={props.comment.id} />
            <textarea
              name="comment"
              className="textarea textarea-bordered w-full"
              placeholder="Edit your comment"
              required
            >
              {props.comment.content}
            </textarea>
            <div className="modal-action">
              <button className="btn btn-primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      </dialog>
    );
  }
);

CommentEditModal.displayName = "EditCommentModal";
export default CommentEditModal;
