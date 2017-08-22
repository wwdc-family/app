source "https://rubygems.org"

gem "fastlane", ">= 2.26.1", git: "https://github.com/fastlane/fastlane", branch: "circle"

plugins_path = File.join(File.dirname(__FILE__), 'ios', 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
