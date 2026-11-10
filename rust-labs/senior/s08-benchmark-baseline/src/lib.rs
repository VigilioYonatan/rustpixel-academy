use std::collections::BTreeMap;
/// Count tokens while borrowing from input; no per-token Strings are allocated.
pub fn word_counts(input: &str) -> BTreeMap<&str, usize> {
    let mut counts = BTreeMap::new();
    for word in input.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }
    counts
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn counts_borrowed_tokens() {
        let input = String::from("rust rust ferris");
        let counts = word_counts(&input);
        assert_eq!(counts.get("rust"), Some(&2));
        assert_eq!(counts.get("ferris"), Some(&1));
    }
    #[test]
    fn empty_input() {
        assert!(word_counts("   ").is_empty());
    }
}
