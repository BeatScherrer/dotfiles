return {
  "stevearc/conform.nvim",
  dependencies = { "mason.nvim" },
  lazy = true,
  cmd = "ConformInfo",
  keys = {
    {
      "<leader>cF",
      function()
        require("conform").format({
          formatters = { "injected" },
        })
      end,
      mode = { "n", "v" },
      desc = "Format Injected Langs",
    },
  },
  opts = function()
    ---@class ConformOpts
    local opts = {
      -- LazyVim will use these options when formatting with the conform.nvim formatter
      format = {
        timeout_ms = 3000,
        async = false, -- not recommended to change
        quiet = false, -- not recommended to change
      },
      ---@type table<string, conform.FormatterUnit[]>
      formatters_by_ft = {
        lua = { "stylua" },
        sh = { "shfmt" },
        bash = { "shfmt" },
        cpp = { "mt_clang_format" },
        typescriptreact = { "biome" }, -- tsx/jsx
        ts = { "biome" },
        typescript = { "biome" },
        -- ["*"] = { "codespell" }, -- For all files
        ["_"] = { "trim_whitespace" }, -- Fallback
      },
      -- The options you set here will be merged with the builtin formatters.
      -- You can also define any custom formatters here.
      ---@type table<string, conform.FormatterConfigOverride|fun(bufnr: integer): nil|conform.FormatterConfigOverride>
      formatters = {
        injected = {
          options = {
            ignore_errors = false,
          },
        },
        -- # Example of using dprint only when a dprint.json file is present
        -- dprint = {
        --   condition = function(ctx)
        --     return vim.fs.find({ "dprint.json" }, { path = ctx.filename, upward = true })[1]
        --   end,
        -- },
        clang_format = {
          prepend_args = { "-style=file" },
        },
        mt_clang_format = {
          command = "/home/beat/.local/bin/clang-format",
          args = { "-style=file" },
          -- condition = function(ctx)
          -- add exceptions:
          -- IDL files
          -- return true;
          -- end
        },
        shfmt = {
          prepend_args = { "-i", "2", "-ci" },
        },
      },
    }
    return opts
  end,
}
