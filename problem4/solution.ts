// Solution 1: the Gauss summation formula
// Time Complexity: O(1) - Constant time
// Space Complexity: O(1) - Constant space
// Best performance with constant time and space, always the most optimized.
function sum_to_n_a(n: number): number {
  return (n * (n + 1)) / 2;
}

// Solution 2: Iterative Approach
// Time Complexity: O(n) - Linear time
// Space Complexity: O(1) - Constant space
// Simple and reliable but grows linearly with input size; still memory-efficient
function sum_to_n_b(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Solution 3: Recursive Approach
// Time Complexity: O(n) - Linear time
// Space Complexity: O(n) - Linear space (due to call stack)
// Elegant but inefficient, incurs both linear time and high memory usage due to call stack.
function sum_to_n_c(n: number): number {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
}