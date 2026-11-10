//! Safe-first API. Learners can compare it to a carefully audited unsafe variant.
#[derive(Debug, PartialEq, Eq)]
pub enum SliceError {
    OutOfBounds,
    Overflow,
}
pub fn window<T>(values: &[T], start: usize, len: usize) -> Result<&[T], SliceError> {
    let end = start.checked_add(len).ok_or(SliceError::Overflow)?;
    values.get(start..end).ok_or(SliceError::OutOfBounds)
}
/// # Safety
/// `index` must be strictly less than `values.len()`; the referenced slice must stay alive.
pub unsafe fn get_unchecked_audited<T>(values: &[T], index: usize) -> &T {
    debug_assert!(index < values.len());
    unsafe { values.get_unchecked(index) }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_bounds() {
        let x = [1, 2, 3];
        assert_eq!(window(&x, 2, 2), Err(SliceError::OutOfBounds));
        assert_eq!(window(&x, usize::MAX, 2), Err(SliceError::Overflow));
    }
    #[test]
    fn valid_window() {
        assert_eq!(window(&[1, 2, 3, 4], 1, 2), Ok(&[2, 3][..]));
    }
}
