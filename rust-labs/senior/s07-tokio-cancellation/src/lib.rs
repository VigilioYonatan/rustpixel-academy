//! Laboratorio S07: tareas con propietario, cola acotada y shutdown cooperativo.
//! Requiere Tokio; no supone que `abort` sea equivalente a completar una transacción.
use std::time::Duration;
use tokio::sync::{mpsc, watch};
use tokio::task::JoinHandle;

/// Coordinator owns the worker and both sides of its shutdown contract.
pub struct Worker {
    sender: Option<mpsc::Sender<u64>>,
    cancel: watch::Sender<bool>,
    handle: Option<JoinHandle<u64>>,
}

impl Worker {
    pub fn start(capacity: usize) -> Self {
        assert!(capacity > 0, "worker queue requires positive capacity");
        let (sender, mut receiver) = mpsc::channel::<u64>(capacity);
        let (cancel, mut cancellation) = watch::channel(false);
        let handle = tokio::spawn(async move {
            let mut processed = 0u64;
            loop {
                tokio::select! {
                    biased;
                    changed = cancellation.changed() => {
                        if changed.is_err() || *cancellation.borrow() { break; }
                    },
                    item = receiver.recv() => {
                        match item {
                            Some(value) => processed = processed.saturating_add(value),
                            None => break,
                        }
                    }
                }
            }
            processed
        });
        Self {
            sender: Some(sender),
            cancel,
            handle: Some(handle),
        }
    }

    /// Bounded channel provides backpressure; returns an error after shutdown.
    pub async fn send(&self, value: u64) -> Result<(), mpsc::error::SendError<u64>> {
        match &self.sender {
            Some(sender) => sender.send(value).await,
            None => Err(mpsc::error::SendError(value)),
        }
    }

    /// Requests shutdown and joins the worker within the caller's deadline.
    /// On timeout, the task is aborted as a last resort and joined explicitly.
    pub async fn shutdown(mut self, deadline: Duration) -> Result<u64, &'static str> {
        self.sender.take();
        let _ = self.cancel.send(true);
        let mut handle = self.handle.take().ok_or("worker not started")?;
        match tokio::time::timeout(deadline, &mut handle).await {
            Ok(Ok(result)) => Ok(result),
            Ok(Err(_)) => Err("worker panicked"),
            Err(_) => {
                handle.abort();
                let _ = handle.await;
                Err("shutdown deadline exceeded")
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn shutdown_finishes_within_deadline() {
        let worker = Worker::start(2);
        worker.send(3).await.expect("queue accepts work");
        let processed = worker
            .shutdown(Duration::from_secs(1))
            .await
            .expect("joined");
        assert!(processed <= 3, "cancel may precede processing queued work");
    }

    #[tokio::test]
    async fn bounded_worker_accepts_jobs_and_joins() {
        let worker = Worker::start(1);
        worker.send(1).await.expect("enqueue");
        worker.send(2).await.expect("second enqueue");
        let count = worker
            .shutdown(Duration::from_secs(1))
            .await
            .expect("joined");
        assert!(count <= 3);
    }

    #[tokio::test]
    async fn double_shutdown_requires_owned_handle() {
        let worker = Worker::start(1);
        assert!(worker.shutdown(Duration::from_secs(1)).await.is_ok());
        // Ownership consumes Worker; a second shutdown cannot be called by design.
    }
}
