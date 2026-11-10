#[derive(Debug, PartialEq, Eq)]
pub enum DecodeError {
    InvalidHex,
    OddLength,
}

pub fn encode(data: &[u8]) -> String {
    const HEX: &[u8] = b"0123456789abcdef";
    let mut result = String::with_capacity(data.len() * 2);
    for b in data {
        result.push(char::from(HEX[(*b >> 4) as usize]));
        result.push(char::from(HEX[(*b & 15) as usize]));
    }
    result
}

fn digit(c: u8) -> Option<u8> {
    match c {
        b'0'..=b'9' => Some(c - b'0'),
        b'a'..=b'f' => Some(c - b'a' + 10),
        b'A'..=b'F' => Some(c - b'A' + 10),
        _ => None,
    }
}

pub fn decode(text: &str) -> Result<Vec<u8>, DecodeError> {
    let b = text.as_bytes();
    if !b.len().is_multiple_of(2) {
        return Err(DecodeError::OddLength);
    }
    let mut out = Vec::with_capacity(b.len() / 2);
    let (chunks, _) = b.as_chunks::<2>();
    for pair in chunks {
        let a = digit(pair[0]).ok_or(DecodeError::InvalidHex)?;
        let z = digit(pair[1]).ok_or(DecodeError::InvalidHex)?;
        out.push((a << 4) | z);
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn roundtrip_many_generated_cases() {
        let mut seed = 1u64;
        for n in 0..256 {
            let mut bytes = vec![0; n];
            for b in &mut bytes {
                seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
                *b = (seed >> 32) as u8;
            }
            assert_eq!(decode(&encode(&bytes)), Ok(bytes));
        }
    }

    #[test]
    fn invalid_inputs() {
        assert_eq!(decode("x"), Err(DecodeError::OddLength));
        assert_eq!(decode("xz"), Err(DecodeError::InvalidHex));
    }
}
