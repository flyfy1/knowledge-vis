from collections import OrderedDict


class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.items = {}  # key -> (value, frequency)
        self.buckets = {}  # frequency -> oldest-to-newest keys
        self.min_freq = 0

    def _touch(self, key: int) -> None:
        value, freq = self.items[key]
        bucket = self.buckets[freq]
        del bucket[key]
        if not bucket:
            del self.buckets[freq]
            if self.min_freq == freq:
                self.min_freq = freq + 1
        self.items[key] = (value, freq + 1)
        self.buckets.setdefault(freq + 1, OrderedDict())[key] = None

    def get(self, key: int) -> int:
        if key not in self.items:
            return -1
        self._touch(key)
        return self.items[key][0]

    def put(self, key: int, value: int) -> None:
        if self.capacity <= 0:
            return
        if key in self.items:
            _, freq = self.items[key]
            self.items[key] = (value, freq)
            self._touch(key)
            return
        if len(self.items) == self.capacity:
            bucket = self.buckets[self.min_freq]
            victim, _ = bucket.popitem(last=False)
            del self.items[victim]
            if not bucket:
                del self.buckets[self.min_freq]
        self.items[key] = (value, 1)
        self.buckets.setdefault(1, OrderedDict())[key] = None
        self.min_freq = 1
