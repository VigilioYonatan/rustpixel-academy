//! S09 — In-memory idempotency exercise.
//! This is NOT a distributed exactly-once guarantee: a durable transactional store is needed
//! before this can be used for payment processing across crashes or multiple processes.
use std::collections::HashMap;

#[derive(Debug, PartialEq, Eq)]
pub enum ApplyError {
    EmptyKey,
    Conflict,
    Overflow,
}

#[derive(Clone, Debug)]
struct Applied {
    requested_cents: u64,
    balance_after: u64,
}

#[derive(Default, Debug)]
pub struct Ledger {
    balance: u64,
    seen: HashMap<String, Applied>,
}

impl Ledger {
    /// A duplicate request returns the ORIGINAL result, not the current balance.
    /// A key with a different amount is rejected without changing state.
    pub fn apply(&mut self, key: &str, cents: u64) -> Result<u64, ApplyError> {
        if key.is_empty() {
            return Err(ApplyError::EmptyKey);
        }
        if let Some(previous) = self.seen.get(key) {
            return if previous.requested_cents == cents {
                Ok(previous.balance_after)
            } else {
                Err(ApplyError::Conflict)
            };
        }
        let new_balance = self
            .balance
            .checked_add(cents)
            .ok_or(ApplyError::Overflow)?;
        self.seen.insert(
            key.to_owned(),
            Applied {
                requested_cents: cents,
                balance_after: new_balance,
            },
        );
        self.balance = new_balance;
        Ok(new_balance)
    }

    pub fn balance(&self) -> u64 {
        self.balance
    }

    pub fn distinct_events(&self) -> usize {
        self.seen.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Arc, Mutex};
    use std::thread;

    #[test]
    fn replay_returns_original_response_even_after_another_event() {
        let mut ledger = Ledger::default();
        assert_eq!(ledger.apply("first", 50), Ok(50));
        assert_eq!(ledger.apply("other", 70), Ok(120));
        assert_eq!(ledger.apply("first", 50), Ok(50));
        assert_eq!(ledger.balance(), 120);
        assert_eq!(ledger.distinct_events(), 2);
        assert_eq!(ledger.apply("first", 99), Err(ApplyError::Conflict));
    }

    #[test]
    fn failed_overflow_does_not_register_key() {
        let mut ledger = Ledger::default();
        assert_eq!(ledger.apply("max", u64::MAX), Ok(u64::MAX));
        assert_eq!(ledger.apply("too-big", 1), Err(ApplyError::Overflow));
        assert_eq!(ledger.apply("too-big", 0), Ok(u64::MAX));
        assert_eq!(ledger.distinct_events(), 2);
    }

    #[test]
    fn invalid_key_has_no_side_effects() {
        let mut ledger = Ledger::default();
        assert_eq!(ledger.apply("", 50), Err(ApplyError::EmptyKey));
        assert_eq!(ledger.balance(), 0);
        assert_eq!(ledger.distinct_events(), 0);
    }

    #[test]
    fn concurrent_replays_have_only_one_effect_when_atomic_lock_is_shared() {
        let ledger = Arc::new(Mutex::new(Ledger::default()));
        let handles: Vec<_> = (0..16)
            .map(|_| {
                let ledger = Arc::clone(&ledger);
                thread::spawn(move || ledger.lock().unwrap().apply("event-1", 10))
            })
            .collect();
        for handle in handles {
            assert_eq!(handle.join().unwrap(), Ok(10));
        }
        let ledger = ledger.lock().unwrap();
        assert_eq!(ledger.balance(), 10);
        assert_eq!(ledger.distinct_events(), 1);
    }
}
