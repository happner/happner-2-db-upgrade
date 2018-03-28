happn-3 db upgrade test
------------------------

We start up an old server, save permissions to the db run some permissions test, then start up a new server, with autoUpdateDBVersion:true - which will autoshard existing permissions, we then run the same permissions check tests to ensure the sharding worked

The profiler stores the tests that will be run in ./__resources/client/tests - adding any mocha tests here will result in them being run as part of the process, you can use all the mocha goodness of .only and x etc. to only profile certain tests.

Instructions for use:

```

> npm install

#node run [client version] [previous server version] [latest server version] [repeat test and dump]

> node run 7.0.0-beta.1 6.2.0 7.0.0-beta.1

```