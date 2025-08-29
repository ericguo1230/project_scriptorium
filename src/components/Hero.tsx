import Link from "next/link";

const languages = [
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "Ruby",
  "Go",
  "Rust",
  "PHP",
];

function Hero() {
  return (
    <div className="container mx-auto px-4 pt-20 pb-16">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-6xl font-extrabold text-base-content mb-6">
          Write. Execute. Share.
          <span className="text-primary block mt-2">Your Code Sanctuary</span>
        </h1>
        <p className="text-xl text-base-content/80 mb-8">
          A modern scriptorium for the digital age. Create, test, and preserve
          your code in a secure environment designed for developers like you.
        </p>
        <div className="flex justify-center gap-4">
          <Link className="btn btn-primary btn-md" href="/execute">Get Started</Link>
          <Link className="btn btn-ghost btn-md" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Learn More</Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-base-200">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-base-content">
          {languages.map((lang) => (
            <span key={lang} className="px-3 py-1 rounded-full">
              {lang}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero;
