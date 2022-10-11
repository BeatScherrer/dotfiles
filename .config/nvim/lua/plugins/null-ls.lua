local status_ok, null_ls = pcall(require, "null-ls")

if not status_ok then
	vim.notify("could not find null-ls")
end

local formatting = null_ls.builtins.formatting

null_ls.setup({
	debug = false,
	sources = {
		formatting.clang_format.with({ extra_args = { "-style=file" } }),
		formatting.stylua,
		formatting.prettier,
		formatting.shfmt.with({ extras_args = { "--indent 2" } }),
		formatting.rustfmt,
	},
})
