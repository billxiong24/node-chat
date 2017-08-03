### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| gulpfile.js | 23 | precompile handlebars,
| routes/index.js | 68 | test this extensively
| routes/index.js | 70 | set confirmed to true in both cache and database
| routes/index.js | 74 | render some error page
| test/models.js | 29 | mock fakeredis so we can test messages properly
| test/models.js | 30 | create testing database environment
| test/models.js | 44 | check cache to see exists
| test/models.js | 63 | check cache to see exists
| test/testfile.js | 101 | check for accuracy, too lazy rn
| test/testfile.js | 126 | test 1 with memberof, and one without
| app/authentication/user-pass.js | 37 | verify session token as well
| app/authentication/user-pass.js | 171 | add stronger password checker
| app/authentication/user-pass.js | 173 | less lazy error message lmao
| app/cache/cache_store.js | 15 | data sharding with these ports
| app/chat_functions/chat_manager.js | 12 | use async library to make things more asynchronous
| app/chat_functions/chat_manager.js | 22 | error checking
| app/chat_functions/chat_manager.js | 58 | error message
| app/chat_functions/chat_manager.js | 74 | add error message here
| app/chat_functions/chat_manager.js | 109 | Pass in callback here
| app/models/chat.js | 221 | need real error handling here
| app/models/line_cache.js | 18 | maybe throw custom exception
| app/models/line_cache.js | 27 | test this method, it most likely does not work
| app/models/user_cache.js | 75 | need real error handling here
| app/models/user_cache.js | 125 | function works, add user back to cache if not in
| app/sockets/chatSocket.js | 72 | find a way to cache this
| app/sockets/chatSocket.js | 77 | refactor back into above method, quick hack
| app/sockets/notifSocket.js | 24 | add this data to cache- contains {userid, notif, roomID}
| app/sockets/voteSocket.js | 22 | fix check if user voted already
| app/sockets/voteSocket.js | 33 | update vote value in redis if user did not vote yet
| app/workers/message_cache_monitor.js | 18 | changed max number of completed jobs before cleaning
| app/workers/process_queue.js | 92 | use reduce to take in an array of callbacks
| public/javascripts/chatViewModel.js | 1 | organize this using some frontend framework
| public/javascripts/chat_render.js | 59 | organize ajax calls
| public/javascripts/chat_render.js | 148 | dont hardcode this, okay for now
| public/javascripts/settings.js | 1 | need a password util to validate password
| public/javascripts/settings.js | 14 | update result in UI
| public/javascripts/settings.js | 20 | update errors in UI, too lazy
| routes/chats/chats.js | 57 | find a way to test this, since we are resetting members every time in the test
| routes/chats/chats.js | 71 | include error message to pass to view
| public/javascripts/bundle/chat_bundle.js | 105 | organize ajax calls
| public/javascripts/bundle/chat_bundle.js | 194 | dont hardcode this, okay for now
| public/javascripts/bundle/chat_bundle.js | 639 | refactor joinRoom in chatview to a super class or something
| public/javascripts/bundle/chat_bundle.js | 734 | fix dis timestamp
| public/javascripts/bundle/chat_bundle.js | 786 | numMessages should be extracted from here
| public/javascripts/bundle/chat_bundle.js | 798 | clean this up
| public/javascripts/bundle/chat_bundle.js | 872 | organize this using some frontend framework
| public/javascripts/bundle/chat_bundle.js | 1024 | refactor joinRoom in voteview to a super class or something
| public/javascripts/bundle/home_bundle.js | 63 | set up other important information, such as chat lists
| public/javascripts/bundle/home_bundle.js | 200 | organize this using some frontend framework
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
| gulpfile.js | 124 | ({
| gulpfile.js | 167 | local host password shouldnot be here, but o well
| routes/index.js | 82 | check email verified middleware
| run/app.js | 127 | load testing does not work anymore because of csrf token
| test/models.js | 205 | for some reason this test does not work well with others
| test/testfile.js | 224 | should redirect home, but don't know how to tell if home is reached
| app/chat_functions/chat_manager.js | 136 | modify stamp should be outside the function, maybe in a callback
| app/models/line.js | 73 | duplicated code here but im too lazy
| app/models/user_cache.js | 207 | assuming user in cache, since user has just logged in- risky but low chance of anything otherwise
| app/models/user_manager.js | 14 | refactor this to use redis promises (bluebird)
| app/sockets/chatSocket.js | 69 | violates open close principle
| public/javascripts/chatViewModel.js | 87 | quick hack, since no viewmodel currently holds votes
| public/javascripts/bundle/chat_bundle.js | 831 | sometimes socket drops connection for whatever fukcing reason
| public/javascripts/bundle/chat_bundle.js | 958 | quick hack, since no viewmodel currently holds votes
| public/javascripts/bundle/chat_bundle.js | 1040 | this is ratchet as fuck omg
| public/javascripts/bundle/home_bundle.js | 286 | quick hack, since no viewmodel currently holds votes
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