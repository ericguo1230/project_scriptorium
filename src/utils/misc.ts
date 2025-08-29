export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function timeToRead(text: string, wordsPerMinute: number = 200): number {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: text must be a non-empty string.");
  }

  const words = text.trim().split(/\s+/).length;
  const minutes = words / wordsPerMinute;

  return Math.ceil(minutes);
}
