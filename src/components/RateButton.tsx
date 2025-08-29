import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

interface RateButtonProps {
  rating: string;
  onUpvote: () => void;
  onDownvote: () => void;
}

export default function RateButton({ rating, onUpvote, onDownvote }: RateButtonProps) {
  return (
    <div className="flex items-center space-x-1">
      <div className="tooltip" data-tip="Upvote">
        <button className="btn btn-ghost" onClick={onUpvote}>
          <ArrowUpIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="font-bold">{rating}</div>
      <div className="tooltip" data-tip="Downvote">
        <button className="btn btn-ghost" onClick={onDownvote}>
          <ArrowDownIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
