from threading import Lock
from time import monotonic


class SnapshotCache:
    """One shared snapshot per process, with serialized refresh and invalidation."""

    def __init__(self, ttl):
        self.ttl = ttl
        self.lock = Lock()
        self.expires = 0
        self.value = None

    def get(self, load):
        with self.lock:
            if monotonic() >= self.expires:
                self.value = load()
                self.expires = monotonic() + self.ttl
            return self.value

    def invalidate(self):
        with self.lock:
            self.expires = 0
