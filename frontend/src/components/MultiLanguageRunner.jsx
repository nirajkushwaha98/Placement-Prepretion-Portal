import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { codingService } from '../api/services';
import Badge from './Badge';
import {
  Play,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Check,
  Terminal,
  Cpu,
  Zap,
  Code2,
  FileCode,
  Layers,
  ArrowRightLeft,
  Wrench,
  Gauge,
  HelpCircle,
  Maximize2,
  Minimize2,
  Settings,
  Eye,
  Sliders,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FolderCode
} from 'lucide-react';

export const SUPPORTED_LANGUAGES = {
  python: {
    id: 'python',
    label: 'Python 3',
    version: '3.11 / 3.8.1',
    monaco: 'python',
    extension: 'py',
    icon: '🐍',
    badgeColor: 'from-blue-600 to-yellow-500',
    defaultCode: `# Python 3.x - Multi-Language Code Sandbox
import sys

def main():
    # Read input from stdin if provided
    raw_input = sys.stdin.read().strip()
    if raw_input:
        print(f"📥 Received Input: {raw_input}")
    
    print("🚀 Hello, World from Python 3!")
    
    # Sample calculation: Fibonacci numbers
    def fibonacci(n):
        a, b = 0, 1
        series = []
        for _ in range(n):
            series.append(a)
            a, b = b, a + b
        return series

    print(f"✨ Fibonacci sequence (first 10): {fibonacci(10)}")

if __name__ == '__main__':
    main()
`,
    snippets: {
      'Hello World': `print("Hello, World!")`,
      'Stdin Reader': `import sys\n\nfor line in sys.stdin:\n    print("Line:", line.strip())`,
      'Two Sum': `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nprint("Two Sum Result:", two_sum([2, 7, 11, 15], 9))`,
      'Binary Search': `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\narr = [1, 3, 5, 7, 9, 11, 13, 15]\nprint("Found at index:", binary_search(arr, 7))`,
      'Quick Sort': `def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n\nprint("Sorted:", quicksort([64, 25, 12, 22, 11]))`
    }
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript (Node.js)',
    version: 'Node.js 18.x / 14.x',
    monaco: 'javascript',
    extension: 'js',
    icon: '📜',
    badgeColor: 'from-amber-400 to-yellow-600',
    defaultCode: `// JavaScript (Node.js) - Sandbox Runner
const readline = require('readline');

console.log("🚀 Hello, World from JavaScript Node.js!");

// Sample Algorithm: Array Operations & Higher-Order Functions
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evensSquared = numbers
  .filter(n => n % 2 === 0)
  .map(n => n ** 2);

console.log("Original Numbers:", numbers);
console.log("Even Numbers Squared:", evensSquared);

// Object demo
const developer = {
  name: "Candidate",
  skills: ["DSA", "React", "Node.js", "Python"],
  readyForPlacement: true
};

console.log("Developer Profile:", JSON.stringify(developer, null, 2));
`,
    snippets: {
      'Hello World': `console.log("Hello, World!");`,
      'Stdin Reader': `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log("Input received:", input);`,
      'Two Sum': `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
      'Async / Promises': `async function fetchMockData() {\n  return new Promise(resolve => setTimeout(() => resolve({ status: "OK", score: 98 }), 100));\n}\n\nfetchMockData().then(res => console.log("Promise Resolved:", res));`
    }
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    version: 'TypeScript 5.x',
    monaco: 'typescript',
    extension: 'ts',
    icon: '🟦',
    badgeColor: 'from-blue-600 to-cyan-500',
    defaultCode: `// TypeScript Playground Sandbox
interface Student {
  id: number;
  name: string;
  targetCompany: string;
  solvedProblems: number;
}

const candidate: Student = {
  id: 101,
  name: "Niraj",
  targetCompany: "Google / Microsoft",
  solvedProblems: 150
};

function evaluateCandidate(student: Student): string {
  if (student.solvedProblems >= 100) {
    return \`🎉 \${student.name} is placement-ready for \${student.targetCompany}!\`;
  }
  return \`Keep solving more DSA challenges, \${student.name}!\`;
}

console.log(evaluateCandidate(candidate));
`,
    snippets: {
      'Interface & Generics': `interface Stack<T> {\n  push(item: T): void;\n  pop(): T | undefined;\n  peek(): T | undefined;\n}\n\nclass CustomStack<T> implements Stack<T> {\n  private items: T[] = [];\n  push(item: T) { this.items.push(item); }\n  pop() { return this.items.pop(); }\n  peek() { return this.items[this.items.length - 1]; }\n}\n\nconst s = new CustomStack<number>();\ns.push(10); s.push(20);\nconsole.log("Top:", s.peek());`
    }
  },
  cpp: {
    id: 'cpp',
    label: 'C++ (GCC 9.2 / C++17)',
    version: 'GCC 9.2.0 (C++17)',
    monaco: 'cpp',
    extension: 'cpp',
    icon: '⚡',
    badgeColor: 'from-blue-500 to-indigo-700',
    defaultCode: `// C++ (GCC 9.2 / C++17) Sandbox
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cout << "🚀 Hello, World from C++17!" << endl;

    vector<int> nums = {45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 9};
    cout << "Unsorted array: ";
    for (int x : nums) cout << x << " ";
    cout << "\\n";

    sort(nums.begin(), nums.end());

    cout << "Sorted array:   ";
    for (int x : nums) cout << x << " ";
    cout << "\\n";

    return 0;
}
`,
    snippets: {
      'Hello World': `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
      'Stdin Reader': `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string line;\n    while (getline(cin, line)) {\n        cout << "Read: " << line << endl;\n    }\n    return 0;\n}`,
      'Two Sum (Hash Map)': `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); i++) {\n        int comp = target - nums[i];\n        if (mp.count(comp)) return {mp[comp], i};\n        mp[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    auto res = twoSum(nums, 9);\n    cout << "[" << res[0] << ", " << res[1] << "]" << endl;\n    return 0;\n}`
    }
  },
  c: {
    id: 'c',
    label: 'C (GCC 9.2)',
    version: 'GCC 9.2.0 (C11)',
    monaco: 'c',
    extension: 'c',
    icon: '⚙️',
    badgeColor: 'from-slate-500 to-slate-700',
    defaultCode: `/* C Programming Sandbox (GCC 9.2) */
#include <stdio.h>
#include <stdlib.h>

void print_array(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
}

int main() {
    printf("🚀 Hello, World from C (GCC)!\\n");

    int numbers[] = {10, 20, 30, 40, 50};
    int n = sizeof(numbers) / sizeof(numbers[0]);

    printf("Array elements: ");
    print_array(numbers, n);

    return 0;
}
`,
    snippets: {
      'Hello World': `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
      'Pointers & Memory': `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *ptr = (int*)malloc(sizeof(int) * 5);\n    for(int i = 0; i < 5; i++) ptr[i] = (i + 1) * 10;\n    for(int i = 0; i < 5; i++) printf("%d ", ptr[i]);\n    free(ptr);\n    return 0;\n}`
    }
  },
  java: {
    id: 'java',
    label: 'Java (OpenJDK 13 / 17)',
    version: 'OpenJDK 13.0.1',
    monaco: 'java',
    extension: 'java',
    icon: '☕',
    badgeColor: 'from-red-600 to-amber-700',
    defaultCode: `// Java Sandbox Runner
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 Hello, World from Java (OpenJDK)!");

        // Collections & Stream API Demo
        List<String> companies = Arrays.asList("Google", "Microsoft", "Amazon", "Apple", "Meta");
        System.out.println("Top Tech Companies:");
        companies.stream()
                 .map(String::toUpperCase)
                 .forEach(c -> System.out.println("  ⭐ " + c));

        // Quick Math
        int sum = 0;
        for (int i = 1; i <= 100; i++) sum += i;
        System.out.println("Sum of 1 to 100 = " + sum);
    }
}
`,
    snippets: {
      'Hello World': `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
      'Stdin Reader': `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        while (sc.hasNextLine()) {\n            System.out.println("Line: " + sc.nextLine());\n        }\n    }\n}`,
      'Two Sum': `import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n    public static void main(String[] args) {\n        int[] res = twoSum(new int[]{2, 7, 11, 15}, 9);\n        System.out.println(Arrays.toString(res));\n    }\n}`
    }
  },
  csharp: {
    id: 'csharp',
    label: 'C# (.NET / Mono)',
    version: 'Mono 6.6 / .NET 7',
    monaco: 'csharp',
    extension: 'cs',
    icon: '🟣',
    badgeColor: 'from-purple-600 to-indigo-800',
    defaultCode: `// C# (.NET / Mono) Sandbox
using System;
using System.Collections.Generic;
using System.Linq;

public class Program {
    public static void Main() {
        Console.WriteLine("🚀 Hello, World from C# .NET!");

        var numbers = new List<int> { 5, 12, 8, 20, 15, 30 };
        var query = numbers.Where(n => n > 10).OrderBy(n => n);

        Console.WriteLine("Numbers > 10 in sorted order:");
        foreach (var n in query) {
            Console.WriteLine($" -> {n}");
        }
    }
}
`,
    snippets: {
      'Hello World': `using System;\n\npublic class Program {\n    public static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`
    }
  },
  go: {
    id: 'go',
    label: 'Go (Golang)',
    version: 'Go 1.13 / 1.20',
    monaco: 'go',
    extension: 'go',
    icon: '🐹',
    badgeColor: 'from-cyan-500 to-blue-600',
    defaultCode: `// Go (Golang) Sandbox
package main

import (
	"fmt"
	"sort"
)

func main() {
	fmt.Println("🚀 Hello, World from Go!")

	scores := []int{88, 95, 72, 64, 100, 91}
	sort.Ints(scores)

	fmt.Println("Sorted Scores:", scores)
	fmt.Printf("Top Score: %d\\n", scores[len(scores)-1])
}
`,
    snippets: {
      'Hello World': `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}`,
      'Goroutines & Channels': `package main\n\nimport "fmt"\n\nfunc worker(ch chan string) {\n\tch <- "Work complete from Goroutine!"\n}\n\nfunc main() {\n\tch := make(chan string)\n\tgo worker(ch)\n\tfmt.Println(<-ch)\n}`
    }
  },
  rust: {
    id: 'rust',
    label: 'Rust',
    version: 'Rust 1.40 / 1.70',
    monaco: 'rust',
    extension: 'rs',
    icon: '🦀',
    badgeColor: 'from-amber-700 to-orange-900',
    defaultCode: `// Rust Sandbox
fn main() {
    println!("🚀 Hello, World from Rust!");

    let mut numbers = vec![42, 13, 7, 99, 24];
    numbers.sort();

    println!("Sorted vector: {:?}", numbers);
    
    let sum: i32 = numbers.iter().sum();
    println!("Sum of elements: {}", sum);
}
`,
    snippets: {
      'Hello World': `fn main() {\n    println!("Hello, World!");\n}`,
      'Pattern Matching': `fn describe_number(n: i32) -> &'static str {\n    match n {\n        0 => "Zero",\n        1..=9 => "Single digit",\n        10..=99 => "Double digit",\n        _ => "Large number",\n    }\n}\n\nfn main() {\n    println!("{}", describe_number(42));\n}`
    }
  },
  php: {
    id: 'php',
    label: 'PHP',
    version: 'PHP 7.4 / 8.2',
    monaco: 'php',
    extension: 'php',
    icon: '🐘',
    badgeColor: 'from-indigo-400 to-purple-600',
    defaultCode: `<?php
// PHP Sandbox
echo "🚀 Hello, World from PHP!\n";

$students = [
    ["name" => "Aarav", "marks" => 92],
    ["name" => "Diya", "marks" => 96],
    ["name" => "Rohan", "marks" => 88],
];

echo "Student Leaderboard:\n";
foreach ($students as $s) {
    echo "  🌟 {$s['name']} - {$s['marks']}%\n";
}
?>
`,
    snippets: {
      'Hello World': `<?php\necho "Hello, World!\\n";\n?>`
    }
  },
  ruby: {
    id: 'ruby',
    label: 'Ruby',
    version: 'Ruby 2.7 / 3.2',
    monaco: 'ruby',
    extension: 'rb',
    icon: '💎',
    badgeColor: 'from-red-500 to-rose-700',
    defaultCode: `# Ruby Sandbox
puts "🚀 Hello, World from Ruby!"

skills = ["Data Structures", "Algorithms", "System Design", "Databases"]

puts "Candidate Preparation Plan:"
skills.each_with_index do |skill, index|
  puts "  #{index + 1}. #{skill}"
end

# Enumerable magic
numbers = (1..10).to_a
evens = numbers.select(&:even?)
puts "Even numbers: #{evens.inspect}"
`,
    snippets: {
      'Hello World': `puts "Hello, World!"`
    }
  },
  kotlin: {
    id: 'kotlin',
    label: 'Kotlin',
    version: 'Kotlin 1.3 / 1.8',
    monaco: 'kotlin',
    extension: 'kt',
    icon: '🎯',
    badgeColor: 'from-purple-500 to-pink-500',
    defaultCode: `// Kotlin Sandbox
fun main() {
    println("🚀 Hello, World from Kotlin!")

    val languages = listOf("Kotlin", "Java", "Python", "Rust", "Go")
    val upperLanguages = languages.map { it.uppercase() }

    println("Languages: $upperLanguages")

    // Data Class Demo
    data class Problem(val id: Int, val title: String, val difficulty: String)
    val p = Problem(1, "Two Sum", "EASY")
    println("Problem Card: $p")
}
`,
    snippets: {
      'Hello World': `fun main() {\n    println("Hello, World!")\n}`
    }
  },
  swift: {
    id: 'swift',
    label: 'Swift',
    version: 'Swift 5.2 / 5.8',
    monaco: 'swift',
    extension: 'swift',
    icon: '🐦',
    badgeColor: 'from-orange-500 to-amber-600',
    defaultCode: `// Swift Sandbox
import Foundation

print("🚀 Hello, World from Swift!")

let numbers = [10, 5, 8, 20, 15]
let sortedNumbers = numbers.sorted()

print("Sorted Array: \\(sortedNumbers)")
print("Maximum Element: \\(sortedNumbers.last ?? 0)")
`,
    snippets: {
      'Hello World': `print("Hello, World!")`
    }
  },
  dart: {
    id: 'dart',
    label: 'Dart',
    version: 'Dart 2.19 / 3.0',
    monaco: 'dart',
    extension: 'dart',
    icon: '🎯',
    badgeColor: 'from-blue-400 to-teal-500',
    defaultCode: `// Dart Sandbox
void main() {
  print("🚀 Hello, World from Dart!");

  final topics = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'DP'];
  print('DSA Placement Syllabus:');
  for (var i = 0; i < topics.length; i++) {
    print(' \${i + 1}. \${topics[i]}');
  }
}
`,
    snippets: {
      'Hello World': `void main() {\n  print("Hello, World!");\n}`
    }
  },
  r: {
    id: 'r',
    label: 'R (Data Science & Stats)',
    version: 'R 4.0.0',
    monaco: 'r',
    extension: 'r',
    icon: '📊',
    badgeColor: 'from-blue-600 to-slate-600',
    defaultCode: `# R Data Analysis Sandbox
cat("🚀 Hello, World from R Language!\n")

scores <- c(78, 85, 92, 88, 76, 95, 89, 90, 84, 98)
cat("Mean Score:", mean(scores), "\n")
cat("Median Score:", median(scores), "\n")
cat("Standard Deviation:", sd(scores), "\n")
cat("Summary Statistics:\n")
print(summary(scores))
`,
    snippets: {
      'Hello World': `cat("Hello, World!\n")`
    }
  },
  scala: {
    id: 'scala',
    label: 'Scala',
    version: 'Scala 2.13.2',
    monaco: 'scala',
    extension: 'scala',
    icon: '🧬',
    badgeColor: 'from-red-600 to-pink-700',
    defaultCode: `// Scala Sandbox
object Main {
  def main(args: Array[String]): Unit = {
    println("🚀 Hello, World from Scala!")
    
    val nums = List(1, 2, 3, 4, 5, 6)
    val evens = nums.filter(_ % 2 == 0).map(_ * 10)
    println(s"Processed List: $evens")
  }
}
`,
    snippets: {
      'Hello World': `object Main {\n  def main(args: Array[String]): Unit = {\n    println("Hello, World!")\n  }\n}`
    }
  },
  bash: {
    id: 'bash',
    label: 'Bash / Shell Script',
    version: 'Bash 5.0',
    monaco: 'shell',
    extension: 'sh',
    icon: '🐚',
    badgeColor: 'from-emerald-600 to-teal-700',
    defaultCode: `#!/bin/bash
# Bash Shell Script Sandbox
echo "🚀 Hello, World from Bash Scripting!"

USER_NAME="Placement Aspirant"
echo "Welcome, $USER_NAME to DSA Practice Portal."

echo "Listing System Metrics:"
echo "Date: $(date)"
echo "Host Architecture: $(uname -m 2>/dev/null || echo 'x86_64')"

for i in {1..5}; do
  echo "  Task Step $i: Verified ✓"
done
`,
    snippets: {
      'Hello World': `#!/bin/bash\necho "Hello, World!"`
    }
  },
  sql: {
    id: 'sql',
    label: 'SQL (SQLite3)',
    version: 'SQLite 3.31',
    monaco: 'sql',
    extension: 'sql',
    icon: '🗄️',
    badgeColor: 'from-cyan-600 to-blue-800',
    defaultCode: `-- SQL / SQLite Sandbox
CREATE TABLE Students (
    id INTEGER PRIMARY KEY,
    name TEXT,
    company TEXT,
    package_lpa REAL,
    skills TEXT
);

INSERT INTO Students VALUES (1, 'Aditya Sharma', 'Google', 32.5, 'C++, DSA, System Design');
INSERT INTO Students VALUES (2, 'Pooja Verma', 'Microsoft', 28.0, 'Java, Spring, DSA');
INSERT INTO Students VALUES (3, 'Niraj Kushwaha', 'Amazon', 30.0, 'Python, React, Django');
INSERT INTO Students VALUES (4, 'Neha Patel', 'Goldman Sachs', 26.0, 'SQL, Python, Stats');

SELECT * FROM Students WHERE package_lpa >= 28.0 ORDER BY package_lpa DESC;
`,
    snippets: {
      'Create & Insert': `CREATE TABLE Employees (id INT, name VARCHAR(50), salary INT);\nINSERT INTO Employees VALUES (1, 'Alice', 95000), (2, 'Bob', 85000);\nSELECT * FROM Employees;`
    }
  },
  html: {
    id: 'html',
    label: 'HTML5 / CSS / JS (Live Web Preview)',
    version: 'HTML5 + CSS3 + ES6',
    monaco: 'html',
    extension: 'html',
    icon: '🌐',
    badgeColor: 'from-orange-500 to-rose-600',
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Live Web Preview</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    h1 {
      margin: 0 0 10px;
      font-size: 24px;
      background: linear-gradient(90deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.5;
    }
    button {
      background: linear-gradient(90deg, #3b82f6, #6366f1);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 15px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }
    .counter {
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Live Web Sandbox</h1>
    <p>Test HTML, CSS animations, and interactive JavaScript with instant live rendering.</p>
    <button id="btnClick">Click Me ✨</button>
    <div class="counter" id="counterText">Clicks: 0</div>
  </div>

  <script>
    let count = 0;
    const btn = document.getElementById('btnClick');
    const txt = document.getElementById('counterText');
    btn.addEventListener('click', () => {
      count++;
      txt.textContent = 'Clicks: ' + count + ' 🎉';
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 150);
    });
  </script>
</body>
</html>
`,
    snippets: {
      'Glassmorphism Card': `<!DOCTYPE html><html><body style="background:#0b0f19;color:white;font-family:sans-serif;padding:30px;"><div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:15px;border:1px solid rgba(255,255,255,0.1);max-width:300px;"><h3>Glass Card</h3><p>Modern UI design mockup.</p></div></body></html>`
    }
  }
};

const MultiLanguageRunner = () => {
  const [selectedLang, setSelectedLang] = useState('python');
  const [code, setCode] = useState(SUPPORTED_LANGUAGES.python.defaultCode);
  const [customInput, setCustomInput] = useState('');
  const [theme, setTheme] = useState('vs-dark'); // vs-dark, light, hc-black
  const [fontSize, setFontSize] = useState(13);
  const [wordWrap, setWordWrap] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('output'); // 'output', 'stdin', 'ai', 'preview'

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // AI assistant state
  const [aiActiveAction, setAiActiveAction] = useState(null); // 'explain', 'debug', 'optimize', 'convert'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [targetConvertLang, setTargetConvertLang] = useState('cpp');

  const editorRef = useRef(null);

  // When language changes, update default code if needed
  const handleLanguageChange = (newLang) => {
    setSelectedLang(newLang);
    const langConfig = SUPPORTED_LANGUAGES[newLang];
    if (langConfig) {
      setCode(langConfig.defaultCode);
      setRunResult(null);
      setAiResponse(null);
      if (newLang === 'html') {
        setActiveBottomTab('preview');
      } else if (activeBottomTab === 'preview') {
        setActiveBottomTab('output');
      }
    }
  };

  const handleSnippetSelect = (snippetCode) => {
    if (snippetCode) {
      setCode(snippetCode);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    if (selectedLang === 'html') {
      setActiveBottomTab('preview');
      setIsRunning(false);
      return;
    }

    setActiveBottomTab('output');
    setRunResult(null);

    try {
      const res = await codingService.runCode({
        code,
        language: selectedLang,
        input: customInput,
        expected_output: ''
      });
      setRunResult(res.data);
    } catch (err) {
      setRunResult({
        success: false,
        status: 'ERROR',
        error: err.response?.data?.error || err.message || 'Execution failed.',
        stdout: '',
        stderr: err.message || 'Network / Compiler failure.',
        time_ms: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const langConfig = SUPPORTED_LANGUAGES[selectedLang] || SUPPORTED_LANGUAGES.python;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution_${selectedLang}.${langConfig.extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetCode = () => {
    const langConfig = SUPPORTED_LANGUAGES[selectedLang];
    if (langConfig) {
      setCode(langConfig.defaultCode);
    }
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to run code
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, selectedLang, customInput]);

  // AI Helper: Explain Code
  const handleAIExplain = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiActiveAction('explain');
    setActiveBottomTab('ai');
    setAiResponse(null);

    try {
      const res = await codingService.explainCode({ code, language: selectedLang });
      setAiResponse({
        type: 'explain',
        content: res.data.explanation
      });
    } catch (err) {
      setAiResponse({
        type: 'explain',
        content: 'Failed to generate AI code explanation. Please check your network connection.'
      });
    } finally {
      setAiLoading(false);
    }
  };

  // AI Helper: Debug & Fix
  const handleAIDebug = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiActiveAction('debug');
    setActiveBottomTab('ai');
    setAiResponse(null);

    try {
      const errMessage = runResult?.error || runResult?.stderr || '';
      const res = await codingService.debugCode({
        code,
        language: selectedLang,
        error: errMessage,
        stdin: customInput
      });
      setAiResponse({
        type: 'debug',
        data: res.data
      });
    } catch (err) {
      setAiResponse({
        type: 'debug',
        data: {
          explanation: 'AI debugger encountered a timeout.',
          root_cause: 'Network issue',
          fixed_code: code
        }
      });
    } finally {
      setAiLoading(false);
    }
  };

  // AI Helper: Optimize Code
  const handleAIOptimize = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiActiveAction('optimize');
    setActiveBottomTab('ai');
    setAiResponse(null);

    try {
      const res = await codingService.optimizeCode({ code, language: selectedLang });
      setAiResponse({
        type: 'optimize',
        data: res.data
      });
    } catch (err) {
      setAiResponse({
        type: 'optimize',
        data: {
          original_complexity: 'Time O(N)',
          optimized_complexity: 'Time O(N)',
          improvements: ['Optimization completed.'],
          optimized_code: code
        }
      });
    } finally {
      setAiLoading(false);
    }
  };

  // AI Helper: Convert Code to another language
  const handleAIConvert = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiActiveAction('convert');
    setActiveBottomTab('ai');
    setAiResponse(null);

    try {
      const res = await codingService.convertCode({
        code,
        sourceLanguage: selectedLang,
        targetLanguage: targetConvertLang
      });
      setAiResponse({
        type: 'convert',
        data: res.data
      });
    } catch (err) {
      setAiResponse({
        type: 'convert',
        data: {
          target_language: targetConvertLang,
          converted_code: `// Failed to convert to ${targetConvertLang}`,
          notes: 'Error contacting AI translation engine.'
        }
      });
    } finally {
      setAiLoading(false);
    }
  };

  const currentLangConfig = SUPPORTED_LANGUAGES[selectedLang] || SUPPORTED_LANGUAGES.python;

  return (
    <div className="flex flex-col space-y-3 animate-fade-in">
      {/* Top Header & Feature Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        {/* Left: Language Selector & Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentLangConfig.icon}</span>
            <div className="relative">
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-xl border border-blue-500/40 bg-slate-950 pl-3 pr-8 py-2 text-xs font-bold text-white shadow-inner focus:border-blue-400 focus:outline-none cursor-pointer appearance-none"
              >
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                    {lang.icon} {lang.label} ({lang.version})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Snippet / Algorithm Templates */}
          {currentLangConfig.snippets && Object.keys(currentLangConfig.snippets).length > 0 && (
            <div className="relative hidden sm:block">
              <select
                onChange={(e) => handleSnippetSelect(currentLangConfig.snippets[e.target.value])}
                defaultValue=""
                className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>
                  📂 Load Algorithm Snippet / Template...
                </option>
                {Object.keys(currentLangConfig.snippets).map((name) => (
                  <option key={name} value={name} className="bg-slate-900 text-white">
                    ⚡ {name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Controls (Theme, Font, Actions, Run) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Size */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFontSize((f) => Math.max(11, f - 1))}
              className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[11px] text-slate-400 font-mono px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(22, f + 1))}
              className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Word Wrap Toggle */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            title={`Toggle Word Wrap (${wordWrap ? 'ON' : 'OFF'})`}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              wordWrap
                ? 'border-blue-500/40 bg-blue-500/20 text-blue-300'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Wrap
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          {/* Download File */}
          <button
            onClick={handleDownloadCode}
            title={`Download .${currentLangConfig.extension} file`}
            className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Reset Template */}
          <button
            onClick={handleResetCode}
            title="Reset to Starter Code"
            className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-white" />
            )}
            <span>{selectedLang === 'html' ? 'Update Live Preview' : 'Run Code (Ctrl+Enter)'}</span>
          </button>
        </div>
      </div>

      {/* AI Superpowers Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-blue-950/20 to-slate-900 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-bold">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>AI Code Assistant:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Explain */}
          <button
            onClick={handleAIExplain}
            disabled={aiLoading}
            className="px-3 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Explain Logic</span>
          </button>

          {/* Debug */}
          <button
            onClick={handleAIDebug}
            disabled={aiLoading}
            className="px-3 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Wrench className="h-3.5 w-3.5 text-rose-400" />
            <span>Debug & Fix Bug</span>
          </button>

          {/* Optimize */}
          <button
            onClick={handleAIOptimize}
            disabled={aiLoading}
            className="px-3 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Optimize Big-O</span>
          </button>

          {/* Convert Language */}
          <div className="flex items-center gap-1">
            <select
              value={targetConvertLang}
              onChange={(e) => setTargetConvertLang(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
            >
              {Object.values(SUPPORTED_LANGUAGES)
                .filter((l) => l.id !== selectedLang && l.id !== 'html')
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    To {l.label}
                  </option>
                ))}
            </select>
            <button
              onClick={handleAIConvert}
              disabled={aiLoading}
              className="px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
              <span>Translate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Split (Editor on Top / Left, Console & Tools on Bottom / Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Code Editor Container */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden min-h-[480px]">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 text-xs font-mono font-semibold text-slate-300">
                main.{currentLangConfig.extension}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              {currentLangConfig.label} Sandbox
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[420px] bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={currentLangConfig.monaco}
              value={code}
              theme={theme}
              onMount={handleEditorDidMount}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: fontSize,
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: wordWrap ? 'on' : 'off',
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
                tabSize: selectedLang === 'python' ? 4 : 2,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </div>

        {/* Right Drawer: Console / Custom Stdin / AI Assistant / HTML Live Preview */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden min-h-[480px]">
          {/* Drawer Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveBottomTab('output')}
                className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeBottomTab === 'output'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Output Console</span>
              </button>

              <button
                onClick={() => setActiveBottomTab('stdin')}
                className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeBottomTab === 'stdin'
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Custom Stdin</span>
                {customInput && <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
              </button>

              {selectedLang === 'html' && (
                <button
                  onClick={() => setActiveBottomTab('preview')}
                  className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeBottomTab === 'preview'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Live Preview</span>
                </button>
              )}

              <button
                onClick={() => setActiveBottomTab('ai')}
                className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeBottomTab === 'ai'
                    ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>AI Insights</span>
                {aiResponse && <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />}
              </button>
            </div>

            {/* Clear Output / Status */}
            {activeBottomTab === 'output' && runResult && (
              <button
                onClick={() => setRunResult(null)}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Drawer Body Content */}
          <div className="p-4 flex-1 overflow-y-auto font-mono text-xs flex flex-col justify-between">
            {/* 1. OUTPUT CONSOLE */}
            {activeBottomTab === 'output' && (
              <div className="space-y-3 flex-1 flex flex-col">
                {runResult ? (
                  <div className="space-y-3 flex-1">
                    {/* Status & Metrics Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            runResult.status === 'ACCEPTED' || runResult.success
                              ? 'EASY'
                              : 'HARD'
                          }
                          size="xs"
                        >
                          {runResult.status || (runResult.success ? 'SUCCESS' : 'ERROR')}
                        </Badge>
                        {runResult.status_description && (
                          <span className="text-[11px] text-slate-400">
                            {runResult.status_description}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        {runResult.time_ms !== undefined && (
                          <span>⏱️ {runResult.time_ms} ms</span>
                        )}
                        {runResult.memory_kb && (
                          <span>💾 {runResult.memory_kb} KB</span>
                        )}
                      </div>
                    </div>

                    {/* Standard Output stdout */}
                    {runResult.stdout && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-sans font-semibold flex items-center justify-between">
                          <span>Standard Output (stdout):</span>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {runResult.stdout}
                        </pre>
                      </div>
                    )}

                    {/* Standard Error / Compilation Errors */}
                    {(runResult.error || runResult.stderr || runResult.compile_output) && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-rose-400 font-sans font-semibold flex items-center justify-between">
                          <span>Error / Stderr:</span>
                          <button
                            onClick={handleAIDebug}
                            className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <Sparkles className="h-3 w-3" /> Auto-Fix with AI
                          </button>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {runResult.compile_output || runResult.stderr || runResult.error}
                        </pre>
                      </div>
                    )}

                    {!runResult.stdout && !runResult.error && !runResult.stderr && (
                      <p className="text-slate-400 text-center py-6">
                        Code executed successfully with no output returned.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-slate-400 space-y-3 font-sans">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-emerald-400 shadow-inner">
                      <Terminal className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-300">Ready to execute code</p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Click <strong>"Run Code"</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px]">Ctrl+Enter</kbd> to compile and run in real-time.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. CUSTOM STDIN TAB */}
            {activeBottomTab === 'stdin' && (
              <div className="space-y-3 flex-1 flex flex-col font-sans">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Standard Input (stdin):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCustomInput('10 20 30 40 50')}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white cursor-pointer"
                    >
                      Sample Array
                    </button>
                    <button
                      onClick={() => setCustomInput('5\n1 2 3 4 5')}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white cursor-pointer"
                    >
                      Multi-line
                    </button>
                    <button
                      onClick={() => setCustomInput('')}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-rose-300 hover:text-rose-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter inputs to pass to your code via stdin (e.g. numbers, strings, test cases)..."
                  className="w-full flex-1 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
                />

                <p className="text-[11px] text-slate-400">
                  Tip: Use <code className="text-blue-300">input()</code> (Python), <code className="text-blue-300">cin</code> (C++), or <code className="text-blue-300">Scanner</code> (Java) to read this data.
                </p>
              </div>
            )}

            {/* 3. HTML LIVE PREVIEW TAB */}
            {activeBottomTab === 'preview' && (
              <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-white">
                <iframe
                  title="Live Preview Sandbox"
                  srcDoc={code}
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full min-h-[380px] border-none"
                />
              </div>
            )}

            {/* 4. AI INSIGHTS & COPILOT TAB */}
            {activeBottomTab === 'ai' && (
              <div className="space-y-4 flex-1 flex flex-col font-sans">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-12 space-y-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                      <Sparkles className="h-4 w-4 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <p className="text-xs font-semibold text-indigo-300">
                      AI is analyzing your code...
                    </p>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-3 flex-1 overflow-y-auto text-xs">
                    {/* Explain Mode */}
                    {aiResponse.type === 'explain' && (
                      <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-indigo-300">
                          <HelpCircle className="h-4 w-4 text-indigo-400" />
                          <span>AI Code Breakdown & Logic Explanation</span>
                        </div>
                        <div className="text-slate-200 leading-relaxed whitespace-pre-line prose-invert max-w-none text-xs">
                          {aiResponse.content}
                        </div>
                      </div>
                    )}

                    {/* Debug Mode */}
                    {aiResponse.type === 'debug' && aiResponse.data && (
                      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-rose-300">
                            <Wrench className="h-4 w-4 text-rose-400" />
                            <span>AI Debugger Diagnostics</span>
                          </div>
                          {aiResponse.data.root_cause && (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                              {aiResponse.data.root_cause}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                          {aiResponse.data.explanation}
                        </p>

                        {aiResponse.data.fixed_code && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                              <span>Corrected Code:</span>
                              <button
                                onClick={() => {
                                  setCode(aiResponse.data.fixed_code);
                                  setActiveBottomTab('output');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow"
                              >
                                <Check className="h-3 w-3" /> Apply Fixed Code to Editor
                              </button>
                            </div>
                            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                              {aiResponse.data.fixed_code}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Optimize Mode */}
                    {aiResponse.type === 'optimize' && aiResponse.data && (
                      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-amber-300">
                          <Zap className="h-4 w-4 text-amber-400" />
                          <span>AI Big-O Performance Optimization</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded bg-slate-950 border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Original:</span>
                            <span className="text-slate-200 font-mono font-bold">
                              {aiResponse.data.original_complexity || 'O(N)'}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">
                            <span className="text-emerald-400 block text-[10px]">Optimized:</span>
                            <span className="text-emerald-300 font-mono font-bold">
                              {aiResponse.data.optimized_complexity || 'O(1)'}
                            </span>
                          </div>
                        </div>

                        {aiResponse.data.improvements && (
                          <ul className="space-y-1 text-slate-300 list-disc list-inside text-xs">
                            {aiResponse.data.improvements.map((imp, idx) => (
                              <li key={idx}>{imp}</li>
                            ))}
                          </ul>
                        )}

                        {aiResponse.data.optimized_code && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                              <span>Optimized Source:</span>
                              <button
                                onClick={() => {
                                  setCode(aiResponse.data.optimized_code);
                                  setActiveBottomTab('output');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow"
                              >
                                <Check className="h-3 w-3" /> Apply Optimized Code
                              </button>
                            </div>
                            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-amber-200 font-mono text-[11px] overflow-x-auto">
                              {aiResponse.data.optimized_code}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Convert Mode */}
                    {aiResponse.type === 'convert' && aiResponse.data && (
                      <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-cyan-300">
                            <ArrowRightLeft className="h-4 w-4 text-cyan-400" />
                            <span>Converted to {aiResponse.data.target_language}</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedLang(targetConvertLang);
                              setCode(aiResponse.data.converted_code);
                              setActiveBottomTab('output');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow"
                          >
                            <Check className="h-3 w-3" /> Load in {aiResponse.data.target_language} Editor
                          </button>
                        </div>

                        {aiResponse.data.notes && (
                          <p className="text-slate-300 text-xs italic">
                            {aiResponse.data.notes}
                          </p>
                        )}

                        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-200 font-mono text-[11px] overflow-x-auto max-h-60">
                          {aiResponse.data.converted_code}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-10 text-center text-slate-400 space-y-2">
                    <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />
                    <p className="text-xs font-semibold text-slate-300">
                      AI Code Assistant
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Click "Explain Logic", "Debug & Fix Bug", "Optimize Big-O", or "Translate" from the top bar for instant AI feedback.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiLanguageRunner;
