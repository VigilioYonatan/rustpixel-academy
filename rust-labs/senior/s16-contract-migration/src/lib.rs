#[derive(Debug, PartialEq, Eq)]
pub enum ParseError {
    InvalidLine,
    InvalidAmount,
}
#[derive(Debug, PartialEq, Eq)]
pub struct Invoice {
    pub id: u32,
    pub amount_cents: u64,
}
pub fn parse_legacy(line: &str) -> Result<Invoice, ParseError> {
    let (id, amount) = line.split_once(':').ok_or(ParseError::InvalidLine)?;
    if amount.contains(':') {
        return Err(ParseError::InvalidLine);
    }
    let id = id.parse().map_err(|_| ParseError::InvalidLine)?;
    let amount_cents = amount.parse().map_err(|_| ParseError::InvalidAmount)?;
    Ok(Invoice { id, amount_cents })
}
pub fn render_legacy(i: &Invoice) -> String {
    format!("{}:{}", i.id, i.amount_cents)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn golden_contract() {
        let raw = "42:299";
        let parsed = parse_legacy(raw).unwrap();
        assert_eq!(render_legacy(&parsed), raw);
    }
    #[test]
    fn malformed_inputs() {
        assert_eq!(parse_legacy("42:x"), Err(ParseError::InvalidAmount));
        assert_eq!(parse_legacy("4:3:2"), Err(ParseError::InvalidLine));
    }
}
