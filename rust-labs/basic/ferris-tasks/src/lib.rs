#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Task {
    pub description: String,
    pub complete: bool,
}
#[derive(Default)]
pub struct TaskList {
    tasks: Vec<Task>,
}
impl TaskList {
    pub fn add(&mut self, description: &str) -> Result<(), &'static str> {
        let s = description.trim();
        if s.is_empty() {
            return Err("empty task");
        }
        self.tasks.push(Task {
            description: s.to_owned(),
            complete: false,
        });
        Ok(())
    }
    pub fn complete(&mut self, index: usize) -> bool {
        if let Some(t) = self.tasks.get_mut(index) {
            t.complete = true;
            true
        } else {
            false
        }
    }
    pub fn tasks(&self) -> &[Task] {
        &self.tasks
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn add_and_complete() {
        let mut list = TaskList::default();
        list.add("Study Rust").unwrap();
        assert!(list.complete(0));
        assert!(list.tasks()[0].complete);
    }
    #[test]
    fn no_empty() {
        assert!(TaskList::default().add(" ").is_err());
    }
}
