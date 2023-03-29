local null_ls_status_ok, null_ls = pcall(require, "null-ls")
if not null_ls_status_ok then
	return
end

local formatting = null_ls.builtins.formatting
local diagnostics = null_ls.builtins.diagnostics
local conditional = function(fn)
	local utils = require("null-ls.utils").make_conditional_utils()
	return fn(utils)
end

null_ls.setup({
	debug = false,

	sources = {
		-- conditional(function(utils)
		-- 	return (utils.root_has_file("core/.clang-format") or utils.root_has_file(".clang-format"))
		-- 		and formatting.clang_format.with({
		-- 			extra_args = { "-style=file" },
		-- 			command = "/home/beat/.local/bin/clang-format",
		-- 		})
		-- end),
		formatting.clang_format.with({
			extra_args = { "-style=file" },
			command = "/home/beat/.local/bin/clang-format",
			filetypes = { "c", "cpp", "h", "hpp", "ts" },
		}),
		formatting.prettier.with({
			filetypes = { "html", "js", "tsx", "jsx" },
		}),
		formatting.stylua,
		formatting.shfmt.with({ extra_args = { "--indent", "2" } }),
		formatting.rustfmt,

		-- setting eslint_d only if we have a ".eslintrc.js" file in the project
		diagnostics.eslint_d.with({
			condition = function(utils)
				return utils.root_has_file({ ".eslintrc.js" })
			end,
		}),

		-- Here we set a conditional to call the rubocop formatter. If we have a Gemfile in the project, we call "bundle exec rubocop", if not we only call "rubocop".
		conditional(function(utils)
			return utils.root_has_file("Gemfile")
					and null_ls.builtins.formatting.rubocop.with({
						command = "bundle",
						args = vim.list_extend({ "exec", "rubocop" }, null_ls.builtins.formatting.rubocop._opts.args),
					})
				or null_ls.builtins.formatting.rubocop
		end),

		-- Same as above, but with diagnostics.rubocop to make sure we use the proper rubocop version for the project
		conditional(function(utils)
			return utils.root_has_file("Gemfile")
					and null_ls.builtins.diagnostics.rubocop.with({
						command = "bundle",
						args = vim.list_extend({ "exec", "rubocop" }, null_ls.builtins.diagnostics.rubocop._opts.args),
					})
				or null_ls.builtins.diagnostics.rubocop
		end),
	},
})
