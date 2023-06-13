return {
  "jose-elias-alvarez/null-ls.nvim",
  event = { "BufReadPre", "BufNewFile" },
  dependencies = { "mason.nvim" },
  opts = function()
    local nls = require("null-ls")
    return {
      root_dir = require("null-ls.utils").root_pattern(".null-ls-root", ".neoconf.json", "Makefile", ".git"),
      sources = { nls.builtins.formatting.stylua,
        nls.builtins.formatting.shfmt.with({extra_args = { "--indent", "2"}}),
        nls.builtins.formatting.clang_format.with({
          extra_args = { "-style=file" },
          command = "/home/beat/.local/bin/clang-format",
          filetypes = { "c", "cpp", "h", "hpp", "ts" },
        }),
        nls.builtins.formatting.prettier,
        nls.builtins.formatting.rustfmt
        -- nls.builtins.diagnostics.flake8,
      },
    }
  end,
}
