use std::sync::Mutex;

#[derive(Debug, PartialEq, Eq)]
pub enum StockError {
    Insufficient,
    Poisoned,
    Overflow,
}

pub struct Inventory(Mutex<u64>);

impl Inventory {
    pub fn new(stock: u64) -> Self {
        Self(Mutex::new(stock))
    }

    pub fn reserve(&self, units: u64) -> Result<u64, StockError> {
        let mut x = self.0.lock().map_err(|_| StockError::Poisoned)?;
        if *x < units {
            return Err(StockError::Insufficient);
        }
        *x -= units;
        Ok(*x)
    }

    pub fn restock(&self, units: u64) -> Result<(), StockError> {
        let mut x = self.0.lock().map_err(|_| StockError::Poisoned)?;
        *x = x.checked_add(units).ok_or(StockError::Overflow)?;
        Ok(())
    }

    pub fn available(&self) -> Result<u64, StockError> {
        Ok(*self.0.lock().map_err(|_| StockError::Poisoned)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    #[test]
    fn only_one_buyer_claims_last_unit() {
        let inventory = Arc::new(Inventory::new(1));
        let handles: Vec<_> = (0..12)
            .map(|_| {
                let i = inventory.clone();
                std::thread::spawn(move || i.reserve(1).is_ok())
            })
            .collect();
        let successful = handles
            .into_iter()
            .map(|h| h.join().unwrap())
            .filter(|&ok| ok)
            .count();
        assert_eq!(successful, 1);
        assert_eq!(inventory.available(), Ok(0));
    }

    #[test]
    fn zero_units_are_noop() {
        let x = Inventory::new(3);
        assert_eq!(x.reserve(0), Ok(3));
    }

    #[test]
    fn insufficient_stock_returns_error() {
        let x = Inventory::new(2);
        assert_eq!(x.reserve(5), Err(StockError::Insufficient));
        assert_eq!(x.available(), Ok(2));
    }
}
