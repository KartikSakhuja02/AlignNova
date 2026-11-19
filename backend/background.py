"""Bound in-process email work so mail providers cannot exhaust API threads."""
import logging
from queue import Full, Queue
from threading import Lock, Thread


class WorkQueue:
    def __init__(self, name, workers, capacity):
        self.name = name
        self.workers = workers
        self.jobs = Queue(maxsize=capacity)
        self.started = False
        self.lock = Lock()

    def _run(self):
        while True:
            job = self.jobs.get()
            try:
                job()
            except Exception:
                logging.getLogger(__name__).exception("%s job failed", self.name)
            finally:
                self.jobs.task_done()

    def submit(self, job):
        with self.lock:
            if not self.started:
                for index in range(self.workers):
                    Thread(target=self._run, name=f"{self.name}-{index}", daemon=True).start()
                self.started = True
        try:
            self.jobs.put_nowait(job)
        except Full:
            return False
        return True


submit_email = WorkQueue("email", workers=2, capacity=128).submit
submit_broadcast = WorkQueue("broadcast", workers=1, capacity=24).submit
