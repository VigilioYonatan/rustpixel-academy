#[derive(Debug, PartialEq, Eq)]
pub enum ApiError {
    EmptyName,
    NameTooLong,
    InvalidAge,
}

#[derive(Debug, PartialEq, Eq)]
pub struct User {
    pub name: String,
    pub age: u8,
}

pub fn register(name: &str, age: u8) -> Result<User, ApiError> {
    let clean = name.trim();
    if clean.is_empty() {
        Err(ApiError::EmptyName)
    } else if clean.chars().count() > 64 {
        Err(ApiError::NameTooLong)
    } else if age < 13 {
        Err(ApiError::InvalidAge)
    } else {
        Ok(User {
            name: clean.to_owned(),
            age,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn invalid_inputs_are_typed() {
        assert_eq!(register(" ", 24), Err(ApiError::EmptyName));
        assert_eq!(register("Ferris", 9), Err(ApiError::InvalidAge));
        assert_eq!(register(&"x".repeat(65), 18), Err(ApiError::NameTooLong));
    }

    #[test]
    fn successful_contract() {
        assert_eq!(register(" Ferris ", 20).unwrap().name, "Ferris");
    }
}
