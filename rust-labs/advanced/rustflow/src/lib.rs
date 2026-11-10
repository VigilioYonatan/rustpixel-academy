use std::sync::{Arc, Mutex, mpsc};
use std::thread;
pub fn square_parallel(input: Vec<u32>, workers: usize) -> Vec<u32> {
    if input.is_empty() {
        return vec![];
    }
    let workers = workers.max(1);
    let (tx, rx) = mpsc::channel::<(usize, u32)>();
    let shared = Arc::new(Mutex::new(rx));
    let (result_tx, result_rx) = mpsc::channel();
    let handles: Vec<_> = (0..workers)
        .map(|_| {
            let input = Arc::clone(&shared);
            let out = result_tx.clone();
            thread::spawn(move || {
                loop {
                    let item = { input.lock().expect("receiver poisoned").recv() };
                    match item {
                        Ok((index, value)) => {
                            let _ = out.send((index, value.saturating_mul(value)));
                        }
                        Err(_) => break,
                    }
                }
            })
        })
        .collect();
    drop(result_tx);
    for (i, v) in input.iter().copied().enumerate() {
        tx.send((i, v)).expect("workers alive");
    }
    drop(tx);
    let mut result = vec![0; input.len()];
    for (i, v) in result_rx {
        result[i] = v;
    }
    for h in handles {
        h.join().expect("worker panicked");
    }
    result
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn ordering() {
        assert_eq!(square_parallel(vec![2, 3, 4], 2), vec![4, 9, 16]);
    }
    #[test]
    fn empty() {
        assert!(square_parallel(vec![], 0).is_empty());
    }
}
