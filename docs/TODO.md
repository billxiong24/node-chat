### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| gulpfile.js | 25 | precompile handlebars,
| routes/index.js | 69 | test this extensively
| routes/index.js | 71 | set confirmed to true in both cache and database
| routes/index.js | 75 | render some error page
| test/models.js | 31 | create testing database environment
| test/models.js | 45 | check cache to see exists
| test/models.js | 65 | check cache to see exists
| test/testfile.js | 103 | check for accuracy, too lazy rn
| test/testfile.js | 128 | test 1 with memberof, and one without
| app/authentication/user-pass.js | 39 | verify session token as well
| app/authentication/user-pass.js | 181 | add stronger password checker
| app/authentication/user-pass.js | 183 | less lazy error message lmao
| app/cache/cache_store.js | 1 | Look into issue: Asynchronous AOF fsync is taking too long (disk is busy?). Writing the AOF buffer without
| app/chat_functions/chat_manager.js | 13 | use async library to make things more asynchronous
| app/chat_functions/chat_manager.js | 21 | error checking
| app/chat_functions/chat_manager.js | 65 | error message
| app/chat_functions/chat_manager.js | 89 | add error message here
| app/chat_functions/chat_manager.js | 121 | Pass in callback here
| app/database/config.js | 3 | need to consolidate release connections in connection.js
| app/database/connection.js | 34 | release connection in one place
| app/models/chat.js | 215 | need real error handling here
| app/models/line_cache.js | 19 | maybe throw custom exception
| app/models/line_cache.js | 28 | test this method, it most likely does not work
| app/models/user_cache.js | 12 | USE TRANSACTION for multiple redis commands for atomicity
| app/models/user_cache.js | 30 | avoid having to open a connection(small optimization)
| app/models/user_cache.js | 80 | need real error handling here
| app/models/user_cache.js | 130 | function works, add user back to cache if not in
| app/search/chat_search_manager.js | 17 | add suggestions to body
| app/search/search_info_generate.js | 19 | generate index and types for user data
| app/search/search_manager.js | 43 | error handle
| app/search/search_manager.js | 49 | override in subclass
| app/sockets/chatSocket.js | 91 | refactor back into above method, quick hack
| app/sockets/notifSocket.js | 22 | add this data to cache- contains {userid, notif, roomID}
| app/sockets/voteSocket.js | 23 | fix check if user voted already
| app/sockets/voteSocket.js | 35 | update vote value in redis if user did not vote yet
| app/workers/message_cache_monitor.js | 19 | changed max number of completed jobs before cleaning
| app/workers/process_queue.js | 100 | use reduce to take in an array of callbacks
| microservices/chat/chat_service.js | 26 | error check for null
| public/javascripts/chatViewModel.js | 1 | organize this using some frontend framework
| public/javascripts/chat_render.js | 59 | organize ajax calls
| public/javascripts/chat_render.js | 148 | dont hardcode this, okay for now
| public/javascripts/settings.js | 1 | need a password util to validate password
| public/javascripts/settings.js | 14 | update result in UI
| public/javascripts/settings.js | 20 | update errors in UI, too lazy
| routes/chats/chats.js | 107 | include error message to pass to view
| routes/chats/chats.js | 138 | find a way to test this, since we are resetting members every time in the test
| routes/chats/chats.js | 153 | include error message to pass to view
| routes/chats/chats.js | 231 | use microservice
| public/javascripts/bundle/chat_bundle.js | 105 | organize ajax calls
| public/javascripts/bundle/chat_bundle.js | 194 | dont hardcode this, okay for now
| public/javascripts/bundle/chat_bundle.js | 639 | refactor joinRoom in chatview to a super class or something
| public/javascripts/bundle/chat_bundle.js | 734 | fix dis timestamp
| public/javascripts/bundle/chat_bundle.js | 786 | numMessages should be extracted from here
| public/javascripts/bundle/chat_bundle.js | 798 | clean this up
| public/javascripts/bundle/chat_bundle.js | 872 | organize this using some frontend framework
| public/javascripts/bundle/chat_bundle.js | 1024 | refactor joinRoom in voteview to a super class or something
| public/javascripts/bundle/home_bundle.js | 68 | set up other important information, such as chat lists
| public/javascripts/bundle/home_bundle.js | 85 | ajax call to server
| public/javascripts/bundle/home_bundle.js | 99 | some success here
| public/javascripts/bundle/home_bundle.js | 314 | organize this using some frontend framework
| public/javascripts/bundle/settings_bundle.js | 47 | need a password util to validate password
| public/javascripts/bundle/settings_bundle.js | 60 | update result in UI
| public/javascripts/bundle/settings_bundle.js | 66 | update errors in UI, too lazy
| public/javascripts/bundle/signup_success_bundle.js | 57 | update the view here
| public/javascripts/viewmodel/chatview.js | 14 | refactor joinRoom in chatview to a super class or something
| public/javascripts/viewmodel/chatview.js | 109 | fix dis timestamp
| public/javascripts/viewmodel/onlineview.js | 29 | numMessages should be extracted from here
| public/javascripts/viewmodel/onlineview.js | 41 | clean this up
| public/javascripts/viewmodel/votingview.js | 6 | refactor joinRoom in voteview to a super class or something
| public/javascripts/socket.io-adapter/node_modules/debug/browser.js | 37 | add a `localStorage` variable to explicitly enable/disable colors
| public/javascripts/socket.io/node_modules/debug/src/browser.js | 36 | add a `localStorage` variable to explicitly enable/disable colors
| public/javascripts/socket.io-client/node_modules/debug/src/browser.js | 36 | add a `localStorage` variable to explicitly enable/disable colors
| public/javascripts/socket.io-parser/node_modules/debug/src/browser.js | 36 | add a `localStorage` variable to explicitly enable/disable colors

### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| gulpfile.js | 127 | ({
| gulpfile.js | 170 | local host password shouldnot be here, but o well
| routes/index.js | 86 | check email verified middleware
| run/app.js | 138 | load testing does not work anymore because of csrf token
| test/models.js | 223 | for some reason this test does not work well with others
| test/testfile.js | 229 | should redirect home, but don't know how to tell if home is reached
| app/models/line.js | 74 | duplicated code here but im too lazy
| app/models/user_cache.js | 219 | assuming user in cache, since user has just logged in- risky but low chance of anything otherwise
| app/models/user_manager.js | 22 | refactor this to use redis promises (bluebird)
| app/sockets/chatSocket.js | 75 | violates open close principle
| app/workers/process_queue.js | 16 | accessing this from cache_store throws error- as usual, no idea why
| public/javascripts/chatViewModel.js | 87 | quick hack, since no viewmodel currently holds votes
| public/javascripts/bundle/chat_bundle.js | 831 | sometimes socket drops connection for whatever fukcing reason
| public/javascripts/bundle/chat_bundle.js | 958 | quick hack, since no viewmodel currently holds votes
| public/javascripts/bundle/chat_bundle.js | 1040 | this is ratchet as fuck omg
| public/javascripts/bundle/home_bundle.js | 400 | quick hack, since no viewmodel currently holds votes
| public/javascripts/viewmodel/onlineview.js | 74 | sometimes socket drops connection for whatever fukcing reason
| public/javascripts/viewmodel/votingview.js | 22 | this is ratchet as fuck omg
| public/javascripts/socket.io-adapter/node_modules/debug/node.js | 181 | Should probably have an option in net.Socket to create a
| public/javascripts/socket.io-adapter/node_modules/debug/node.js | 189 | Hack to have stream not keep the event loop alive.
| public/javascripts/socket.io/node_modules/debug/src/node.js | 198 | Should probably have an option in net.Socket to create a
| public/javascripts/socket.io/node_modules/debug/src/node.js | 206 | Hack to have stream not keep the event loop alive.
| public/javascripts/socket.io-client/node_modules/debug/src/node.js | 198 | Should probably have an option in net.Socket to create a
| public/javascripts/socket.io-client/node_modules/debug/src/node.js | 206 | Hack to have stream not keep the event loop alive.
| public/javascripts/socket.io-parser/node_modules/debug/src/node.js | 198 | Should probably have an option in net.Socket to create a
| public/javascripts/socket.io-parser/node_modules/debug/src/node.js | 206 | Hack to have stream not keep the event loop alive.