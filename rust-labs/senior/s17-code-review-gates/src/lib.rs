#[derive(Clone, Copy)]
pub struct Evidence {
    pub tests_pass: bool,
    pub security_review: bool,
    pub rollback_documented: bool,
    pub benchmark_provided: bool,
}

#[derive(Debug, PartialEq, Eq)]
pub enum GateError {
    TestsFailed,
    SecurityMissing,
    RollbackMissing,
    PerfEvidenceMissing,
}

pub fn release_gate(e: Evidence, performance_sensitive: bool) -> Result<(), Vec<GateError>> {
    let mut errors = Vec::new();
    if !e.tests_pass {
        errors.push(GateError::TestsFailed);
    }
    if !e.security_review {
        errors.push(GateError::SecurityMissing);
    }
    if !e.rollback_documented {
        errors.push(GateError::RollbackMissing);
    }
    if performance_sensitive && !e.benchmark_provided {
        errors.push(GateError::PerfEvidenceMissing);
    }
    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_unverified_release() {
        let e = Evidence {
            tests_pass: true,
            security_review: false,
            rollback_documented: false,
            benchmark_provided: false,
        };
        assert_eq!(
            release_gate(e, true),
            Err(vec![
                GateError::SecurityMissing,
                GateError::RollbackMissing,
                GateError::PerfEvidenceMissing
            ])
        );
    }

    #[test]
    fn accepts_complete_evidence() {
        assert!(
            release_gate(
                Evidence {
                    tests_pass: true,
                    security_review: true,
                    rollback_documented: true,
                    benchmark_provided: true
                },
                true
            )
            .is_ok()
        );
    }
}
