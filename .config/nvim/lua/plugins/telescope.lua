return {
  -- change some telescope options and a keymap to browse plugin files
  {
    "nvim-telescope/telescope.nvim",
    dependencies = {
      "nvim-telescope/telescope-fzf-native.nvim",
      build = "make",
      config = function()
        require("telescope").load_extension("fzf")
        require("telescope").load_extension("just")
      end,
    },
    keys = {
      -- add a keymap to browse plugin files
      -- stylua: ignore
      {
        "<leader>fp",
        function() require("telescope.builtin").find_files({ cwd = require("lazy.core.config").options.root }) end,
        desc = "Find Plugin File",
      },
      { "<leader>ff", "<cmd>Telescope find_files<cr>" },
      { "<leader>fl", "<cmd>Telescope live_grep<cr>" },
      { "<leader>fs", "<cmd>Telescope lsp_document_symbols<cr>" },
      { "<leader>fr", "<cmd>Telescope lsp_references<cr>" },
      { "<leader>fg", "<cmd>Telescope grep_string<cr>" },
      { "<leader>fo", "<cmd>Telescope resume<cr>" },
      { "<leader>f?", "<cmd>Telescope help_tags<cr>" },
      { "<leader>fh", "<cmd>Telescope highlights<cr>" },
      { "<leader>fj", "<cmd>Telescope just<cr>" },
    },
    -- change some options
    opts = {
      defaults = {
        layout_strategy = "horizontal",
        layout_config = { prompt_position = "top" },
        sorting_strategy = "ascending",
        winblend = 0,
      },
    },
  },
}
