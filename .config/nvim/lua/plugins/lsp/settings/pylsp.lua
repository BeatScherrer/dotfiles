return {
	settings = {
		pylsp = {
			plugins = {
				--[[ autopep8 = {
					enabled = true,
				}, ]]
				--[[ flake8 = {
					enabled = true,
					indentSize = 4,
					maxLineLength = 90,
				}, ]]
				pycodestyle = {
					maxLineLength = 90,
					indentSize = 2,
				},
			},
		},
	},
}
