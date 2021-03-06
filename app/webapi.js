System.register("a2-in-memory-web-api/in-memory-backend.service", ["angular2/core", "angular2/http", "rxjs/Observable", "rxjs/add/operator/delay", "./http-status-codes"], function(exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var __param = (this && this.__param) || function(paramIndex, decorator) {
    return function(target, key) {
      decorator(target, key, paramIndex);
    };
  };
  var core_1,
      http_1,
      Observable_1,
      http_status_codes_1;
  var SEED_DATA,
      InMemoryBackendConfig,
      isSuccess,
      InMemoryBackendService;
  return {
    setters: [function(core_1_1) {
      core_1 = core_1_1;
    }, function(http_1_1) {
      http_1 = http_1_1;
    }, function(Observable_1_1) {
      Observable_1 = Observable_1_1;
    }, function(_1) {}, function(http_status_codes_1_1) {
      http_status_codes_1 = http_status_codes_1_1;
    }],
    execute: function() {
      exports_1("SEED_DATA", SEED_DATA = new core_1.OpaqueToken('seedData'));
      InMemoryBackendConfig = (function() {
        function InMemoryBackendConfig(config) {
          if (config === void 0) {
            config = {};
          }
          Object.assign(this, {
            defaultResponseOptions: new http_1.BaseResponseOptions(),
            delay: 500,
            delete404: false
          }, config);
        }
        return InMemoryBackendConfig;
      }());
      exports_1("InMemoryBackendConfig", InMemoryBackendConfig);
      exports_1("isSuccess", isSuccess = function(status) {
        return (status >= 200 && status < 300);
      });
      InMemoryBackendService = (function() {
        function InMemoryBackendService(_seedData, config) {
          this._seedData = _seedData;
          this._config = new InMemoryBackendConfig();
          this._resetDb();
          var loc = this._getLocation('./');
          this._config.host = loc.host;
          this._config.rootPath = loc.pathname;
          Object.assign(this._config, config);
        }
        InMemoryBackendService.prototype.createConnection = function(req) {
          var res = this._handleRequest(req);
          var response = new Observable_1.Observable(function(responseObserver) {
            if (isSuccess(res.status)) {
              responseObserver.next(res);
              responseObserver.complete();
            } else {
              responseObserver.error(res);
            }
            return function() {};
          });
          response = response.delay(this._config.delay || 500);
          return {response: response};
        };
        InMemoryBackendService.prototype._handleRequest = function(req) {
          var _a = this._parseUrl(req.url),
              base = _a.base,
              collectionName = _a.collectionName,
              id = _a.id,
              resourceUrl = _a.resourceUrl;
          var reqInfo = {
            req: req,
            base: base,
            collection: this._db[collectionName],
            collectionName: collectionName,
            headers: new http_1.Headers({"Content-Type": "application/json"}),
            id: this._parseId(id),
            resourceUrl: resourceUrl
          };
          var options;
          try {
            if ("commands" === reqInfo.base.toLowerCase()) {
              options = this._commands(reqInfo);
            } else if (reqInfo.collection) {
              switch (req.method) {
                case http_1.RequestMethod.Get:
                  options = this._get(reqInfo);
                  break;
                case http_1.RequestMethod.Post:
                  options = this._post(reqInfo);
                  break;
                case http_1.RequestMethod.Put:
                  options = this._put(reqInfo);
                  break;
                case http_1.RequestMethod.Delete:
                  options = this._delete(reqInfo);
                  break;
                default:
                  options = this._createErrorResponse(http_status_codes_1.STATUS.METHOD_NOT_ALLOWED, "Method not allowed");
                  break;
              }
            } else {
              options = this._createErrorResponse(http_status_codes_1.STATUS.NOT_FOUND, "Collection \"" + collectionName + "\" not found");
            }
          } catch (error) {
            var err = error.message || error;
            options = this._createErrorResponse(http_status_codes_1.STATUS.INTERNAL_SERVER_ERROR, "" + err);
          }
          options = this._setStatusText(options);
          if (this._config.defaultResponseOptions) {
            options = this._config.defaultResponseOptions.merge(options);
          }
          return new http_1.Response(options);
        };
        InMemoryBackendService.prototype._clone = function(data) {
          return JSON.parse(JSON.stringify(data));
        };
        InMemoryBackendService.prototype._commands = function(reqInfo) {
          var command = reqInfo.collectionName.toLowerCase();
          var method = reqInfo.req.method;
          var options;
          switch (command) {
            case 'resetdb':
              this._resetDb();
              options = new http_1.ResponseOptions({status: http_status_codes_1.STATUS.OK});
              break;
            case 'config':
              if (method === http_1.RequestMethod.Get) {
                options = new http_1.ResponseOptions({
                  body: this._clone(this._config),
                  status: http_status_codes_1.STATUS.OK
                });
              } else {
                var body = JSON.parse(reqInfo.req.text() || '{}');
                Object.assign(this._config, body);
                options = new http_1.ResponseOptions({status: http_status_codes_1.STATUS.NO_CONTENT});
              }
            default:
              options = this._createErrorResponse(http_status_codes_1.STATUS.INTERNAL_SERVER_ERROR, "Unknown command \"" + command + "\"");
          }
          return options;
        };
        InMemoryBackendService.prototype._createErrorResponse = function(status, message) {
          return new http_1.ResponseOptions({
            body: {"error": "" + message},
            headers: new http_1.Headers({"Content-Type": "application/json"}),
            status: status
          });
        };
        InMemoryBackendService.prototype._delete = function(_a) {
          var id = _a.id,
              collection = _a.collection,
              collectionName = _a.collectionName,
              headers = _a.headers,
              req = _a.req;
          if (!id) {
            return this._createErrorResponse(http_status_codes_1.STATUS.NOT_FOUND, "Missing \"" + collectionName + "\" id");
          }
          var exists = this._removeById(collection, id);
          return new http_1.ResponseOptions({
            headers: headers,
            status: (exists || !this._config.delete404) ? http_status_codes_1.STATUS.NO_CONTENT : http_status_codes_1.STATUS.NOT_FOUND
          });
        };
        InMemoryBackendService.prototype._findById = function(collection, id) {
          return collection.find(function(item) {
            return item.id === id;
          });
        };
        InMemoryBackendService.prototype._genId = function(collection) {
          var maxId = 0;
          collection.reduce(function(prev, item) {
            maxId = Math.max(maxId, typeof item.id === 'number' ? item.id : maxId);
          }, null);
          return maxId + 1;
        };
        InMemoryBackendService.prototype._get = function(_a) {
          var id = _a.id,
              collection = _a.collection,
              collectionName = _a.collectionName,
              headers = _a.headers;
          var data = (id) ? this._findById(collection, id) : collection;
          if (!data) {
            return this._createErrorResponse(http_status_codes_1.STATUS.NOT_FOUND, "\"" + collectionName + "\" with id=\"" + id + "\" not found");
          }
          return new http_1.ResponseOptions({
            body: {data: this._clone(data)},
            headers: headers,
            status: http_status_codes_1.STATUS.OK
          });
        };
        InMemoryBackendService.prototype._getLocation = function(href) {
          var l = document.createElement('a');
          l.href = href;
          return l;
        };
        ;
        InMemoryBackendService.prototype._indexOf = function(collection, id) {
          return collection.findIndex(function(item) {
            return item.id == id;
          });
        };
        InMemoryBackendService.prototype._parseId = function(id) {
          if (!id) {
            return null;
          }
          var idNum = parseInt(id, 10);
          return isNaN(idNum) ? id : idNum;
        };
        InMemoryBackendService.prototype._parseUrl = function(url) {
          try {
            var loc = this._getLocation(url);
            var drop = this._config.rootPath.length;
            var urlRoot = '';
            if (loc.host !== this._config.host) {
              drop = 1;
              urlRoot = loc.protocol + '//' + loc.host + '/';
            }
            var path = loc.pathname.substring(drop);
            var _a = path.split('/'),
                base = _a[0],
                collectionName = _a[1],
                id = _a[2];
            var resourceUrl = urlRoot + base + '/' + collectionName + '/';
            collectionName = collectionName.split('.')[0];
            return {
              base: base,
              id: id,
              collectionName: collectionName,
              resourceUrl: resourceUrl
            };
          } catch (err) {
            var msg = "unable to parse url \"" + url + "\"; original error: " + err.message;
            throw new Error(msg);
          }
        };
        InMemoryBackendService.prototype._post = function(_a) {
          var collection = _a.collection,
              collectionName = _a.collectionName,
              headers = _a.headers,
              id = _a.id,
              req = _a.req,
              resourceUrl = _a.resourceUrl;
          var item = JSON.parse(req.text());
          if (!item.id) {
            item.id = id || this._genId(collection);
          }
          id = item.id;
          var existingIx = this._indexOf(collection, id);
          if (existingIx > -1) {
            collection[existingIx] = item;
            return new http_1.ResponseOptions({
              headers: headers,
              status: http_status_codes_1.STATUS.NO_CONTENT
            });
          } else {
            collection.push(item);
            headers.set('Location', resourceUrl + '/' + id);
            return new http_1.ResponseOptions({
              headers: headers,
              body: {data: this._clone(item)},
              status: http_status_codes_1.STATUS.CREATED
            });
          }
        };
        InMemoryBackendService.prototype._put = function(_a) {
          var id = _a.id,
              collection = _a.collection,
              collectionName = _a.collectionName,
              headers = _a.headers,
              req = _a.req;
          var item = JSON.parse(req.text());
          if (!id) {
            return this._createErrorResponse(http_status_codes_1.STATUS.NOT_FOUND, "Missing \"" + collectionName + "\" id");
          }
          if (id != item.id) {
            return this._createErrorResponse(http_status_codes_1.STATUS.BAD_REQUEST, "\"" + collectionName + "\" id does not match item.id");
          }
          var existingIx = this._indexOf(collection, id);
          if (existingIx > -1) {
            collection[existingIx] = item;
            return new http_1.ResponseOptions({
              headers: headers,
              status: http_status_codes_1.STATUS.NO_CONTENT
            });
          } else {
            collection.push(item);
            return new http_1.ResponseOptions({
              body: {data: this._clone(item)},
              headers: headers,
              status: http_status_codes_1.STATUS.CREATED
            });
          }
        };
        InMemoryBackendService.prototype._removeById = function(collection, id) {
          var ix = this._indexOf(collection, id);
          if (ix > -1) {
            collection.splice(ix, 1);
            return true;
          }
          return false;
        };
        InMemoryBackendService.prototype._resetDb = function() {
          this._db = this._seedData.createDb();
        };
        InMemoryBackendService.prototype._setStatusText = function(options) {
          try {
            var statusCode = http_status_codes_1.STATUS_CODE_INFO[options.status];
            options['statusText'] = statusCode ? statusCode.text : 'Unknown Status';
            return options;
          } catch (err) {
            return new http_1.ResponseOptions({
              status: http_status_codes_1.STATUS.INTERNAL_SERVER_ERROR,
              statusText: 'Invalid Server Operation'
            });
          }
        };
        InMemoryBackendService = __decorate([__param(0, core_1.Inject(SEED_DATA)), __param(1, core_1.Inject(InMemoryBackendConfig)), __param(1, core_1.Optional()), __metadata('design:paramtypes', [Object, Object])], InMemoryBackendService);
        return InMemoryBackendService;
      }());
      exports_1("InMemoryBackendService", InMemoryBackendService);
    }
  };
});

System.register("a2-in-memory-web-api/http-status-codes", [], function(exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  var STATUS,
      STATUS_CODE_INFO;
  return {
    setters: [],
    execute: function() {
      exports_1("STATUS", STATUS = {
        CONTINUE: 100,
        SWITCHING_PROTOCOLS: 101,
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NON_AUTHORITATIVE_INFORMATION: 203,
        NO_CONTENT: 204,
        RESET_CONTENT: 205,
        PARTIAL_CONTENT: 206,
        MULTIPLE_CHOICES: 300,
        MOVED_PERMANTENTLY: 301,
        FOUND: 302,
        SEE_OTHER: 303,
        NOT_MODIFIED: 304,
        USE_PROXY: 305,
        TEMPORARY_REDIRECT: 307,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        PAYMENT_REQUIRED: 402,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        NOT_ACCEPTABLE: 406,
        PROXY_AUTHENTICATION_REQUIRED: 407,
        REQUEST_TIMEOUT: 408,
        CONFLICT: 409,
        GONE: 410,
        LENGTH_REQUIRED: 411,
        PRECONDITION_FAILED: 412,
        PAYLOAD_TO_LARGE: 413,
        URI_TOO_LONG: 414,
        UNSUPPORTED_MEDIA_TYPE: 415,
        RANGE_NOT_SATISFIABLE: 416,
        EXPECTATION_FAILED: 417,
        IM_A_TEAPOT: 418,
        UPGRADE_REQUIRED: 426,
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
        HTTP_VERSION_NOT_SUPPORTED: 505,
        PROCESSING: 102,
        MULTI_STATUS: 207,
        IM_USED: 226,
        PERMANENT_REDIRECT: 308,
        UNPROCESSABLE_ENTRY: 422,
        LOCKED: 423,
        FAILED_DEPENDENCY: 424,
        PRECONDITION_REQUIRED: 428,
        TOO_MANY_REQUESTS: 429,
        REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
        UNAVAILABLE_FOR_LEGAL_REASONS: 451,
        VARIANT_ALSO_NEGOTIATES: 506,
        INSUFFICIENT_STORAGE: 507,
        NETWORK_AUTHENTICATION_REQUIRED: 511
      });
      exports_1("STATUS_CODE_INFO", STATUS_CODE_INFO = {
        "100": {
          "code": 100,
          "text": "Continue",
          "description": "\"The initial part of a request has been received and has not yet been rejected by the server.\"",
          "spec_title": "RFC7231#6.2.1",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.2.1"
        },
        "101": {
          "code": 101,
          "text": "Switching Protocols",
          "description": "\"The server understands and is willing to comply with the client's request, via the Upgrade header field, for a change in the application protocol being used on this connection.\"",
          "spec_title": "RFC7231#6.2.2",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.2.2"
        },
        "200": {
          "code": 200,
          "text": "OK",
          "description": "\"The request has succeeded.\"",
          "spec_title": "RFC7231#6.3.1",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.3.1"
        },
        "201": {
          "code": 201,
          "text": "Created",
          "description": "\"The request has been fulfilled and has resulted in one or more new resources being created.\"",
          "spec_title": "RFC7231#6.3.2",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.3.2"
        },
        "202": {
          "code": 202,
          "text": "Accepted",
          "description": "\"The request has been accepted for processing, but the processing has not been completed.\"",
          "spec_title": "RFC7231#6.3.3",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.3.3"
        },
        "203": {
          "code": 203,
          "text": "Non-Authoritative Information",
          "description": "\"The request was successful but the enclosed payload has been modified from that of the origin server's 200 (OK) response by a transforming proxy.\"",
          "spec_title": "RFC7231#6.3.4",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.3.4"
        },
        "204": {
          "code": 204,
          "text": "No Content",
          "description": "\"The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.\"",
          "spec_title": "RFC7231#6.3.5",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.3.5"
        },
        "205": {
          "code": 205,
          "text": "Reset Content",
          "description": "\"The server has fulfilled the request and desires that the user agent reset the \"document view\", which caused the request to be sent, to its original state as received from the origin server.\"",
          "spec_title": "RFC7231#6.3.6",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.3.6"
        },
        "206": {
          "code": 206,
          "text": "Partial Content",
          "description": "\"The server is successfully fulfilling a range request for the target resource by transferring one or more parts of the selected representation that correspond to the satisfiable ranges found in the requests's Range header field.\"",
          "spec_title": "RFC7233#4.1",
          "spec_href": "http://tools.ietf.org/html/rfc7233#section-4.1"
        },
        "300": {
          "code": 300,
          "text": "Multiple Choices",
          "description": "\"The target resource has more than one representation, each with its own more specific identifier, and information about the alternatives is being provided so that the user (or user agent) can select a preferred representation by redirecting its request to one or more of those identifiers.\"",
          "spec_title": "RFC7231#6.4.1",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.4.1"
        },
        "301": {
          "code": 301,
          "text": "Moved Permanently",
          "description": "\"The target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs.\"",
          "spec_title": "RFC7231#6.4.2",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.4.2"
        },
        "302": {
          "code": 302,
          "text": "Found",
          "description": "\"The target resource resides temporarily under a different URI.\"",
          "spec_title": "RFC7231#6.4.3",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.4.3"
        },
        "303": {
          "code": 303,
          "text": "See Other",
          "description": "\"The server is redirecting the user agent to a different resource, as indicated by a URI in the Location header field, that is intended to provide an indirect response to the original request.\"",
          "spec_title": "RFC7231#6.4.4",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.4.4"
        },
        "304": {
          "code": 304,
          "text": "Not Modified",
          "description": "\"A conditional GET request has been received and would have resulted in a 200 (OK) response if it were not for the fact that the condition has evaluated to false.\"",
          "spec_title": "RFC7232#4.1",
          "spec_href": "http://tools.ietf.org/html/rfc7232#section-4.1"
        },
        "305": {
          "code": 305,
          "text": "Use Proxy",
          "description": "*deprecated*",
          "spec_title": "RFC7231#6.4.5",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.4.5"
        },
        "307": {
          "code": 307,
          "text": "Temporary Redirect",
          "description": "\"The target resource resides temporarily under a different URI and the user agent MUST NOT change the request method if it performs an automatic redirection to that URI.\"",
          "spec_title": "RFC7231#6.4.7",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.4.7"
        },
        "400": {
          "code": 400,
          "text": "Bad Request",
          "description": "\"The server cannot or will not process the request because the received syntax is invalid, nonsensical, or exceeds some limitation on what the server is willing to process.\"",
          "spec_title": "RFC7231#6.5.1",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.1"
        },
        "401": {
          "code": 401,
          "text": "Unauthorized",
          "description": "\"The request has not been applied because it lacks valid authentication credentials for the target resource.\"",
          "spec_title": "RFC7235#6.3.1",
          "spec_href": "http://tools.ietf.org/html/rfc7235#section-3.1"
        },
        "402": {
          "code": 402,
          "text": "Payment Required",
          "description": "*reserved*",
          "spec_title": "RFC7231#6.5.2",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.2"
        },
        "403": {
          "code": 403,
          "text": "Forbidden",
          "description": "\"The server understood the request but refuses to authorize it.\"",
          "spec_title": "RFC7231#6.5.3",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.3"
        },
        "404": {
          "code": 404,
          "text": "Not Found",
          "description": "\"The origin server did not find a current representation for the target resource or is not willing to disclose that one exists.\"",
          "spec_title": "RFC7231#6.5.4",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.4"
        },
        "405": {
          "code": 405,
          "text": "Method Not Allowed",
          "description": "\"The method specified in the request-line is known by the origin server but not supported by the target resource.\"",
          "spec_title": "RFC7231#6.5.5",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.5"
        },
        "406": {
          "code": 406,
          "text": "Not Acceptable",
          "description": "\"The target resource does not have a current representation that would be acceptable to the user agent, according to the proactive negotiation header fields received in the request, and the server is unwilling to supply a default representation.\"",
          "spec_title": "RFC7231#6.5.6",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.6"
        },
        "407": {
          "code": 407,
          "text": "Proxy Authentication Required",
          "description": "\"The client needs to authenticate itself in order to use a proxy.\"",
          "spec_title": "RFC7231#6.3.2",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.3.2"
        },
        "408": {
          "code": 408,
          "text": "Request Timeout",
          "description": "\"The server did not receive a complete request message within the time that it was prepared to wait.\"",
          "spec_title": "RFC7231#6.5.7",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.7"
        },
        "409": {
          "code": 409,
          "text": "Conflict",
          "description": "\"The request could not be completed due to a conflict with the current state of the resource.\"",
          "spec_title": "RFC7231#6.5.8",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.8"
        },
        "410": {
          "code": 410,
          "text": "Gone",
          "description": "\"Access to the target resource is no longer available at the origin server and that this condition is likely to be permanent.\"",
          "spec_title": "RFC7231#6.5.9",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.9"
        },
        "411": {
          "code": 411,
          "text": "Length Required",
          "description": "\"The server refuses to accept the request without a defined Content-Length.\"",
          "spec_title": "RFC7231#6.5.10",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.10"
        },
        "412": {
          "code": 412,
          "text": "Precondition Failed",
          "description": "\"One or more preconditions given in the request header fields evaluated to false when tested on the server.\"",
          "spec_title": "RFC7232#4.2",
          "spec_href": "http://tools.ietf.org/html/rfc7232#section-4.2"
        },
        "413": {
          "code": 413,
          "text": "Payload Too Large",
          "description": "\"The server is refusing to process a request because the request payload is larger than the server is willing or able to process.\"",
          "spec_title": "RFC7231#6.5.11",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.11"
        },
        "414": {
          "code": 414,
          "text": "URI Too Long",
          "description": "\"The server is refusing to service the request because the request-target is longer than the server is willing to interpret.\"",
          "spec_title": "RFC7231#6.5.12",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.12"
        },
        "415": {
          "code": 415,
          "text": "Unsupported Media Type",
          "description": "\"The origin server is refusing to service the request because the payload is in a format not supported by the target resource for this method.\"",
          "spec_title": "RFC7231#6.5.13",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.13"
        },
        "416": {
          "code": 416,
          "text": "Range Not Satisfiable",
          "description": "\"None of the ranges in the request's Range header field overlap the current extent of the selected resource or that the set of ranges requested has been rejected due to invalid ranges or an excessive request of small or overlapping ranges.\"",
          "spec_title": "RFC7233#4.4",
          "spec_href": "http://tools.ietf.org/html/rfc7233#section-4.4"
        },
        "417": {
          "code": 417,
          "text": "Expectation Failed",
          "description": "\"The expectation given in the request's Expect header field could not be met by at least one of the inbound servers.\"",
          "spec_title": "RFC7231#6.5.14",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.14"
        },
        "418": {
          "code": 418,
          "text": "I'm a teapot",
          "description": "\"1988 April Fools Joke. Returned by tea pots requested to brew coffee.\"",
          "spec_title": "RFC 2324",
          "spec_href": "https://tools.ietf.org/html/rfc2324"
        },
        "426": {
          "code": 426,
          "text": "Upgrade Required",
          "description": "\"The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.\"",
          "spec_title": "RFC7231#6.5.15",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.5.15"
        },
        "500": {
          "code": 500,
          "text": "Internal Server Error",
          "description": "\"The server encountered an unexpected condition that prevented it from fulfilling the request.\"",
          "spec_title": "RFC7231#6.6.1",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.6.1"
        },
        "501": {
          "code": 501,
          "text": "Not Implemented",
          "description": "\"The server does not support the functionality required to fulfill the request.\"",
          "spec_title": "RFC7231#6.6.2",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.6.2"
        },
        "502": {
          "code": 502,
          "text": "Bad Gateway",
          "description": "\"The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request.\"",
          "spec_title": "RFC7231#6.6.3",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.6.3"
        },
        "503": {
          "code": 503,
          "text": "Service Unavailable",
          "description": "\"The server is currently unable to handle the request due to a temporary overload or scheduled maintenance, which will likely be alleviated after some delay.\"",
          "spec_title": "RFC7231#6.6.4",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.6.4"
        },
        "504": {
          "code": 504,
          "text": "Gateway Time-out",
          "description": "\"The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server it needed to access in order to complete the request.\"",
          "spec_title": "RFC7231#6.6.5",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.6.5"
        },
        "505": {
          "code": 505,
          "text": "HTTP Version Not Supported",
          "description": "\"The server does not support, or refuses to support, the protocol version that was used in the request message.\"",
          "spec_title": "RFC7231#6.6.6",
          "spec_href": "http://tools.ietf.org/html/rfc7231#section-6.6.6"
        },
        "102": {
          "code": 102,
          "text": "Processing",
          "description": "\"An interim response to inform the client that the server has accepted the complete request, but has not yet completed it.\"",
          "spec_title": "RFC5218#10.1",
          "spec_href": "http://tools.ietf.org/html/rfc2518#section-10.1"
        },
        "207": {
          "code": 207,
          "text": "Multi-Status",
          "description": "\"Status for multiple independent operations.\"",
          "spec_title": "RFC5218#10.2",
          "spec_href": "http://tools.ietf.org/html/rfc2518#section-10.2"
        },
        "226": {
          "code": 226,
          "text": "IM Used",
          "description": "\"The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.\"",
          "spec_title": "RFC3229#10.4.1",
          "spec_href": "http://tools.ietf.org/html/rfc3229#section-10.4.1"
        },
        "308": {
          "code": 308,
          "text": "Permanent Redirect",
          "description": "\"The target resource has been assigned a new permanent URI and any future references to this resource SHOULD use one of the returned URIs. [...] This status code is similar to 301 Moved Permanently (Section 7.3.2 of rfc7231), except that it does not allow rewriting the request method from POST to GET.\"",
          "spec_title": "RFC7238",
          "spec_href": "http://tools.ietf.org/html/rfc7238"
        },
        "422": {
          "code": 422,
          "text": "Unprocessable Entity",
          "description": "\"The server understands the content type of the request entity (hence a 415(Unsupported Media Type) status code is inappropriate), and the syntax of the request entity is correct (thus a 400 (Bad Request) status code is inappropriate) but was unable to process the contained instructions.\"",
          "spec_title": "RFC5218#10.3",
          "spec_href": "http://tools.ietf.org/html/rfc2518#section-10.3"
        },
        "423": {
          "code": 423,
          "text": "Locked",
          "description": "\"The source or destination resource of a method is locked.\"",
          "spec_title": "RFC5218#10.4",
          "spec_href": "http://tools.ietf.org/html/rfc2518#section-10.4"
        },
        "424": {
          "code": 424,
          "text": "Failed Dependency",
          "description": "\"The method could not be performed on the resource because the requested action depended on another action and that action failed.\"",
          "spec_title": "RFC5218#10.5",
          "spec_href": "http://tools.ietf.org/html/rfc2518#section-10.5"
        },
        "428": {
          "code": 428,
          "text": "Precondition Required",
          "description": "\"The origin server requires the request to be conditional.\"",
          "spec_title": "RFC6585#3",
          "spec_href": "http://tools.ietf.org/html/rfc6585#section-3"
        },
        "429": {
          "code": 429,
          "text": "Too Many Requests",
          "description": "\"The user has sent too many requests in a given amount of time (\"rate limiting\").\"",
          "spec_title": "RFC6585#4",
          "spec_href": "http://tools.ietf.org/html/rfc6585#section-4"
        },
        "431": {
          "code": 431,
          "text": "Request Header Fields Too Large",
          "description": "\"The server is unwilling to process the request because its header fields are too large.\"",
          "spec_title": "RFC6585#5",
          "spec_href": "http://tools.ietf.org/html/rfc6585#section-5"
        },
        "451": {
          "code": 451,
          "text": "Unavailable For Legal Reasons",
          "description": "\"The server is denying access to the resource in response to a legal demand.\"",
          "spec_title": "draft-ietf-httpbis-legally-restricted-status",
          "spec_href": "http://tools.ietf.org/html/draft-ietf-httpbis-legally-restricted-status"
        },
        "506": {
          "code": 506,
          "text": "Variant Also Negotiates",
          "description": "\"The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.\"",
          "spec_title": "RFC2295#8.1",
          "spec_href": "http://tools.ietf.org/html/rfc2295#section-8.1"
        },
        "507": {
          "code": 507,
          "text": "Insufficient Storage",
          "description": "\The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.\"",
          "spec_title": "RFC5218#10.6",
          "spec_href": "http://tools.ietf.org/html/rfc2518#section-10.6"
        },
        "511": {
          "code": 511,
          "text": "Network Authentication Required",
          "description": "\"The client needs to authenticate to gain network access.\"",
          "spec_title": "RFC6585#6",
          "spec_href": "http://tools.ietf.org/html/rfc6585#section-6"
        }
      });
    }
  };
});

System.register("a2-in-memory-web-api/core", ["./in-memory-backend.service", "./http-status-codes"], function(exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  function exportStar_1(m) {
    var exports = {};
    for (var n in m) {
      if (n !== "default")
        exports[n] = m[n];
    }
    exports_1(exports);
  }
  return {
    setters: [function(in_memory_backend_service_1_1) {
      exportStar_1(in_memory_backend_service_1_1);
    }, function(http_status_codes_1_1) {
      exportStar_1(http_status_codes_1_1);
    }],
    execute: function() {}
  };
});