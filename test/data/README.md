- [`http/v1/catalog/node/hashicorp.json`](http/v1/catalog/node/hashicorp.json)

  This file contains the response from the [`/catalog/node/:node_name`](https://developer.hashicorp.com/consul/api-docs/catalog#retrieve-map-of-services-for-a-node)
  endpoint, after [registering an external service](https://developer.hashicorp.com/consul/tutorials/developer-discovery/service-registration-external-services#register-an-external-service-with-a-health-check).

- [`http/v1/catalog/register/hashicorp.json`](http/v1/catalog/register/hashicorp.json)

  This file is used to [register an external service](https://developer.hashicorp.com/consul/tutorials/developer-discovery/service-registration-external-services#register-an-external-service-with-a-health-check)
  with Consul via the `/catalog/register` endpoint.  An external service runs on
  nodes where a local Consul agent cannot be run (such as a third-party SaaS
  platform).
  
  This service can be registered with Consul from the command line:

  ```bash
  $ curl --request PUT --data @test/data/http/v1/catalog/register/hashicorp.json localhost:8500/v1/catalog/register
  ```

- [`http/v1/catalog/service/learn.json`](http/v1/catalog/service/learn.json)

  This file contains the response from the [`/catalog/service/:service_name`](https://developer.hashicorp.com/consul/api-docs/catalog#list-nodes-for-service)
  endpoint, after [registering an external service](https://developer.hashicorp.com/consul/tutorials/developer-discovery/service-registration-external-services#register-an-external-service-with-a-health-check).
