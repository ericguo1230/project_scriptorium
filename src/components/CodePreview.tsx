function CodePreview() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="bg-neutral rounded-xl p-8 max-w-4xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <pre className="text-gray-300 font-mono text-sm">
            <code className="text-wrap">{`// Welcome to Scriptorium
function hello() {
    console.log("Start coding in your sanctuary");
}

// Execute your code
hello();

// Output:
// Start coding in your sanctuary`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CodePreview;
