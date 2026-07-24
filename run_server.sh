#!/bin/zsh
source /opt/homebrew/opt/chruby/share/chruby/chruby.sh
chruby ruby-3.1.6
ruby -v
which ruby
bundle install
bundle exec jekyll serve --livereload
