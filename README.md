# Goal
Provide a progressive web app that provides useful information for newbies as well
as pro HAMs. The idea is to provide a quick way to access frequently used data
and display the data in an easily understanable way.

In order to provide the necessary data for this the project [api.hb9akm.ch](https://api.hb9akm.ch/) was
created.

# Priorities
* Get something up and running that solves a problem
* Make it nice
* Extend it over time

# Current state
The state of this project is closely tied to the state of [api.hb9akm.ch](https://api.hb9akm.ch/v1/) as this
is required as a data base. Therefore only CH voice repeaters are available yet.

Elevation data could be used to show the elevation profile between your location
and a repeater. See [api.hb9akm.ch issue #2](https://github.com/hb9akm/api/issues/2).

# Contribute
Contributions are encouraged. There are different ways to contribute:
* Contribute to [api.hb9akm.ch](https://github.com/hb9akm/api)
* [Report an issue](https://github.com/hb9akm/CompHAMion/issues)
* Create a pull-request. In this case please create an issue first!

# How to use it
There are several methods to use this app:
* Use the provided installation at [app.hb9akm.ch](https://app.hb9akm.ch/)
* Copy this repository's /src folder to any webserver
* Use docker. Example command to run in /src directory: docker run -d --rm --name=comphamion -p8088:80 -v "$PWD":/usr/local/apache2/htdocs/ httpd

# Technical infos
* Dependencies are kept as low as possible. The [VanillaJS](http://vanilla-js.com/) framework is used.
* To modularize the code it is split in to modules and pages. See
[/src/main.js](https://github.com/hb9akm/CompHAMion/blob/main/src/main.js).

# License
The code is provided as is, without any warranty under AGPLv3.
