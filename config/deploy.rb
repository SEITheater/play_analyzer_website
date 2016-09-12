# config valid only for Capistrano 3.4
lock '3.4.0'

set :application, 'kevinmkarol.com:'
set :repo_url, '/var/www/jekyll-website'
set :branch, 'master'

set :deploy_to, '/var/www/jekyll-website/_site'

set :scm, :git
set :branch, "master"
set :user, "root"
set :deploy_via, :copy

namespace :deploy do
  task :update_jekyll do
    on roles(:app) do
      within "#{deploy_to}/current" do
        execute "/usr/local/rvm/gems/ruby-version/wrappers/jekyll", "build"
      end
    end
  end
end

after "deploy:symlink:release", "deploy:update_jekyll"
