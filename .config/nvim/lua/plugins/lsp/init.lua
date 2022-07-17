local status_ok, _ = pcall(require, "lspconfig")

if not status_ok then
	return
end

vim.cmd([[autocmd BufWritePre * lua vim.lsp.buf.formatting_seq_sync(nil, nil, {"null-ls"})]])

require("plugins.lsp.configs")
require("plugins.lsp.handlers").setup()
