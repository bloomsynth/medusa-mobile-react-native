source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 2.6.10"

# Exclude problematic versions of cocoapods that cause build failures.
gem 'cocoapods', '>= 1.13', '!= 1.15.0', '!= 1.15.1'
# Security fixes. Active Support 7.2 loads Logger itself, so the old
# concurrent-ruby < 1.3.4 workaround is no longer needed.
gem 'activesupport', '>= 7.2.3.1'
gem 'xcodeproj', '< 1.26.0'
gem 'concurrent-ruby', '>= 1.3.7'

# Ruby 3.4.0 has removed some libraries from the standard library.
gem 'bigdecimal'
gem 'logger'
gem 'benchmark'
gem 'mutex_m'
gem 'nkf'
