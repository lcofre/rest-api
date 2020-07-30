# rest-api
Example REST API to illustrate access to the H2 database with Python Flask and NodeJS Express.

To run H2, the Java JRE needs to be installed. For example, on debian-like systems we can do:
```console
$ apt install openjdk-11-jre
```
Download the latest h2.jar from the [Maven Central Repository](https://search.maven.org/search?q=g:com.h2database). For example at the time of writing the latest version is 1.4.200:
```console
$ curl -L https://search.maven.org/remotecontent?filepath=com/h2database/h2/1.4.200/h2-1.4.200.jar > h2-1.4.200.jar
```
And run the database server with:
```console
$ java -cp ./h2-1.4.200.jar org.h2.tools.Server -tcp -tcpAllowOthers -tcpPort 5234 -baseDir ./ -ifNotExists
```

The easiest way to try the endpoints in both APIs is to use the [Swagger Editor with our API definition](https://editor.swagger.io/?url=https://raw.githubusercontent.com/lcofre/rest-api/master/exoplanets.yml). All endpoints have a "Try it out" button in the top right.

## Python
First create the virtual environment and install required  packages:
```console
$ virtualenv --python=python3 env
$ source env/bin/activate
(env) $ pip install -r python/requirements.txt
```

Then the api can be started with
```console
(env) $ python python/api.py
```

## Node.js
First install dependencies:
```console
$ cd node.js
$ npm install
```

Then start the API with:
```console
$ node api.js
```