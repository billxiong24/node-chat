#include <stdio.h>
#include <hiredis/async.h>
#include <signal.h>
#include <stdlib.h>
#include <event2/event.h>
#include <hiredis/adapters/libevent.h>

//__HIREDIS_READ_H will already be defined, just for reference
#ifndef __HIREDIS_READ_H
#define __HIREDIS_READ_H

#define REDIS_REPLY_STRING 1
#define REDIS_REPLY_ARRAY 2
#define REDIS_REPLY_INTEGER 3
#define REDIS_REPLY_NIL 4
#define REDIS_REPLY_STATUS 5
#define REDIS_REPLY_ERROR 6

#endif

void callback_message(redisAsyncContext *, void *reply, void *priv_data);

int main(void) {
    
    struct event_base *event = event_base_new();

    redisAsyncContext *context = redisAsyncConnect("localhost", 6379);
    if(!context || context->err) {
        puts("Connection error.");
        redisAsyncFree(context);
        exit(1);
    }

    redisLibeventAttach(context, event);

    redisAsyncCommand(context, callback_message, NULL, "SUBSCRIBE test");
    event_base_dispatch(event);


    event_base_free(event);
    redisAsyncFree(context);
    
    return 0;
}

//not sure what priv_data is for, but everything needed is in reply
void callback_message(redisAsyncContext *context, void *reply, void *priv_data) {
    //only need to cast from void * if dereferencing
    redisReply *replied = (redisReply *) reply;
    
    if(!replied) {
        return;
    }

    printf("replied %d \n", replied->type);
    //if array and subscribed, then array will be length 3
    if(replied->type == REDIS_REPLY_ARRAY) {
        if(replied->elements == 3) {
            printf("receieved %s \n", replied->element[2]->str);
        }
    }
}
