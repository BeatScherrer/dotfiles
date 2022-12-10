#!/bin/sh

bleopt exec_errexit_mark=
bleopt exec_elapsed_mark=
bleopt prompt_eol_mark=

# highlighting related to editing
ble-face -s region bg=60,fg=white
ble-face -s region_target bg=153,fg=black
ble-face -s region_match fg=141
ble-face -s region_insert fg=12
ble-face -s disabled fg=242
ble-face -s overwrite_mode fg=black,bg=51
ble-face -s auto_complete fg=238
# ble-face -s menu_filter_fixed bold
# ble-face -s menu_filter_input         fg=16,bg=229
ble-face -s vbell reverse
ble-face -s vbell_erase bg=252
ble-face -s vbell_flash fg=green,reverse
ble-face -s prompt_status_line fg=231,bg=240

# syntax highlighting
ble-face -s syntax_default none
ble-face -s syntax_command fg=brown
ble-face -s syntax_quoted fg=green
ble-face -s syntax_quotation fg=green,bold
ble-face -s syntax_escape fg=magenta
ble-face -s syntax_expr fg=26
ble-face -s syntax_error fg=brown
ble-face -s syntax_varname fg=202
ble-face -s syntax_delimiter bold
ble-face -s syntax_param_expansion fg=yellow
ble-face -s syntax_history_expansion fg=141
ble-face -s syntax_function_name fg=4,bold
ble-face -s syntax_comment fg=242
ble-face -s syntax_glob fg=198,bold
ble-face -s syntax_brace fg=37,bold
ble-face -s syntax_tilde fg=navy,bold
ble-face -s syntax_document fg=94
ble-face -s syntax_document_begin fg=94,bold
ble-face -s command_builtin_dot fg=3,bold
ble-face -s command_builtin fg=3
ble-face -s command_alias fg=5
ble-face -s command_function fg=4
ble-face -s command_file fg=green
ble-face -s command_keyword fg=blue
ble-face -s command_jobs fg=red
ble-face -s command_directory fg=12
ble-face -s filename_directory fg=12
ble-face -s filename_directory_sticky fg=12
ble-face -s filename_link underline,fg=teal
ble-face -s filename_orphan underline,fg=teal,bg=224
ble-face -s filename_executable underline,fg=green
ble-face -s filename_setuid underline,fg=black,bg=220
ble-face -s filename_setgid underline,fg=black,bg=191
ble-face -s filename_other underline
ble-face -s filename_socket underline,fg=cyan,bg=black
ble-face -s filename_pipe underline,fg=lime,bg=black
ble-face -s filename_character underline,fg=white,bg=black
ble-face -s filename_block underline,fg=yellow,bg=black
ble-face -s filename_warning underline,fg=red
ble-face -s filename_url underline,fg=blue
ble-face -s filename_ls_colors underline
ble-face -s varname_array fg=orange,bold
ble-face -s varname_empty fg=31
ble-face -s varname_export fg=200,bold
ble-face -s varname_expr fg=92,bold
ble-face -s varname_hash fg=70,bold
ble-face -s varname_number fg=64
ble-face -s varname_readonly fg=200
ble-face -s varname_transform fg=29,bold
ble-face -s varname_unset fg=124
ble-face -s argument_option fg=teal
ble-face -s argument_error fg=black,bg=225
