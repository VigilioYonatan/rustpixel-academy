//! Core domain: downstream adapters depend on this module, not conversely.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Order {
    pub id: u64,
    pub total_cents: u64,
}
#[derive(Debug, PartialEq, Eq)]
pub enum DomainError {
    InvalidTotal,
    AlreadyExists,
}
pub trait OrderRepository {
    fn store(&mut self, order: Order) -> Result<(), DomainError>;
    fn get(&self, id: u64) -> Option<Order>;
}
pub fn create_order<R: OrderRepository>(
    repo: &mut R,
    id: u64,
    total_cents: u64,
) -> Result<Order, DomainError> {
    if total_cents == 0 {
        return Err(DomainError::InvalidTotal);
    }
    if repo.get(id).is_some() {
        return Err(DomainError::AlreadyExists);
    }
    let order = Order { id, total_cents };
    repo.store(order.clone())?;
    Ok(order)
}
#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    #[derive(Default)]
    struct InMemory(HashMap<u64, Order>);
    impl OrderRepository for InMemory {
        fn store(&mut self, o: Order) -> Result<(), DomainError> {
            self.0.insert(o.id, o);
            Ok(())
        }
        fn get(&self, id: u64) -> Option<Order> {
            self.0.get(&id).cloned()
        }
    }
    #[test]
    fn contract_keeps_domain_stable() {
        let mut repo = InMemory::default();
        assert_eq!(create_order(&mut repo, 7, 500).unwrap().total_cents, 500);
        assert_eq!(
            create_order(&mut repo, 7, 500),
            Err(DomainError::AlreadyExists)
        );
        assert_eq!(
            create_order(&mut repo, 8, 0),
            Err(DomainError::InvalidTotal)
        );
    }
}
