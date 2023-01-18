- http/v1/service/learn.json

https://developer.hashicorp.com/consul/tutorials/developer-discovery/service-registration-external-services#register-an-external-service-with-a-health-check


- http/v1/catalog/register/hashicorp.json

  This file is used to [register an external service](https://developer.hashicorp.com/consul/tutorials/developer-discovery/service-registration-external-services#register-an-internal-service-with-a-health-check)
  with Consul via the `/catalog/register` endpoing.  An external service runs on
  nodes where a local Consul agent cannot be run (such as a third-party SaaS
  platform).

  $ curl --request PUT --data @test/data/http/v1/catalog/register/hashicorp.json localhost:8500/v1/catalog/register
  