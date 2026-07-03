use zed_extension_api::{self as zed, Command, LanguageServerId, Result, Worktree};

struct TisFormatterExtension;

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
        Ok(Command {
            command: node,
            args: vec!["server/dist/server.js".to_string()],
            env: worktree.shell_env(),
        })
    }
}

zed::register_extension!(TisFormatterExtension);
