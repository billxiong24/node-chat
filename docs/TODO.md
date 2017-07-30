### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| app.js | 125 | load testing does not work anymore because of csrf token
| gulpfile.js | 124 | ({
| gulpfile.js | 167 | local host password shouldnot be here, but o well
| routes/index.js | 77 | check email verified middleware
| test/models.js | 205 | for some reason this test does not work well with others
| test/testfile.js | 226 | should redirect home, but don't know how to tell if home is reached
| app/models/line.js | 73 | duplicated code here but im too lazy
| app/models/user_cache.js | 159 | assuming user in cache, since user has just logged in- risky but low chance of anything otherwise
| app/models/user_manager.js | 14 | refactor this to use redis promises (bluebird)
| app/sockets/chatSocket.js | 69 | violates open close principle
| public/javascripts/chatViewModel.js | 86 | quick hack, since no viewmodel currently holds votes
| public/javascripts/bundle/chat_bundle.js | 835 | sometimes socket drops connection for whatever fukcing reason
| public/javascripts/bundle/chat_bundle.js | 961 | quick hack, since no viewmodel currently holds votes
| public/javascripts/bundle/chat_bundle.js | 1043 | this is ratchet as fuck omg
| public/javascripts/bundle/home_bundle.js | 285 | quick hack, since no viewmodel currently holds votes
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

### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| gulpfile.js | 23 | precompile handlebars,
| routes/index.js | 53 | send email conf here
| routes/index.js | 63 | test this extensively
| routes/index.js | 65 | set confirmed to true in both cache and database
| routes/index.js | 69 | render some error page
| test/models.js | 29 | mock fakeredis so we can test messages properly
| test/models.js | 30 | create testing database environment
| test/models.js | 44 | check cache to see exists
| test/models.js | 63 | check cache to see exists
| test/testfile.js | 101 | check for accuracy, too lazy rn
| test/testfile.js | 126 | test 1 with memberof, and one without
| app/cache/cache_store.js | 14 | data sharding with these ports
| app/chat_functions/chat_manager.js | 12 | use async library to make things more asynchronous
| app/chat_functions/chat_manager.js | 22 | error checking
| app/chat_functions/chat_manager.js | 58 | error message
| app/chat_functions/chat_manager.js | 74 | add error message here
| app/chat_functions/chat_manager.js | 109 | Pass in callback here
| app/models/chat.js | 221 | need real error handling here
| app/models/line_cache.js | 18 | maybe throw custom exception
| app/models/line_cache.js | 27 | test this method, it most likely does not work
| app/models/user_cache.js | 63 | need real error handling here
| app/models/user_cache.js | 110 | function works, add user back to cache if not in
| app/sockets/chatSocket.js | 72 | find a way to cache this
| app/sockets/chatSocket.js | 77 | refactor back into above method, quick hack
| app/sockets/notifSocket.js | 24 | add this data to cache- contains {userid, notif, roomID}
| app/sockets/voteSocket.js | 22 | fix check if user voted already
| app/sockets/voteSocket.js | 33 | update vote value in redis if user did not vote yet
| app/workers/message_cache_monitor.js | 18 | changed max number of completed jobs before cleaning
| app/workers/process_queue.js | 92 | use reduce to take in an array of callbacks
| app/authentication/user-pass.js | 157 | add stronger password checker
| app/authentication/user-pass.js | 159 | less lazy error message lmao
| public/javascripts/chatViewModel.js | 1 | organize this using some frontend framework
| public/javascripts/chat_render.js | 59 | organize ajax calls
| public/javascripts/chat_render.js | 152 | dont hardcode this, okay for now
| routes/chats/chats.js | 62 | find a way to test this, since we are resetting members every time in the test
| routes/chats/chats.js | 76 | include error message to pass to view
| public/javascripts/bundle/chat_bundle.js | 105 | organize ajax calls
| public/javascripts/bundle/chat_bundle.js | 198 | dont hardcode this, okay for now
| public/javascripts/bundle/chat_bundle.js | 643 | refactor joinRoom in chatview to a super class or something
| public/javascripts/bundle/chat_bundle.js | 738 | fix dis timestamp
| public/javascripts/bundle/chat_bundle.js | 790 | numMessages should be extracted from here
| public/javascripts/bundle/chat_bundle.js | 802 | clean this up
| public/javascripts/bundle/chat_bundle.js | 876 | organize this using some frontend framework
| public/javascripts/bundle/chat_bundle.js | 1027 | refactor joinRoom in voteview to a super class or something
| public/javascripts/bundle/home_bundle.js | 63 | set up other important information, such as chat lists
| public/javascripts/bundle/home_bundle.js | 200 | organize this using some frontend framework
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