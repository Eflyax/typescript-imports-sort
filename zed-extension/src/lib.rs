use std::ffi::OsStr;
use std::path::{Path, PathBuf};
use zed_extension_api::{self as zed, Command, LanguageServerId, Result, Worktree};

struct TisFormatterExtension;

/// Resolve the absolute path to the bundled LSP server.
///
/// Zed runs the extension from its (empty) work directory
/// `<...>/extensions/work/<id>`, but the extension's committed files ship in
/// the sibling `<...>/extensions/installed/<id>` directory. Node needs an
/// absolute path to the script, so translate the work dir into the installed
/// dir and append the bundle's relative path. Falls back to the work dir if
/// the layout is not the expected `work/<id>` shape.
fn bundled_server_path(work_dir: &Path) -> PathBuf {
    let rel = Path::new("server").join("dist").join("server.js");
    if let (Some(id), Some(parent)) = (work_dir.file_name(), work_dir.parent()) {
        if parent.file_name() == Some(OsStr::new("work")) {
            if let Some(extensions_root) = parent.parent() {
                return extensions_root.join("installed").join(id).join(&rel);
            }
        }
    }
    work_dir.join(&rel)
}

impl zed::Extension for TisFormatterExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Command> {
        let node = zed::node_binary_path()?;
        // Node resolves a relative script argument against the spawned
        // process's cwd (the edited project root), not the extension, so the
        // path to the bundled server must be absolute.
        let work_dir = std::env::current_dir()
            .map_err(|e| format!("failed to resolve extension directory: {e}"))?;
        let server_path = bundled_server_path(&work_dir);
        Ok(Command {
            command: node,
            args: vec![server_path.to_string_lossy().into_owned()],
            env: worktree.shell_env(),
        })
    }
}

zed::register_extension!(TisFormatterExtension);
