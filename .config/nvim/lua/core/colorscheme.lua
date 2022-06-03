-- TODO make vim.env.XDG_CONFIG_HOME work, (check pam_systemd)
-- credits to rrhety. from: https://rrethy.github.io/book/colorscheme.html

-- local base16_theme_fname = vim.fn.expand(vim.env.XDG_CONFIG_HOME .. "/.base16_theme")
base16_theme_fname = vim.fn.expand("~/.config/kitty/.base16_theme")
theme_name = vim.fn.readfile(base16_theme_fname)[1]

vim.notify(theme_name)

-- this function is the only way we should be setting our colorscheme
function set_colorscheme(name)
	-- write our colorscheme back to our single source of truth
	vim.fn.writefile({ name }, base16_theme_fname)
	-- set Neovim's colorscheme
	-- local status_ok = pcall(vim.cmd, "colorscheme base16-" .. name)
	-- if not status_ok then
	-- 	vim.notify("colorscheme " .. name .. " not found!")
	-- 	return
	-- end
	status_ok, _ = pcall(vim.cmd, "colorscheme " .. name)
	if not status_ok then
		vim.notify("setting fallback colorscheme")
		return
	end

	-- execute `kitty @ set-colors -c <color>` to change terminal window's
	-- colors and newly created terminal windows colors
	--vim.loop.spawn("kitty", {
	--	args = {
	--		"@",
	--		"set-colors",
	--		"-c",
	--		-- string.format(vim.env.XDG_CONFIG_HOME .. "kitty/base16-kitty/colors/%s.conf", name),
	--		string.format("~/.config/kitty/base16-kitty/colors/base16-%s.conf", name),
	--	},
	--}, nil)
end

set_colorscheme(theme_name)

vim.api.nvim_create_user_command("SetColorscheme", function(opts)
	set_colorscheme(opts.args)
end, { nargs = 1 })
