//! S18 — System Design, Capacity Modeling and SLO Budgets.
//! Computes concurrency (Little's Law: L = λ * W), connection pools, and memory budgets with checked arithmetic.

#[derive(Debug, PartialEq, Eq)]
pub enum CapacityError {
    ZeroServiceTime,
    ZeroThroughput,
    Overflow,
    SloViolation,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct CapacityPlan {
    pub average_concurrency: u64,
    pub peak_concurrency: u64,
    pub connection_pool_size: u32,
    pub estimated_memory_bytes: u64,
}

#[derive(Debug, Clone)]
pub struct SloRequirements {
    pub target_p99_ms: u64,
    pub peak_multiplier_percent: u32,
    pub bytes_per_connection: u64,
}

/// Applies Little's Law with checked arithmetic and headroom buffers.
/// Does NOT replace empirical load testing or APM telemetry.
pub fn estimate(
    rps: u64,
    service_ms: u64,
    bytes_per_request: u64,
) -> Result<CapacityPlan, CapacityError> {
    if service_ms == 0 {
        return Err(CapacityError::ZeroServiceTime);
    }
    if rps == 0 {
        return Err(CapacityError::ZeroThroughput);
    }

    // Little's Law: L = λ * W (seconds)
    let jobs = rps.checked_mul(service_ms).ok_or(CapacityError::Overflow)?;
    let average_concurrency = jobs.checked_add(999).ok_or(CapacityError::Overflow)? / 1000;

    // Headroom: 150% peak buffer
    let peak_concurrency = average_concurrency
        .checked_mul(150)
        .ok_or(CapacityError::Overflow)?
        / 100;

    // Connection pool clamped between 4 and 1024
    let connection_pool_size = (peak_concurrency as u32).clamp(4, 1024);

    // Memory budget = (peak_concurrency * bytes_per_request) + buffer overhead
    let memory_bytes = peak_concurrency
        .checked_mul(bytes_per_request)
        .ok_or(CapacityError::Overflow)?;
    let estimated_memory_bytes = memory_bytes
        .checked_add(4 * 1024 * 1024)
        .ok_or(CapacityError::Overflow)?; // 4MB runtime base

    Ok(CapacityPlan {
        average_concurrency,
        peak_concurrency,
        connection_pool_size,
        estimated_memory_bytes,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn estimate_computes_deterministic_littles_law() {
        // 1000 RPS * 50ms = 50 concurrent in-flight requests.
        // Peak at 150% = 75. Memory = 75 * 1024 + 4MB.
        let plan = estimate(1000, 50, 1024).unwrap();
        assert_eq!(plan.average_concurrency, 50);
        assert_eq!(plan.peak_concurrency, 75);
        assert_eq!(plan.connection_pool_size, 75);
        assert_eq!(plan.estimated_memory_bytes, 75 * 1024 + 4 * 1024 * 1024);
    }

    #[test]
    fn zero_service_time_is_error() {
        assert_eq!(estimate(100, 0, 1024), Err(CapacityError::ZeroServiceTime));
    }

    #[test]
    fn zero_throughput_is_error() {
        assert_eq!(estimate(0, 50, 1024), Err(CapacityError::ZeroThroughput));
    }

    #[test]
    fn arithmetic_overflow_is_prevented() {
        assert_eq!(estimate(u64::MAX, 100, 1024), Err(CapacityError::Overflow));
        assert_eq!(
            estimate(1_000_000, u64::MAX, 1024),
            Err(CapacityError::Overflow)
        );
    }

    #[test]
    fn connection_pool_bounds() {
        // Low concurrency is clamped to at least 4 connections
        let small = estimate(1, 1, 100).unwrap();
        assert!(small.connection_pool_size >= 4);

        // Huge concurrency is clamped to maximum 1024
        let huge = estimate(100_000, 500, 100).unwrap();
        assert_eq!(huge.connection_pool_size, 1024);
    }
}
