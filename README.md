![](https://api.travis-ci.org/billxiong24/node-chat.svg?branch=travis)  ![](https://david-dm.org/billxiong24/node-chat.svg)  
  
    
# External dependencies  
`Node.js v7.6.0`
`npm v4.1.2`
`MySQL v14.14`  
`Redis-Server v3.2.8`  
`gem v2.5.2 (for running ruby script to create redis cluster)`  


# Installing external dependencies for Debian distros (tested on Ubuntu 16.04 LTS)
`sudo apt-get update`  
`sudo add-apt-repository ppa:chris-lea/redis-server`  
`sudo apt-get update`  
`sudo apt-get -y install redis-server`  
`sudo apt-get -y install mysql`  
`sudo add-apt-repository universe`  
`sudo apt-get update`  
`sudo apt-get install npm`  
`sudo apt-get install ruby`  
`sudo apt-get install gem`  
`sudo gem install redis`  
`sudo apt-get install git`  
`sudo apt-get install nodejs-legacy`, and use `n` to upgrade to `v7.6.0`  
    
# Installing npm dependencies  
#### Global dependencies  
Below are the global dependencies this project depends on.  
      
├── express-generator@4.15.0  
├── gulp@3.9.1  
├── istanbul@0.4.5  
├── jshint@2.9.5  
├── mocha@3.5.0  
├── n@2.1.8  
├── nodemon@1.11.0  
├── npm@4.1.2  
├── npm-check-updates@2.12.1  
├── siege@0.2.0  
├── trucker@0.7.3  
└── webpack@3.4.1  
  
#### Local dependencies  
run `npm install` to install local dependencies from `package.json`  

#### Dependency management  
run `npm list -g --depth=0` to view globally installed packages  
run `ncu -u` to view outdated dependencies  
run `npm update --save` to update outdated dependencies  

# Setting up the local environment
  
Make sure MySQL is running. `sudo service mysql start`  
To enable MySQL server at boot time, run `sudo systemctl enable`  
Make sure Redis is properly installed. `redis-cli -v` should output version number  
  
#### Environment variables  
A `.env` file at the root of the project is required for the project to run.  
`.env` bundles all the environment variables referenced by the project into a single file.  
  
The following variables are required:  
`HOST=localhost` - host  
`PORT=3000` - port to listen on (default is 3000)  
`NODE_USER=root` - mysql user   
`MAIL_USER` - gmail address with which emails are sent from (leave blank if desired)  
`MAIL_PASS` - password to above gmail address  
`PASS={{your mysql password}}`- this is the user password needed to access mysql (in this case, user is root, but can be any user/password)  
`REDIS_MSG_LIMIT=25` - maximum number of messages stored in a chat before the job queue flushes it to the database  
`REDIS_NUM_FLUSH=10` - number of messages to flush   
`LOCK_DRIFT_FACTOR=0.2` - expected clock drift in redlock      
`LOCK_RETRY_COUNT=15` - maximum number of times redlock attempts to acquire lock before throwing error  
`LOCK_RETRY_DELAY=250` - delay (in milliseconds) between lock acquire attempts  
`LOCK_RETRY_JITTER=100` - maximum time (in milliseconds) added randomly to lock acquire attempts to avoid high contention  
`CONN_LIMIT=5` - maximum number of mysql pooled connections  
`NODE_ENV="dev"` - node environment  
`env="dev"` - environment  

#### Tests
Run `./test.sh` in the root of the project. This will run the unit and integration tests.  
Make sure `test.sh` is executable. `chmod +x test.sh` 

#### Code coverage
Run `./test.sh cover` to run code coverage. Istanbul is used to generate coverage reports, which is located in a newly generated coverage/ directory.  

# Running project  
Run `./build.sh` to build project, install dependencies, bundle files, precompile Handlebar templates, run tests, etc.  
Make sure redis cluster and MySQL are running. If MySQL tables don't exist, run all the sql files in `app/databases`  
`cd run/ && ./run.sh`. Make sure run.sh is executable with `chmod +x run.sh`  
Go to `localhost:3000`  

# Monitoring file changes  

### gulp watch
Use `gulp watch` to monitor the following file changes. See `gulpfile.js` for information.  
##### Handlebars  
Since Handlebar templates are precompiled into a javascript file, any changes to template files requires recompiling.  

##### CSS files
CSS files are minifed and concatenated into a single, minified file, which requires any changes to css files to be updated in the minifed file.   
  
  
### webpack --watch 
Use `webpack --watch` to monitor the following file changes  
  
##### Javascript files in public/javascripts/  
These client javascript files use CommonJS module loader, which does not run natively in the browser. Therefore, `webpack` is used to bundle these  
files into javascript which can run on the browser. Any changes to any of these files requires `webpack` to rebundle the modules. `webpack --watch` will handle this  
automatically. View `webpack.config.js`.  
To create the bundled files, run `webpack` or `gulp webpack`.  
  
  
This README is still a very, very rough draft. I will continue to update it in the future.  
