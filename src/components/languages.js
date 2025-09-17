const languages = [
  {
    id: 71,
    name: "python",
    label: "Python 3",
    icon: "🐍",
    version: "3.11.0",
    color: "from-green-400 to-blue-500",
    template: `def solution():
    """
    Write your solution here
    Time Complexity: O(?)
    Space Complexity: O(?)
    """
    # Your code here
    pass

if __name__ == "__main__":
    result = solution()
    print(result)`
  },
  {
    id: 54,
    name: "cpp",
    label: "C++",
    icon: "⚙️",
    version: "17",
    template: `#include <iostream>
    #include <vector>
    #include <algorithm>
    using namespace std;

    class Solution {
    public:
        // Write your solution here
        // Time Complexity: O(?)
        // Space Complexity: O(?)
        void solve() {
            cout << "Hello World!" << endl;
        }
    };

    int main() {
        Solution sol;
        sol.solve();
        return 0;
    }`
  },
  {
    id: 62,
    name: "java",
    label: "Java",
    icon: "☕",
    version: "11",
    color: "from-orange-400 to-red-500",
    template: `import java.util.*;

    class Solution {
        /**
         * Write your solution here
         * Time Complexity: O(?)
         * Space Complexity: O(?)
         */
        public void solve() {
            System.out.println("Hello World!");
        }
        
        public static void main(String[] args) {
            Solution sol = new Solution();
            sol.solve();
        }
    }`
  },
  {
    id: 63,
    name: "javascript",
    label: "JavaScript",
    icon: "🟨",
    version: "ES6",
    template: `// Write your solution here
    // Time Complexity: O(?)
    // Space Complexity: O(?)
    console.log("Hello World!");`
  }
];

export default languages;