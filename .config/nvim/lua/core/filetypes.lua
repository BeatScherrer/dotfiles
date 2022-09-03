vim.filetype.add({
	filename = {
		["justfile"] = "just",
	},
	pattern = {
		["/home/beat/.ssh/config.d/.*"] = "sshconfig",
	},
})
