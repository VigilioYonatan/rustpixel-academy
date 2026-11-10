use std::collections::HashMap;
#[derive(Default)]
pub struct Inventory {
    quantities: HashMap<String, u32>,
}
impl Inventory {
    pub fn add(&mut self, sku: &str, amount: u32) -> Result<(), &'static str> {
        if sku.trim().is_empty() || amount == 0 {
            return Err("invalid item");
        }
        let stock = self.quantities.entry(sku.to_string()).or_default();
        *stock = stock.checked_add(amount).ok_or("overflow")?;
        Ok(())
    }
    pub fn quantity(&self, sku: &str) -> u32 {
        self.quantities.get(sku).copied().unwrap_or(0)
    }
    pub fn take(&mut self, sku: &str, amount: u32) -> Result<(), &'static str> {
        let current = self.quantities.get_mut(sku).ok_or("unknown sku")?;
        if *current < amount {
            return Err("insufficient stock");
        }
        *current -= amount;
        Ok(())
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn stock_flow() {
        let mut inv = Inventory::default();
        inv.add("A", 5).unwrap();
        inv.take("A", 2).unwrap();
        assert_eq!(inv.quantity("A"), 3);
    }
    #[test]
    fn reject_overdraw() {
        let mut inv = Inventory::default();
        inv.add("A", 1).unwrap();
        assert!(inv.take("A", 2).is_err());
    }
}
