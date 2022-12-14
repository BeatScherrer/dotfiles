require("plugins.lsp.mason")
require("plugins.lsp.handlers").setup()
require("plugins.lsp.null-ls")

-- hide the annoying notification
local notify = vim.notify
vim.notify = function(msg, ...)
	if
		msg:match("warning: multiple different client offset_encodings detected for buffer, this is not supported yet")
	then
		return
	end

	notify(msg, ...)
end
