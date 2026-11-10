use std::sync::Mutex;
#[derive(Debug, PartialEq, Eq)]
pub enum TransferError {
    SameAccount,
    Insufficient,
    BalanceOverflow,
    Poisoned,
}
pub struct Account {
    pub id: u64,
    balance: Mutex<u64>,
}
impl Account {
    pub fn new(id: u64, balance: u64) -> Self {
        Self {
            id,
            balance: Mutex::new(balance),
        }
    }
    pub fn balance(&self) -> Result<u64, TransferError> {
        Ok(*self.balance.lock().map_err(|_| TransferError::Poisoned)?)
    }
}
pub fn transfer(from: &Account, to: &Account, amount: u64) -> Result<(), TransferError> {
    if from.id == to.id {
        return Err(TransferError::SameAccount);
    }
    // Global lock order by account id, independent of transfer direction.
    let (mut src, mut dst) = if from.id < to.id {
        (
            from.balance.lock().map_err(|_| TransferError::Poisoned)?,
            to.balance.lock().map_err(|_| TransferError::Poisoned)?,
        )
    } else {
        let dst = to.balance.lock().map_err(|_| TransferError::Poisoned)?;
        let src = from.balance.lock().map_err(|_| TransferError::Poisoned)?;
        (src, dst)
    };
    if *src < amount {
        return Err(TransferError::Insufficient);
    }
    let next = dst
        .checked_add(amount)
        .ok_or(TransferError::BalanceOverflow)?;
    *src -= amount;
    *dst = next;
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn preserves_total_and_rejects_overdraft() {
        let a = Account::new(2, 100);
        let b = Account::new(1, 30);
        transfer(&a, &b, 40).unwrap();
        assert_eq!(a.balance().unwrap(), 60);
        assert_eq!(b.balance().unwrap(), 70);
        assert_eq!(transfer(&b, &a, 100), Err(TransferError::Insufficient));
    }
    #[test]
    fn does_not_overflow() {
        let a = Account::new(1, 5);
        let b = Account::new(2, u64::MAX);
        assert_eq!(transfer(&a, &b, 1), Err(TransferError::BalanceOverflow));
    }
}
