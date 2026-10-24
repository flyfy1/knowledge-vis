class _Entry:
    def __init__(self, key, bucket):
        self.key = key
        self.bucket = bucket
        self.prev = self.next = None


class _Bucket:
    def __init__(self, count):
        self.count = count
        self.prev = self.next = None
        self.first = None

    def add(self, entry):
        entry.bucket = self
        entry.prev = None
        entry.next = self.first
        if self.first is not None:
            self.first.prev = entry
        self.first = entry

    def remove(self, entry):
        if entry.prev is None:
            self.first = entry.next
        else:
            entry.prev.next = entry.next
        if entry.next is not None:
            entry.next.prev = entry.prev
        entry.prev = entry.next = None


class AllOne:
    def __init__(self):
        self.head = _Bucket(0)
        self.tail = _Bucket(0)
        self.head.next = self.tail
        self.tail.prev = self.head
        self.entries = {}

    def _insert_after(self, left, count):
        node = _Bucket(count)
        node.prev, node.next = left, left.next
        left.next.prev = node
        left.next = node
        return node

    def _drop_if_empty(self, bucket):
        if bucket.first is None:
            bucket.prev.next = bucket.next
            bucket.next.prev = bucket.prev

    def inc(self, key: str) -> None:
        if key not in self.entries:
            target = self.head.next
            if target is self.tail or target.count != 1:
                target = self._insert_after(self.head, 1)
            entry = _Entry(key, target)
            self.entries[key] = entry
            target.add(entry)
            return
        entry = self.entries[key]
        old = entry.bucket
        target = old.next
        if target is self.tail or target.count != old.count + 1:
            target = self._insert_after(old, old.count + 1)
        old.remove(entry)
        target.add(entry)
        self._drop_if_empty(old)

    def dec(self, key: str) -> None:
        entry = self.entries[key]
        old = entry.bucket
        if old.count == 1:
            old.remove(entry)
            del self.entries[key]
        else:
            target = old.prev
            if target is self.head or target.count != old.count - 1:
                target = self._insert_after(old.prev, old.count - 1)
            old.remove(entry)
            target.add(entry)
        self._drop_if_empty(old)

    def getMaxKey(self) -> str:
        if self.tail.prev is self.head:
            return ""
        return self.tail.prev.first.key

    def getMinKey(self) -> str:
        if self.head.next is self.tail:
            return ""
        return self.head.next.first.key
