"use client";
import { components } from "@/clients/api/v1";
import Image from "next/image";
import { useMemo, useRef } from "react";
import RateButton from "./RateButton";
import { useSession } from "@/context/sessionProvider";
import { deleteComment, rateComment } from "@/actions/commentActions";
import { toast } from "react-toastify";
import {
  EllipsisHorizontalIcon,
  ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/solid";
import DeleteConfirmation from "./DeleteConfirmation";
import Link from "next/link";
import CommentEditModal from "./CommentEditModal";
import ReportModal from "./ReportModal";

type Comment = components["schemas"]["BlogComment"];

export default function CommentListItem({
  comment,
  showReply = true,
}: {
  comment: Comment;
  showReply?: boolean;
}) {
  const session = useSession();
  const deleteConfirmationRef = useRef<HTMLDialogElement>(null);
  const editCommentRef = useRef<HTMLDialogElement>(null);
  const reportRef = useRef<HTMLDialogElement>(null);

  const onUpvote = async () => {
    if (!session?.session) {
      toast.error("Please login to upvote");
      return;
    }

    try {
      await rateComment(comment.blogPostId, comment.id, "+1");
    } catch {
      toast.error("Please login to upvote");
    }
  };

  const onDownvote = async () => {
    if (!session?.session) {
      toast.error("Please login to downvote");
      return;
    }

    try {
      await rateComment(comment.blogPostId, comment.id, "-1");
    } catch {
      toast.error("Please login to downvote");
    }
  };

  const formattedDate = useMemo(() => {
    return new Date(comment.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }, [comment.createdAt]);

  const authorName = useMemo(() => {
    return comment.user.firstName + " " + comment.user.lastName;
  }, [comment.user.firstName, comment.user.lastName]);

  return (
    <div
      key={comment.id}
      className="card flex gap-4 hover:bg-base-200 rounded-lg transition-colors"
    >
      <div className="card-body p-2">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-start space-x-2">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full">
                  <Image
                    src={comment.user.avatar}
                    alt={comment.userId.toString()}
                    width={100}
                    height={100}
                  />
                </div>
              </div>

              <span className="font-medium">{authorName}</span>
              <span className="text-sm text-base-content/60">
                {formattedDate}
              </span>
            </div>

            <div className={`dropdown dropdown-end ${session.session ? "" : "hidden"}`}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-circle btn-ghost btn-sm"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-300 rounded-box z-[1] w-52 p-2 shadow"
              >
                {session.session && (
                  <li>
                    <button onClick={() => reportRef.current?.showModal()}>
                      Report
                    </button>
                  </li>
                )}
                {session.session?.id.toString() ===
                  comment.userId.toString() && (
                  <>
                    <li>
                      <button
                        onClick={() => editCommentRef.current?.showModal()}
                      >
                        Edit
                      </button>
                    </li>
                    <li>
                      <button
                        className="hover:text-error"
                        onClick={() =>
                          deleteConfirmationRef.current?.showModal()
                        }
                      >
                        Delete
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <p className="text-base-content">{comment.content}</p>
        </div>

        <div className="flex justify-between">
          <RateButton
            onUpvote={onUpvote}
            onDownvote={onDownvote}
            rating={comment.netRating.toString()}
          />

          {comment.parentId === null && showReply && (
            <Link href={`/blogs/${comment.blogPostId}/comments/${comment.id}`}>
              <button className="btn btn-sm btn-ghost">
                <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                <span>{comment._count.replies}</span>
              </button>
            </Link>
          )}
        </div>

        <ReportModal
          ref={reportRef}
          commentId={comment.id}
          blogPostId={comment.blogPostId}
          onSaved={() => {
            reportRef.current?.close();
          }}
        />
        <CommentEditModal
          ref={editCommentRef}
          comment={comment}
          onSaved={() => {
            editCommentRef.current?.close();
          }}
        />
        <DeleteConfirmation
          message="Are you sure you want to delete this comment?"
          ref={deleteConfirmationRef}
          onConfirm={async () => {
            const response = await deleteComment(
              comment.blogPostId,
              comment.id
            );

            if (response.type === "error") {
              toast.error("Failed to delete comment");
            } else {
              toast.success("Comment deleted");
            }
          }}
        />
      </div>
    </div>
  );
}
