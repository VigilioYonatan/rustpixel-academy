//! Example C ABI boundary, restricted to primitive values and explicit ownership.
use std::ptr::NonNull;
#[repr(C)]
pub struct Counter {
    value: u64,
}
#[unsafe(no_mangle)]
pub extern "C" fn counter_new(initial: u64) -> *mut Counter {
    Box::into_raw(Box::new(Counter { value: initial }))
}
/// # Safety
/// `p` must be a live allocation returned by `counter_new`, and freed exactly once.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn counter_free(p: *mut Counter) {
    if !p.is_null() {
        unsafe {
            drop(Box::from_raw(p));
        }
    }
}
/// # Safety
/// `p` must point to a valid live Counter for the duration of the call.
pub unsafe fn counter_value(p: *const Counter) -> Option<u64> {
    let ptr = NonNull::new(p.cast_mut())?;
    Some(unsafe { ptr.as_ref().value })
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn roundtrip() {
        let p = counter_new(17);
        assert_eq!(unsafe { counter_value(p) }, Some(17));
        unsafe { counter_free(p) };
        assert_eq!(unsafe { counter_value(std::ptr::null()) }, None);
    }
}
