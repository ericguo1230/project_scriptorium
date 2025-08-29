"use client";

import { createCommentReply } from "@/actions/commentActions";
import { Status } from "@/app/actions";
import { useSession } from "@/context/sessionProvider";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

export default function CommentReplyCreate({ postId, parentId }: { postId: string, parentId: string }) {
  const { session } = useSession();

  const initialState = { type: 'default' } as Status;
  const [state, formAction] = useFormState(createCommentReply, initialState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.type === 'success') {
     toast.success("Comment posted");
     ref.current?.reset();
    } else if (state.type === 'error') {
     toast.error("Failed to post comment");
    }
  
    state.type = initialState.type;
   }, [initialState.type, state]);
   
  if (!session) {
    return (
      <p className="text-center text-base-content">
        Please log in to post a comment reply
      </p>
    );
  }

  return (
    <>
      <form action={formAction} ref={ref}>
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="parentId" value={parentId} />
        <textarea
          name="comment"
          className="textarea textarea-bordered w-full"
          placeholder="Add to the discussion"
          required
        ></textarea>
        <div className="flex justify-end mt-2">
          <button className="btn btn-primary" type="submit">Post Comment Reply</button>
        </div>
      </form>
    </>
  );
}
