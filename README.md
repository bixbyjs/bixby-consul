# bixby-consul

Consul components for the Bixby framework.

[Consul](https://www.consul.io) is a service networking platform that securely
connects applications.

<div align="right">
  <sup>Developed by <a href="#authors">Jared Hanson</a>.</sub>
</div>


https://developer.hashicorp.com/consul/tutorials/get-started-vms/virtual-machine-gs-deploy

$ ./consul agent -bind=127.0.0.1 -data-dir=./var
$ ./consul agent -bind=127.0.0.1 -data-dir=./var -server
$ ./consul agent -bind=127.0.0.1 -data-dir=./var -server -bootstrap

$ consul members

NOTE: Has a key/value store for config

$ dig @127.0.0.1 -p 8600 consul.service.consul

## Authors

- [Jared Hanson](https://www.jaredhanson.me/) { [![WWW](https://raw.githubusercontent.com/jaredhanson/jaredhanson/master/images/globe-12x12.svg)](https://www.jaredhanson.me/) [![Facebook](https://raw.githubusercontent.com/jaredhanson/jaredhanson/master/images/facebook-12x12.svg)](https://www.facebook.com/jaredhanson) [![LinkedIn](https://raw.githubusercontent.com/jaredhanson/jaredhanson/master/images/linkedin-12x12.svg)](https://www.linkedin.com/in/jaredhanson) [![Twitter](https://raw.githubusercontent.com/jaredhanson/jaredhanson/master/images/twitter-12x12.svg)](https://twitter.com/jaredhanson) [![GitHub](https://raw.githubusercontent.com/jaredhanson/jaredhanson/master/images/github-12x12.svg)](https://github.com/jaredhanson) }

## License

[The MIT License](https://opensource.org/licenses/MIT)

Copyright (c) Jared Hanson
