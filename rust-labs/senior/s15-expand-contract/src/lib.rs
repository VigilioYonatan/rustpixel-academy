#[derive(Clone, Debug, PartialEq, Eq)]
pub struct User {
    pub id: u64,
    pub display_name: String,
}
#[derive(Debug, PartialEq, Eq)]
pub enum MigrationError {
    EmptyName,
}
pub enum Incoming<'a> {
    V1 { id: u64, name: &'a str },
    V2 { id: u64, display_name: &'a str },
}
pub fn normalize(data: Incoming<'_>) -> Result<User, MigrationError> {
    let (id, name) = match data {
        Incoming::V1 { id, name }
        | Incoming::V2 {
            id,
            display_name: name,
        } => (id, name),
    };
    let name = name.trim();
    if name.is_empty() {
        return Err(MigrationError::EmptyName);
    }
    Ok(User {
        id,
        display_name: name.to_owned(),
    })
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn old_and_new_contracts_share_semantics() {
        assert_eq!(
            normalize(Incoming::V1 {
                id: 1,
                name: " Ferris "
            }),
            normalize(Incoming::V2 {
                id: 1,
                display_name: "Ferris"
            })
        );
        assert_eq!(
            normalize(Incoming::V1 { id: 9, name: " " }),
            Err(MigrationError::EmptyName)
        );
    }
}
