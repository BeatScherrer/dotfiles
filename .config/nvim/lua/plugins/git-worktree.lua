local status_ok, git_worktree = pcall(require, "git-worktree")

if not status_ok then
	vim.notify("'git-worktree' not found")
	return
end

git_worktree.setup()
