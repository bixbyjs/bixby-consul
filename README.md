# bixby-ns-consul

https://developer.hashicorp.com/consul/tutorials/get-started-vms/virtual-machine-gs-deploy

$ ./consul agent -bind=127.0.0.1 -data-dir=./var
$ ./consul agent -bind=127.0.0.1 -data-dir=./var -server
$ ./consul agent -bind=127.0.0.1 -data-dir=./var -server -bootstrap

$ consul members

NOTE: Has a key/value store for config

$ dig @127.0.0.1 -p 8600 consul.service.consul