from typing import Optional

# ListNode is provided by LeetCode.

class Solution:
    def reverseKGroup(self, head: Optional["ListNode"], k: int) -> Optional["ListNode"]:
        dummy = ListNode(0, head)
        group_prev = dummy
        while True:
            kth = group_prev
            for _ in range(k):
                kth = kth.next
                if kth is None:
                    return dummy.next
            group_next = kth.next
            prev, curr = group_next, group_prev.next
            while curr is not group_next:
                nxt = curr.next
                curr.next = prev
                prev, curr = curr, nxt
            old_head = group_prev.next
            group_prev.next = kth
            group_prev = old_head
