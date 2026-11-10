//! S14 — Deterministic latency and error-rate aggregation.
//! This is a bounded fixture, not an actual telemetry collector or SLO validation.
use std::collections::VecDeque;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Severity {
    Info,
    Warning,
    Error,
}

pub struct LogEvent<'a> {
    pub severity: Severity,
    pub text: &'a str,
}

pub fn error_rate(logs: &[LogEvent<'_>]) -> f64 {
    if logs.is_empty() {
        return 0.0;
    }
    logs.iter()
        .filter(|log| log.severity == Severity::Error)
        .count() as f64
        / logs.len() as f64
}

#[derive(Debug, PartialEq, Eq)]
pub enum MetricError {
    InvalidCapacity,
}

/// Bounded window of latency samples, dropping oldest when at capacity.
pub struct LatencyWindow {
    samples: VecDeque<u64>,
    capacity: usize,
}

impl LatencyWindow {
    pub fn new(capacity: usize) -> Result<Self, MetricError> {
        if capacity == 0 {
            return Err(MetricError::InvalidCapacity);
        }
        Ok(Self {
            samples: VecDeque::with_capacity(capacity.min(1024)),
            capacity,
        })
    }

    pub fn record_ms(&mut self, millis: u64) {
        if self.samples.len() == self.capacity {
            self.samples.pop_front();
        }
        self.samples.push_back(millis);
    }

    /// Nearest-rank percentile, no interpolation and no implied production SLO.
    pub fn percentile(&self, percentile: u8) -> Option<u64> {
        if self.samples.is_empty() || percentile == 0 || percentile > 100 {
            return None;
        }
        let mut sorted: Vec<_> = self.samples.iter().copied().collect();
        sorted.sort_unstable();
        let rank = (sorted.len() * usize::from(percentile)).div_ceil(100);
        sorted.get(rank.saturating_sub(1)).copied()
    }

    pub fn len(&self) -> usize {
        self.samples.len()
    }
    pub fn is_empty(&self) -> bool {
        self.samples.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn error_rate_handles_empty_and_mixed_events() {
        assert_eq!(error_rate(&[]), 0.0);
        let logs = [
            LogEvent {
                severity: Severity::Info,
                text: "ok",
            },
            LogEvent {
                severity: Severity::Error,
                text: "timeout",
            },
            LogEvent {
                severity: Severity::Warning,
                text: "slow",
            },
            LogEvent {
                severity: Severity::Error,
                text: "unavailable",
            },
        ];
        assert_eq!(error_rate(&logs), 0.5);
    }

    #[test]
    fn nearest_rank_percentiles_are_deterministic() {
        let mut window = LatencyWindow::new(10).unwrap();
        for ms in [11, 22, 33, 44, 55, 66, 77, 88, 99, 100] {
            window.record_ms(ms);
        }
        assert_eq!(window.percentile(50), Some(55));
        assert_eq!(window.percentile(99), Some(100));
        assert_eq!(window.percentile(100), Some(100));
        assert_eq!(window.percentile(0), None);
    }

    #[test]
    fn bounded_window_discards_oldest() {
        let mut window = LatencyWindow::new(2).unwrap();
        window.record_ms(200);
        window.record_ms(10);
        window.record_ms(20);
        assert_eq!(window.len(), 2);
        assert_eq!(window.percentile(100), Some(20));
        assert!(matches!(
            LatencyWindow::new(0),
            Err(MetricError::InvalidCapacity)
        ));
    }
}
