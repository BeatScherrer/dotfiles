-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here
--
-- TODO make vim.env.XDG_CONFIG_HOME work, (check pam_systemd)
-- credits to rrhety. from: https://rrethy.github.io/book/colorscheme.html

vim.opt.fillchars = [[diff: ,eob: ,fold: ,foldopen:,foldsep: ,foldclose:]]

SCHROOT_NAME="ub22"
vim.opt.makeprg = "cd build && schroot -c chroot:" .. SCHROOT_NAME .. ' -- /bin/bash -ic "mm"; cd - '

vim.api.nvim_create_user_command("Format", function(args)
  local range = nil
  if args.count ~= -1 then
    local end_line = vim.api.nvim_buf_get_lines(0, args.line2 - 1, args.line2, true)[1]
    range = {
      start = { args.line1, 0 },
      ["end"] = { args.line2, end_line:len() },
    }
  end
  require("conform").format({ async = true, lsp_fallback = true, range = range })
end, { range = true })
