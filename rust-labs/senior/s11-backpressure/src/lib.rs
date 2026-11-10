//! S11 — Bounded Backpressure and Load Control.
//! Prevents Out-Of-Memory (OOM) by rejecting or blocking admission when bounded capacity is reached.

use std::collections::VecDeque;
use std::sync::{Arc, Condvar, Mutex};

#[derive(Debug, PartialEq, Eq)]
pub enum PushError {
    Full,
    Closed,
    InvalidCapacity,
}

pub struct BoundedQueue<T> {
    queue: VecDeque<T>,
    capacity: usize,
    closed: bool,
    rejected_count: u64,
}

impl<T> BoundedQueue<T> {
    pub fn new(capacity: usize) -> Result<Self, PushError> {
        if capacity == 0 {
            return Err(PushError::InvalidCapacity);
        }
        Ok(Self {
            queue: VecDeque::with_capacity(capacity.min(1024)),
            capacity,
            closed: false,
            rejected_count: 0,
        })
    }

    pub fn push(&mut self, value: T) -> Result<(), PushError> {
        if self.closed {
            self.rejected_count += 1;
            Err(PushError::Closed)
        } else if self.queue.len() >= self.capacity {
            self.rejected_count += 1;
            Err(PushError::Full)
        } else {
            self.queue.push_back(value);
            Ok(())
        }
    }

    pub fn pop(&mut self) -> Option<T> {
        self.queue.pop_front()
    }

    pub fn close(&mut self) {
        self.closed = true;
    }

    pub fn len(&self) -> usize {
        self.queue.len()
    }

    pub fn is_empty(&self) -> bool {
        self.queue.is_empty()
    }

    pub fn is_full(&self) -> bool {
        self.queue.len() >= self.capacity
    }

    pub fn is_closed(&self) -> bool {
        self.closed
    }

    pub fn capacity(&self) -> usize {
        self.capacity
    }

    pub fn rejected_count(&self) -> u64 {
        self.rejected_count
    }

    pub fn drain_all(&mut self) -> Vec<T> {
        self.queue.drain(..).collect()
    }
}

/// Thread-safe synchronized bounded queue with graceful shutdown.
pub struct ConcurrentQueue<T> {
    inner: Mutex<BoundedQueue<T>>,
    not_empty: Condvar,
}

impl<T> ConcurrentQueue<T> {
    pub fn new(capacity: usize) -> Result<Arc<Self>, PushError> {
        Ok(Arc::new(Self {
            inner: Mutex::new(BoundedQueue::new(capacity)?),
            not_empty: Condvar::new(),
        }))
    }

    pub fn try_push(&self, value: T) -> Result<(), PushError> {
        let mut guard = self.inner.lock().unwrap();
        guard.push(value)?;
        self.not_empty.notify_one();
        Ok(())
    }

    pub fn pop(&self) -> Option<T> {
        let mut guard = self.inner.lock().unwrap();
        guard.pop()
    }

    pub fn close(&self) {
        let mut guard = self.inner.lock().unwrap();
        guard.close();
        self.not_empty.notify_all();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn zero_capacity_is_rejected() {
        assert_eq!(
            BoundedQueue::<u8>::new(0).err(),
            Some(PushError::InvalidCapacity)
        );
    }

    #[test]
    fn full_queue_rejects_and_counts_rejections() {
        let mut q = BoundedQueue::new(2).unwrap();
        assert_eq!(q.push(1), Ok(()));
        assert_eq!(q.push(2), Ok(()));
        assert!(q.is_full());

        // Rejection due to capacity
        assert_eq!(q.push(3), Err(PushError::Full));
        assert_eq!(q.rejected_count(), 1);

        // Popping restores capacity
        assert_eq!(q.pop(), Some(1));
        assert!(!q.is_full());
        assert_eq!(q.push(4), Ok(()));
        assert_eq!(q.len(), 2);
    }

    #[test]
    fn closed_queue_rejects_new_work_but_allows_draining() {
        let mut q = BoundedQueue::new(5).unwrap();
        q.push(10).unwrap();
        q.push(20).unwrap();
        q.close();
        assert!(q.is_closed());

        // Pushes are rejected when closed
        assert_eq!(q.push(30), Err(PushError::Closed));

        // Existing items can be drained safely
        let drained = q.drain_all();
        assert_eq!(drained, vec![10, 20]);
        assert!(q.is_empty());
    }

    #[test]
    fn concurrent_queue_coordination() {
        let q = ConcurrentQueue::new(3).unwrap();
        assert_eq!(q.try_push(100), Ok(()));
        assert_eq!(q.try_push(200), Ok(()));
        assert_eq!(q.pop(), Some(100));
        q.close();
        assert_eq!(q.try_push(300), Err(PushError::Closed));
        assert_eq!(q.pop(), Some(200));
        assert_eq!(q.pop(), None);
    }
}
