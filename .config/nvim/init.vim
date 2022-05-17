call plug#begin('~/.config/nvim/plugged')
"""""""""
" Plugins
"""""""""
Plug 'preservim/nerdtree' " file explorer
Plug 'akinsho/nvim-toggleterm.lua'
"Plug 'Shatur/neovim-session-manager' " session manager
Plug 'windwp/nvim-autopairs' " bracket pair
"Plug 'rrethy/vim-hexokinase', {'do': 'make hexokinase'} " show hex colors
Plug 'Yggdroot/indentLine'
Plug 'airblade/vim-gitgutter'

" status bar
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'kyazdani42/nvim-web-devicons'
Plug 'akinsho/bufferline.nvim'

" nvim LSP
" TODO
"Plug 'prabirshrestha/vim-lsp'
"Plug 'mattn/vim-lsp-settings'
"Plug 'neovim/nvim-lspconfig'
Plug 'liuchengxu/vista.vim'
Plug 'derekwyatt/vim-fswitch'
Plug 'tyru/open-browser.vim'

" themes
Plug 'pineapplegiant/spaceduck', {'branch': 'main'}
Plug 'sainnhe/gruvbox-material'
" Color scheme
if exists('+termguicolors')
  let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
  let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"
  set termguicolors
endif

" needs to be the last one
Plug 'kyazdani42/nvim-web-devicons'
call plug#end()

""""""""
" Config
""""""""

" External config file (lua)
luafile ~/.config/nvim/plugins.lua
"luafile ~/.config/nvim/lsp.lua


" automaticall delete trailing whitespace and newlines at end of file on save
autocmd BufWritePre * %s/\s\+$//e
autocmd BufWritePre * %s/\n\+\%$//e

" --- General
set cursorline
set tabstop=2
set shiftwidth=2
set expandtab
set number
set relativenumber
set mouse=a
set smartcase
set colorcolumn=91
set clipboard=unnamedplus

let g:indentLine_char = '|'

" --- Colors
colorscheme gruvbox-material

" nerdtree
let g:NERDTreeDirArrowExpandable = '▸'
let g:NERDTreeDirArrowCollapsible = '▾'

" coc
let g:coc_global_extensions = [
  \ 'coc-tsserver',
  \ 'coc-json',
  \ 'coc-css',
  \  'coc-eslint',
  \  'coc-prettier'
  \ ]

" airline (status bar)
"let g:airline_theme='simple'
let g:ariline_powerline_fonts = 1
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#fnammod = ':t'
let g:airline#extensions#tabline#formatter = 'unique_tail'


"""""""""""""
" Keybindings
"""""""""""""

" --- General
"
" navigation
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" window splitting
nnoremap <C-a>e <C-w>v
nnoremap <C-a>o <C-w>h
nnoremap <C-a>x <C-w>q

" nerdtree
nnoremap <C-t> :NERDTreeToggle<CR>

" coc
nmap <silent> gd <Plug>(coc-definition)
nmap <silent> gy <Plug>(coc-type-definition)
nmap <silent> gr <Plug>(coc-references)

nmap <silent> [g <Plug>(coc-diagnostic-prev)
nmap <silent> ]g <Plug>(coc-diagnostic-next)
nnoremap <silent> <space>s :<C-u>CocList -I symbols<cr>

nnoremap <silent> <space>d :<C-u>CocList diagnostics<cr>

nmap <leader>do <Plug>(coc-codeaction)

nmap <leader>rn <Plug>(coc-rename)

"
