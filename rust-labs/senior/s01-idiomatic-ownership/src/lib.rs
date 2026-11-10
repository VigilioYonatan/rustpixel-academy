//! S01 — Idiomatic Ownership and Borrowing under load.
//! Demonstrates zero-allocation slice borrowing and Cow semantics over String copies.

use std::borrow::Cow;

/// Extracts the normalized leading path segment as a borrowed slice.
/// Returns None if the prefix is empty or contains only whitespace.
pub fn normalized_prefix(source: &str) -> Option<&str> {
    source
        .split('/')
        .next()
        .map(str::trim)
        .filter(|s| !s.is_empty())
}

/// Demonstrates conditional ownership (Cow): borrows if already normalized,
/// allocates an owned String only when sanitization/unescaping modifies bytes.
pub fn sanitize_prefix<'a>(source: &'a str) -> Option<Cow<'a, str>> {
    let raw = normalized_prefix(source)?;
    if raw.contains('\\') {
        Some(Cow::Owned(raw.replace('\\', "/")))
    } else {
        Some(Cow::Borrowed(raw))
    }
}

pub fn find_prefix<'a>(items: &'a [&'a str], prefix: &str) -> Option<&'a str> {
    items.iter().copied().find(|s| s.starts_with(prefix))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn borrows_without_cloning() {
        let input = String::from("  src /test/module");
        let prefix = normalized_prefix(&input);
        assert_eq!(prefix, Some("src"));
        // Input remains valid and borrowed
        assert_eq!(input.len(), 18);
    }

    #[test]
    fn handles_empty_and_whitespace_only() {
        assert_eq!(normalized_prefix(""), None);
        assert_eq!(normalized_prefix("   "), None);
        assert_eq!(normalized_prefix("  /x"), None);
        assert_eq!(normalized_prefix("///"), None);
    }

    #[test]
    fn handles_multibyte_utf8_safely() {
        assert_eq!(normalized_prefix("🦀_ferris/rust"), Some("🦀_ferris"));
        assert_eq!(normalized_prefix("  élégant  /style"), Some("élégant"));
        assert_eq!(normalized_prefix("東京/渋谷"), Some("東京"));
    }

    #[test]
    fn cow_borrows_clean_inputs_and_owns_modified() {
        let clean = "module_a/sub";
        let cow_clean = sanitize_prefix(clean).unwrap();
        assert!(matches!(cow_clean, Cow::Borrowed(_)));
        assert_eq!(cow_clean, "module_a");

        let escaped = "mod\\ule/sub";
        let cow_escaped = sanitize_prefix(escaped).unwrap();
        assert!(matches!(cow_escaped, Cow::Owned(_)));
        assert_eq!(cow_escaped, "mod/ule");
    }

    #[test]
    fn finds_matching_prefix() {
        let list = ["core::alloc", "core::borrow", "std::sync"];
        assert_eq!(find_prefix(&list, "core::b"), Some("core::borrow"));
        assert_eq!(find_prefix(&list, "alloc"), None);
    }
}
