### Globally installed packages  
  
run `npm list --depth=0` to view globally installed packages  
  
├── express-generator@4.15.0  
├── gulp@3.9.1  
├── istanbul@0.4.5  
├── jshint@2.9.5   
├── mocha@3.5.0   
├── n@2.1.8  
├── nodemon@1.11.0    
├── npm@4.1.2  
├── siege@0.2.0  
├── trucker@0.7.3  
└── webpack@3.4.1  
  
### External dependencies  
`MySQL v14.14`  
`Redis-Server v3.2.8`  
`gem v2.5.2 (for running ruby script to create redis cluster)`  


### Install instructions
`sudo apt-get update`
`printf '\n' | sudo add-apt-repository ppa:chris-lea/redis-server`
`sudo apt-get update`
`sudo apt-get -y install redis-server`
`sudo apt-get -y install mysql`
`sudo add-apt-repository universe`
`sudo apt-get update`
`sudo apt-get install npm`
`sudo apt-get install gem`
