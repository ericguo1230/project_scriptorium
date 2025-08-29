import CommentListItem from "./CommentListItem";

import { components } from "@/clients/api/v1";
type Comment = components["schemas"]["BlogComment"];

export default function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4 my-5">
      {comments.map((comment) => (
        <CommentListItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
