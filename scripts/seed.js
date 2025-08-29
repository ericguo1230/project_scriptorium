
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

// Defining supported languages based on the provided enum
const LANGUAGES = [
  "c",
  "cpp",
  "javascript",
  "typescript",
  "java",
  "python",
  "go",
  "swift",
  "rust",
  "ruby",
];

async function main() {
  // Template Tags
  const templateTags = [
    "algorithms",
    "data-structures",
    "web-development",
    "machine-learning",
    "database",
    "api",
    "frontend",
    "backend",
    "devops",
    "security",
    "mobile",
    "testing",
    "optimization",
    "design-patterns",
    "authentication",
  ];

  // Blog Post Tags
  const blogPostTags = [
    "tutorial",
    "best-practices",
    "career",
    "programming",
    "technology",
    "cloud",
    "architecture",
    "frameworks",
    "languages",
    "tools",
  ];

  // Create Template Tags
  const createdTemplateTags = await prisma.templateTag.createMany({
    data: templateTags.map((tag) => ({ tag })),
  });
  console.log(`Created ${createdTemplateTags.count} Template Tags`);

  // Create Blog Post Tags
  const createdBlogPostTags = await prisma.blogPostTag.createMany({
    data: blogPostTags.map((tag) => ({ tag })),
  });
  console.log(`Created ${createdBlogPostTags.count} Blog Post Tags`);

  // Create Users
  const users = [];
  for (let i = 1; i <= 35; i++) {
    const user = await prisma.user.create({
      data: {
        firstName: [
          "James",
          "Emma",
          "Liam",
          "Olivia",
          "Noah",
          "Ava",
          "William",
          "Sophia",
        ][Math.floor(Math.random() * 8)],
        lastName: [
          "Smith",
          "Johnson",
          "Williams",
          "Brown",
          "Jones",
          "Garcia",
          "Miller",
          "Davis",
        ][Math.floor(Math.random() * 8)],
        email: `developer${i}@example.com`,
        password: await hash("password123"),
        role: i <= 5 ? "admin" : "user",
        phoneNumber:
          i % 3 === 0
            ? `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(
              Math.floor(Math.random() * 9000) + 1000
            )}`
            : null,
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} Users`);

  // Create Templates
  const templates = [];
  for (let i = 0; i < 40; i++) {
    const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
    const template = await prisma.template.create({
      data: {
        title:
          [
            "Binary Search Implementation",
            "REST API Authentication",
            "React Component Boilerplate",
            "Database Connection Pool",
            "Machine Learning Pipeline",
            "Docker Configuration",
            "GraphQL Schema",
            "Unit Test Setup",
          ][Math.floor(Math.random() * 8)] + ` ${i + 1}`,
        description: [
          "Efficient implementation with O(log n) complexity",
          "Secure authentication flow with JWT",
          "Reusable component with TypeScript",
          "Optimized database connection handling",
          "Data preprocessing and model training pipeline",
          "Production-ready container setup",
          "Type-safe API schema definition",
          "Comprehensive test suite template",
        ][Math.floor(Math.random() * 8)],
        code: getCodeSnippet(language),
        language,
        isForked: i % 5 === 0,
        forkedFromId: i % 5 === 0 && i > 0 ? templates[i - 1].id : null,
        userId: users[Math.floor(Math.random() * users.length)].id,
        tamplateTags: {
          connect: [
            { id: Math.floor(Math.random() * templateTags.length) + 1 },
            { id: Math.floor(Math.random() * templateTags.length) + 1 },
          ],
        },
      },
    });
    templates.push(template);
  }
  console.log(`Created ${templates.length} Templates`);

  // Create Blog Posts
  const blogPosts = [];
  for (let i = 0; i < 35; i++) {
    const blogPost = await prisma.blogPost.create({
      data: {
        title:
          [
            "Getting Started with Microservices",
            "Clean Code Principles",
            "Advanced Git Workflows",
            "Performance Optimization Tips",
            "Security Best Practices",
            "Modern API Design",
            "Cloud Architecture Patterns",
            "Testing Strategies",
          ][Math.floor(Math.random() * 8)] + ` ${i + 1}`,
        description: [
          "A comprehensive guide to building scalable systems",
          "Writing maintainable and efficient code",
          "Professional version control workflows",
          "Improving application performance",
          "Securing your applications effectively",
          "Building robust and scalable APIs",
          "Cloud-native application patterns",
          "Ensuring code quality through testing",
        ][Math.floor(Math.random() * 8)],
        userId: users[Math.floor(Math.random() * users.length)].id,
        isVisible: Math.random() > 0.1,
        tags: {
          connect: [
            { id: Math.floor(Math.random() * blogPostTags.length) + 1 },
            { id: Math.floor(Math.random() * blogPostTags.length) + 1 },
          ],
        },
        links: {
          connect: [
            { id: templates[Math.floor(Math.random() * templates.length)].id },
          ],
        },
      },
    });
    blogPosts.push(blogPost);
  }
  console.log(`Created ${blogPosts.length} Blog Posts`);

  // Create Comments
  const comments = [];
  for (let i = 0; i < 40; i++) {
    const comment = await prisma.comment.create({
      data: {
        content: [
          "Great article! Very informative.",
          "Thanks for sharing this knowledge.",
          "This helped me solve a similar problem.",
          "Could you elaborate more on the implementation?",
          "Interesting approach to this problem.",
          "Well written and easy to follow.",
          "I'll definitely try this out.",
          "Looking forward to more content like this!",
        ][Math.floor(Math.random() * 8)],
        userId: users[Math.floor(Math.random() * users.length)].id,
        blogPostId: blogPosts[Math.floor(Math.random() * blogPosts.length)].id,
        isVisible: Math.random() > 0.05,
      },
    });
    comments.push(comment);
  }
  console.log(`Created ${comments.length} Comments`);

  // Create Reports
  const reports = [];
  for (let i = 0; i < 30; i++) {
    const isCommentReport = Math.random() > 0.5;
    const report = await prisma.report.create({
      data: {
        explanation: [
          "Inappropriate content",
          "Spam or advertising",
          "Incorrect information",
          "Duplicate content",
          "Off-topic discussion",
          "Copyright violation",
          "Harmful content",
          "Other violation",
        ][Math.floor(Math.random() * 8)],
        userId: users[Math.floor(Math.random() * users.length)].id,
        status: ["open", "closed"][Math.floor(Math.random() * 3)],
        ...(isCommentReport
          ? {
            commentId:
              comments[Math.floor(Math.random() * comments.length)].id,
          }
          : {
            blogPostId:
              blogPosts[Math.floor(Math.random() * blogPosts.length)].id,
          }),
      },
    });
    reports.push(report);
  }
  console.log(`Created ${reports.length} Reports`);

  // Create Ratings
  const ratings = [];
  for (let i = 0; i < 35; i++) {
    const isCommentRating = Math.random() > 0.5;
    const userId = users[Math.floor(Math.random() * users.length)].id;
    const ratingValue = ["+1", "-1"][Math.floor(Math.random() * 2)];

    if (isCommentRating) {
      const commentId =
        comments[Math.floor(Math.random() * comments.length)].id;

      // Check if a rating already exists for this user and comment
      const existingRating = await prisma.rating.findFirst({
        where: {
          userId,
          commentId,
        },
      });

      if (!existingRating) {
        // Create a new rating if none exists
        const rating = await prisma.rating.create({
          data: {
            userId,
            rating: ratingValue,
            commentId,
          },
        });
        ratings.push(rating);
      }
    } else {
      const blogPostId =
        blogPosts[Math.floor(Math.random() * blogPosts.length)].id;

      // Check if a rating already exists for this user and blog post
      const existingRating = await prisma.rating.findFirst({
        where: {
          userId,
          blogPostId,
        },
      });

      if (!existingRating) {
        // Create a new rating if none exists
        const rating = await prisma.rating.create({
          data: {
            userId,
            rating: ratingValue,
            blogPostId,
          },
        });
        ratings.push(rating);
      }
    }
  }

  console.log(`Created ${ratings.length} Ratings`);


  // Create Code Executions
  const codeExecutions = [];
  for (let i = 0; i < 35; i++) {
    const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
    const execution = await prisma.codeExecution.create({
      data: {
        language,
        code: getCodeSnippet(language),
        stdin: Math.random() > 0.5 ? "5\n10\n15" : null,
        stdout: "Result: Success",
        stderr: Math.random() > 0.8 ? "Warning: deprecated method used" : null,
        executionTimeMs: Math.floor(Math.random() * 1000),
        exitCode: Math.random() > 0.9 ? 1 : 0,
        status: ["completed", "failed", "pending"][
          Math.floor(Math.random() * 3)
        ],
        userId: users[Math.floor(Math.random() * users.length)].id,
      },
    });
    codeExecutions.push(execution);
  }
  console.log(`Created ${codeExecutions.length} Code Executions`);
}

function getCodeSnippet(language) {
  const snippets = {
    c: `
#include <stdio.h>

int binary_search(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target)
            return mid;
        if (arr[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }
    return -1;
}`,
    cpp: `
template<typename T>
T fibonacci(T n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}`,
    javascript: `
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
    typescript: `
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  async findById(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
}`,
    java: `
public class BubbleSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n-1; i++)
            for (int j = 0; j < n-i-1; j++)
                if (arr[j] > arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
    }
}`,
    python: `
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    go: `
func mergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    mid := len(arr) / 2
    left := mergeSort(arr[:mid])
    right := mergeSort(arr[mid:])
    return merge(left, right)
}`,
    swift: `
struct Stack<Element> {
    private var items: [Element] = []
    
    mutating func push(_ item: Element) {
        items.append(item)
    }
    
    mutating func pop() -> Element? {
        return items.popLast()
    }
}`,
    rust: `
fn quicksort<T: Ord>(arr: &mut [T]) {
    if arr.len() <= 1 {
        return;
    }
    let pivot = arr.len() - 1;
    let mut i = 0;
    for j in 0..pivot {
        if arr[j] <= arr[pivot] {
            arr.swap(i, j);
            i += 1;
        }
    }
    arr.swap(i, pivot);
}`,
    ruby: `
def merge_sort(arr)
  return arr if arr.length <= 1
  
  mid = arr.length / 2
  left = merge_sort(arr[0...mid])
  right = merge_sort(arr[mid..-1])
  
  merge(left, right)
end`,
  };

  return snippets[language] || "console.log('Hello, World!');";
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
