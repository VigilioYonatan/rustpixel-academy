//! S12 — Authorization must be performed on the resource, not only on the route.
//! This example is single-process and does not implement authentication or real tokens.
use std::collections::HashMap;

#[derive(Debug, PartialEq, Eq)]
pub enum AccessError {
    NotFound,
    Forbidden,
    InvalidContent,
}

#[derive(Clone, Debug)]
pub struct Document {
    pub owner: u64,
    pub contents: String,
}

#[derive(Default)]
pub struct Documents(HashMap<u64, Document>);

impl Documents {
    pub fn insert(&mut self, id: u64, doc: Document) {
        self.0.insert(id, doc);
    }

    /// Caller identity must come from a trusted authentication boundary.
    pub fn read(&self, principal: u64, id: u64) -> Result<&str, AccessError> {
        let doc = self.0.get(&id).ok_or(AccessError::NotFound)?;
        if doc.owner != principal {
            return Err(AccessError::Forbidden);
        }
        Ok(doc.contents.as_str())
    }

    /// Authorization is checked again for writes. No modification occurs on failure.
    pub fn update(&mut self, principal: u64, id: u64, contents: &str) -> Result<(), AccessError> {
        if contents.len() > 4096 || contents.trim().is_empty() {
            return Err(AccessError::InvalidContent);
        }
        let doc = self.0.get_mut(&id).ok_or(AccessError::NotFound)?;
        if doc.owner != principal {
            return Err(AccessError::Forbidden);
        }
        doc.contents = contents.to_owned();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cannot_read_or_write_another_tenant() {
        let mut documents = Documents::default();
        documents.insert(
            12,
            Document {
                owner: 7,
                contents: "secret".into(),
            },
        );
        assert_eq!(documents.read(7, 12), Ok("secret"));
        assert_eq!(documents.read(8, 12), Err(AccessError::Forbidden));
        assert_eq!(
            documents.update(8, 12, "stolen"),
            Err(AccessError::Forbidden)
        );
        assert_eq!(documents.read(7, 12), Ok("secret"));
    }

    #[test]
    fn nonexistent_resource_and_invalid_updates_fail() {
        let mut documents = Documents::default();
        documents.insert(
            1,
            Document {
                owner: 3,
                contents: "hello".into(),
            },
        );
        assert_eq!(documents.read(3, 99), Err(AccessError::NotFound));
        assert_eq!(documents.update(3, 99, "new"), Err(AccessError::NotFound));
        assert_eq!(
            documents.update(3, 1, "   "),
            Err(AccessError::InvalidContent)
        );
        assert_eq!(
            documents.update(3, 1, &"x".repeat(4097)),
            Err(AccessError::InvalidContent)
        );
        assert_eq!(documents.read(3, 1), Ok("hello"));
    }

    #[test]
    fn authorized_update_is_visible_only_to_owner() {
        let mut documents = Documents::default();
        documents.insert(
            1,
            Document {
                owner: 3,
                contents: "old".into(),
            },
        );
        assert_eq!(documents.update(3, 1, "new"), Ok(()));
        assert_eq!(documents.read(3, 1), Ok("new"));
        assert_eq!(documents.read(4, 1), Err(AccessError::Forbidden));
    }
}
