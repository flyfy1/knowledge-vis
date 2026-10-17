from heapq import heapify, heappop, heappush
from typing import List, Optional

# ListNode is provided by LeetCode.

class Solution:
    def mergeKLists(self, lists: List[Optional["ListNode"]]) -> Optional["ListNode"]:
        heap = [(node.val, source, node) for source, node in enumerate(lists) if node]
        heapify(heap)
        dummy = tail = ListNode(0)
        while heap:
            _, source, node = heappop(heap)
            tail.next = node
            tail = node
            if node.next:
                heappush(heap, (node.next.val, source, node.next))
        if tail:
            tail.next = None
        return dummy.next
