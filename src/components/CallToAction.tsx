import Link from "next/link";

function CallToAction() {
  return (
    <div className="bg-base-200 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold base-content mb-4">
          Ready to Start Your Coding Journey?
        </h2>
        <p className="text-base-content mb-8 max-w-2xl mx-auto">
          Join our community of developers and start creating, sharing, and
          learning today.
        </p>
        <Link className="btn btn-lg glass bg-primary text-primary-content" href="/signup">Create Your Account</Link>
      </div>
    </div>
  );
}

export default CallToAction;
