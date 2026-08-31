import { db } from './index';
import { problems, tags, problemTags, testCases } from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('Checking database problems count...');
  const countRes = await db.select({ id: problems.id }).from(problems);
  
  if (countRes.length > 0) {
    console.log('Problems already seeded. Skipping.');
    return;
  }

  console.log('Seeding coding problems and tags...');

  // 1. Seed Tags
  const tagData = [
    { name: 'Array', slug: 'array' },
    { name: 'Hash Table', slug: 'hash-table' },
    { name: 'Two Pointers', slug: 'two-pointers' },
    { name: 'String', slug: 'string' },
    { name: 'Stack', slug: 'stack' },
    { name: 'Linked List', slug: 'linked-list' },
    { name: 'Binary Search', slug: 'binary-search' },
  ];

  const seededTags: Record<string, number> = {};
  for (const t of tagData) {
    let [tag] = await db.select().from(tags).where(eq(tags.slug, t.slug)).limit(1);
    if (!tag) {
      [tag] = await db.insert(tags).values(t).returning();
    }
    seededTags[t.slug] = tag.id;
  }

  // 2. Seed Problems
  const problemsData = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      description: 'Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.\n\nYou may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in any order.',
      difficulty: 'Easy' as const,
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
      ],
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]'
        }
      ],
      starterCode: {
        javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    \n}`,
        python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass`
      },
      tags: ['array', 'hash-table'],
      testCases: [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
        { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true }
      ]
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: 'Given a string `s` containing just the characters `\'(\'`, `\')\'`, `\'{\'`, `\'}\'`, `\'[\'` and `\']\'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      difficulty: 'Easy' as const,
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of parentheses only \'()[]{}\'.'
      ],
      examples: [
        {
          input: 's = "()"',
          output: 'true'
        },
        {
          input: 's = "()[]{}"',
          output: 'true'
        },
        {
          input: 's = "(]"',
          output: 'false'
        }
      ],
      starterCode: {
        javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    \n}`,
        python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        pass`
      },
      tags: ['string', 'stack'],
      testCases: [
        { input: '"()"', expectedOutput: 'true', isHidden: false },
        { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
        { input: '"(]"', expectedOutput: 'false', isHidden: false },
        { input: '"{[]}"', expectedOutput: 'true', isHidden: true }
      ]
    },
    {
      title: 'Palindrome Number',
      slug: 'palindrome-number',
      description: 'Given an integer `x`, return `true` *if* `x` *is a palindrome, and* `false` *otherwise*.\n\nAn integer is a palindrome when it reads the same backward as forward. For example, `121` is a palindrome while `123` is not.',
      difficulty: 'Easy' as const,
      constraints: [
        '-2^31 <= x <= 2^31 - 1'
      ],
      examples: [
        {
          input: 'x = 121',
          output: 'true',
          explanation: '121 reads as 121 from left to right and from right to left.'
        },
        {
          input: 'x = -121',
          output: 'false',
          explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
        }
      ],
      starterCode: {
        javascript: `/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n    \n}`,
        python: `class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass`
      },
      tags: ['array'],
      testCases: [
        { input: '121', expectedOutput: 'true', isHidden: false },
        { input: '-121', expectedOutput: 'false', isHidden: false },
        { input: '10', expectedOutput: 'false', isHidden: false },
        { input: '0', expectedOutput: 'true', isHidden: true }
      ]
    },
    {
      title: 'Add Two Numbers',
      slug: 'add-two-numbers',
      description: 'You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.',
      difficulty: 'Medium' as const,
      constraints: [
        'The number of nodes in each linked list is in the range [1, 100].',
        '0 <= Node.val <= 9',
        'It is guaranteed that the list represents a number that does not have leading zeros.'
      ],
      examples: [
        {
          input: 'l1 = [2,4,3], l2 = [5,6,4]',
          output: '[7,0,8]',
          explanation: '342 + 465 = 807.'
        },
        {
          input: 'l1 = [0], l2 = [0]',
          output: '[0]'
        }
      ],
      starterCode: {
        javascript: `/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} l1\n * @param {ListNode} l2\n * @return {ListNode}\n */\nfunction addTwoNumbers(l1, l2) {\n    \n}`,
        python: `class Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        pass`
      },
      tags: ['linked-list', 'two-pointers'],
      testCases: [
        { input: '[2,4,3]\n[5,6,4]', expectedOutput: '[7,0,8]', isHidden: false },
        { input: '[0]\n[0]', expectedOutput: '[0]', isHidden: false },
        { input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', expectedOutput: '[8,9,9,9,0,0,0,1]', isHidden: true }
      ]
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      description: 'Given a string `s`, find the length of the **longest substring** without repeating characters.',
      difficulty: 'Medium' as const,
      constraints: [
        '0 <= s.length <= 5 * 10^4',
        's consists of English letters, digits, symbols and spaces.'
      ],
      examples: [
        {
          input: 's = "abcabcbb"',
          output: '3',
          explanation: 'The answer is "abc", with the length of 3.'
        },
        {
          input: 's = "bbbbb"',
          output: '1',
          explanation: 'The answer is "b", with the length of 1.'
        }
      ],
      starterCode: {
        javascript: `/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n    \n}`,
        python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass`
      },
      tags: ['hash-table', 'string', 'two-pointers'],
      testCases: [
        { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
        { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
        { input: '"pwwkew"', expectedOutput: '3', isHidden: false },
        { input: '""', expectedOutput: '0', isHidden: true }
      ]
    },
    {
      title: 'Median of Two Sorted Arrays',
      slug: 'median-of-two-sorted-arrays',
      description: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return **the median** of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.',
      difficulty: 'Hard' as const,
      constraints: [
        'nums1.length == m',
        'nums2.length == n',
        '0 <= m <= 1000',
        '0 <= n <= 1000',
        '1 <= m + n <= 2000',
        '-10^6 <= nums1[i], nums2[i] <= 10^6'
      ],
      examples: [
        {
          input: 'nums1 = [1,3], nums2 = [2]',
          output: '2.00000',
          explanation: 'merged array = [1,2,3] and median is 2.'
        },
        {
          input: 'nums1 = [1,2], nums2 = [3,4]',
          output: '2.50000',
          explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.'
        }
      ],
      starterCode: {
        javascript: `/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nfunction findMedianSortedArrays(nums1, nums2) {\n    \n}`,
        python: `class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        pass`
      },
      tags: ['array', 'binary-search'],
      testCases: [
        { input: '[1,3]\n[2]', expectedOutput: '2', isHidden: false },
        { input: '[1,2]\n[3,4]', expectedOutput: '2.5', isHidden: false },
        { input: '[]\n[1]', expectedOutput: '1', isHidden: true }
      ]
    }
  ];

  for (const p of problemsData) {
    const [prob] = await db
      .insert(problems)
      .values({
        title: p.title,
        slug: p.slug,
        description: p.description,
        difficulty: p.difficulty,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
      })
      .returning();

    // Map tags
    for (const tagSlug of p.tags) {
      const tagId = seededTags[tagSlug];
      if (tagId) {
        await db.insert(problemTags).values({
          problemId: prob.id,
          tagId,
        });
      }
    }

    // Map test cases
    for (const tc of p.testCases) {
      await db.insert(testCases).values({
        problemId: prob.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      });
    }
  }

  console.log('✅ Seed complete. 6 problems seeded successfully.');
}
