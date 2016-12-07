/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Enable actions-on-google debug logging
process.env.DEBUG = 'actions-on-google:*';

/**
 * Test suite for the actions client library.
 */
let winston = require('winston');
let expect = require('chai').expect;
let Assistant = require('.././actions-on-google');
let ApiAiAssistant = Assistant.ApiAiAssistant;
let ActionsSdkAssistant = Assistant.ActionsSdkAssistant;

// Default logger
winston.loggers.add('DEFAULT_LOGGER', {
  console: {
    level: 'error',
    colorize: true,
    label: 'Default logger',
    json: true,
    timestamp: true
  }
});

function MockRequest (headers, body) {
  if (headers) {
    this.headers = headers;
  } else {
    this.headers = {};
  }
  if (body) {
    this.body = body;
  } else {
    this.body = {};
  }
}
MockRequest.prototype.get = function (header) {
  return this.headers[header];
};

function MockResponse () {
  this.statusCode = 200;
  this.headers = {};
}
MockResponse.prototype.status = function (statusCode) {
  this.statusCode = statusCode;
  return this;
};
MockResponse.prototype.send = function (body) {
  this.body = body;
  return this;
};
MockResponse.prototype.append = function (header, value) {
  this.headers[header] = value;
  return this;
};

// ---------------------------------------------------------------------------
//                   API.ai support
// ---------------------------------------------------------------------------

/**
 * Describes the behavior for ApiAiAssistant tell method.
 */
describe('ApiAiAssistant#tell', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'google-assistant-api-version': 'v1'
    };
    let body = {
      'id': 'ce7295cc-b042-42d8-8d72-14b83597ac1e',
      'timestamp': '2016-10-28T03:05:34.288Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'start guess a number game',
        'speech': '',
        'action': 'generate_answer',
        'actionIncomplete': false,
        'parameters': {

        },
        'contexts': [
          {
            'name': 'game',
            'lifespan': 5
          }
        ],
        'metadata': {
          'intentId': '56da4637-0419-46b2-b851-d7bf726b1b1b',
          'webhookUsed': 'true',
          'intentName': 'start_game'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({request: mockRequest, response: mockResponse});

    function handler (assistant) {
      return new Promise(function (resolve, reject) {
        resolve(assistant.tell('hello'));
      });
    }

    let actionMap = new Map();
    actionMap.set('generate_answer', handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'speech': 'hello',
      'data': {
        'google': {
          'expect_user_response': false,
          'is_ssml': false,
          'no_input_prompts': [

          ]
        }
      },
      contextOut: [

      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ApiAiAssistant ask method.
 */
describe('ApiAiAssistant#ask', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'id': '9c4394e3-4f5a-4e68-b1af-088b75ad3071',
      'timestamp': '2016-10-28T03:41:39.957Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': '50',
        'speech': '',
        'action': 'check_guess',
        'actionIncomplete': false,
        'parameters': {
          'guess': '50'
        },
        'contexts': [
          {
            'name': 'game',
            'parameters': {
              'guess.original': '50',
              'guess': '50'
            },
            'lifespan': 5
          },
          {
            'name': '_assistant_',
            'parameters': {
              'answer': 68,
              'guess.original': '50',
              'guess': '50'
            },
            'lifespan': 99
          }
        ],
        'metadata': {
          'intentId': '1e46ffc2-651f-4ac0-a54e-9698feb88880',
          'webhookUsed': 'true',
          'intentName': 'provide_guess'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    function handler (assistant) {
      return new Promise(function (resolve, reject) {
        resolve(assistant.ask('hello'));
      });
    }

    let actionMap = new Map();
    actionMap.set('check_guess', handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'speech': 'hello',
      'data': {
        'google': {
          'expect_user_response': true,
          'is_ssml': false,
          'no_input_prompts': []
        }
      },
      'contextOut': [
        {
          'name': '_actions_on_google_',
          'lifespan': 100,
          'parameters': {}
        }
      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ApiAiAssistant askForPermissions method.
 */
describe('ApiAiAssistant#askForPermissions', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {'Content-Type': 'application/json', 'google-assistant-api-version': 'v1'};
    let body = {
      'id': '9c4394e3-4f5a-4e68-b1af-088b75ad3071',
      'timestamp': '2016-10-28T03:41:39.957Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'Where am I?',
        'speech': '',
        'action': 'get_permission',
        'actionIncomplete': false,
        'parameters': {},
        'contexts': [],
        'metadata': {
          'intentId': '1e46ffc2-651f-4ac0-a54e-9698feb88880',
          'webhookUsed': 'true',
          'intentName': 'give_permission'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({request: mockRequest, response: mockResponse});

    function handler (assistant) {
      return new Promise(function (resolve, reject) {
        resolve(assistant.askForPermissions('To test', ['NAME', 'DEVICE_PRECISE_LOCATION']));
      });
    }

    let actionMap = new Map();
    actionMap.set('get_permission', handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'speech': 'PLACEHOLDER_FOR_PERMISSION',
      'data': {
        'google': {
          'expect_user_response': true,
          'is_ssml': false,
          'no_input_prompts': [],
          'permissions_request': {
            'opt_context': 'To test',
            'permissions': ['NAME', 'DEVICE_PRECISE_LOCATION']
          }
        }
      },
      'contextOut': [
        {
          'name': '_actions_on_google_',
          'lifespan': 100,
          'parameters': {}
        }
      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ApiAiAssistant getUser method.
 */
describe('ApiAiAssistant#getUser', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request user.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'google-assistant-api-version': 'v1'
    };
    let body = {
      'id': 'ce7295cc-b042-42d8-8d72-14b83597ac1e',
      'timestamp': '2016-10-28T03:05:34.288Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'start guess a number game',
        'speech': '',
        'action': 'generate_answer',
        'actionIncomplete': false,
        'parameters': {

        },
        'contexts': [

        ],
        'metadata': {
          'intentId': '56da4637-0419-46b2-b851-d7bf726b1b1b',
          'webhookUsed': 'true',
          'intentName': 'start_game'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': {
        'data': {
          'user': {
            'user_id': '11112226094657824893'
          }
        }
      }
    };

    let mockRequest = new MockRequest(headers, body);
    let mockResponse = new MockResponse();

    let assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getUser().user_id).to.equal('11112226094657824893');
  });
});

/**
 * Describes the behavior for ApiAiAssistant getUserName method.
 */
describe('ApiAiAssistant#getUserName', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request user.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'google-assistant-api-version': 'v1'
    };
    let body = {
      'id': 'ce7295cc-b042-42d8-8d72-14b83597ac1e',
      'timestamp': '2016-10-28T03:05:34.288Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'start guess a number game',
        'speech': '',
        'action': 'generate_answer',
        'actionIncomplete': false,
        'parameters': {

        },
        'contexts': [

        ],
        'metadata': {
          'intentId': '56da4637-0419-46b2-b851-d7bf726b1b1b',
          'webhookUsed': 'true',
          'intentName': 'start_game'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': {
        'data': {
          'user': {
            'user_id': '11112226094657824893',
            'profile': {
              'display_name': 'John Smith',
              'given_name': 'John',
              'family_name': 'Smith'
            }
          }
        }
      }
    };
    let mockRequest = new MockRequest(headers, body);
    let mockResponse = new MockResponse();

    let assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getUserName().displayName).to.equal('John Smith');
    expect(assistant.getUserName().givenName).to.equal('John');
    expect(assistant.getUserName().familyName).to.equal('Smith');

    // Test the false case

    body.originalRequest.data.user.profile = undefined;

    mockRequest = new MockRequest(headers, body);
    mockResponse = new MockResponse();

    assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getUserName()).to.equal(null);
  });
});

/**
 * Describes the behavior for ApiAiAssistant getDeviceLocation method.
 */
describe('ApiAiAssistant#getDeviceLocation', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request user.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'google-assistant-api-version': 'v1'
    };
    let body = {
      'id': 'ce7295cc-b042-42d8-8d72-14b83597ac1e',
      'timestamp': '2016-10-28T03:05:34.288Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'start guess a number game',
        'speech': '',
        'action': 'generate_answer',
        'actionIncomplete': false,
        'parameters': {

        },
        'contexts': [

        ],
        'metadata': {
          'intentId': '56da4637-0419-46b2-b851-d7bf726b1b1b',
          'webhookUsed': 'true',
          'intentName': 'start_game'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': {
        'data': {
          'user': {
            'user_id': '11112226094657824893'
          },
          'device': {
            'location': {
              'coordinates': {
                'latitude': 37.3861,
                'longitude': 122.0839
              },
              'formatted_address': '123 Main St, Anytown, CA 12345, United States',
              'zip_code': '12345',
              'city': 'Anytown'
            }
          }
        }
      }
    };

    let mockRequest = new MockRequest(headers, body);
    let mockResponse = new MockResponse();

    let assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getDeviceLocation().coordinates).to.deep.equal({
      latitude: 37.3861,
      longitude: 122.0839
    });
    expect(assistant.getDeviceLocation().address)
      .to.equal('123 Main St, Anytown, CA 12345, United States');
    expect(assistant.getDeviceLocation().zipCode).to.equal('12345');
    expect(assistant.getDeviceLocation().city).to.equal('Anytown');

    // Test the false case

    body.originalRequest.data.device = undefined;

    mockRequest = new MockRequest(headers, body);
    mockResponse = new MockResponse();

    assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getDeviceLocation()).to.equal(null);
  });
});

/**
 * Describes the behavior for ApiAiAssistant isPermissionGranted method.
 */
describe('ApiAiAssistant#isPermissionGranted', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request user.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'google-assistant-api-version': 'v1'
    };
    let body = {
      'id': 'ce7295cc-b042-42d8-8d72-14b83597ac1e',
      'timestamp': '2016-10-28T03:05:34.288Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'start guess a number game',
        'speech': '',
        'action': 'generate_answer',
        'actionIncomplete': false,
        'parameters': {

        },
        'contexts': [

        ],
        'metadata': {
          'intentId': '56da4637-0419-46b2-b851-d7bf726b1b1b',
          'webhookUsed': 'true',
          'intentName': 'start_game'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': {
        'data': {
          'inputs': [{
            'arguments': [{
              'name': 'permission_granted',
              'text_value': 'true'
            }]
          }]
        }
      }
    };

    let mockRequest = new MockRequest(headers, body);
    let mockResponse = new MockResponse();

    let assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.isPermissionGranted()).to.equal(true);

    // Test the false case

    body.originalRequest.data.inputs[0].arguments[0].text_value = false;

    mockRequest = new MockRequest(headers, body);
    mockResponse = new MockResponse();

    assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.isPermissionGranted()).to.equal(false);
  });
});

/**
 * Describes the behavior for ApiAiAssistant getIntent method.
 */
describe('ApiAiAssistant#getIntent', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should get the intent value for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'id': '9c4394e3-4f5a-4e68-b1af-088b75ad3071',
      'timestamp': '2016-10-28T03:41:39.957Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': '50',
        'speech': '',
        'action': 'check_guess',
        'actionIncomplete': false,
        'parameters': {
          'guess': '50'
        },
        'contexts': [
          {
            'name': 'game',
            'parameters': {
              'guess.original': '50',
              'guess': '50'
            },
            'lifespan': 5
          },
          {
            'name': '_assistant_',
            'parameters': {
              'answer': 68,
              'guess.original': '50',
              'guess': '50'
            },
            'lifespan': 99
          }
        ],
        'metadata': {
          'intentId': '1e46ffc2-651f-4ac0-a54e-9698feb88880',
          'webhookUsed': 'true',
          'intentName': 'provide_guess'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getIntent()).to.equal('check_guess');
  });
});

/**
 * Describes the behavior for ApiAiAssistant getArgument method.
 */
describe('ApiAiAssistant#getArgument', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should get the argument value for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'id': '9c4394e3-4f5a-4e68-b1af-088b75ad3071',
      'timestamp': '2016-10-28T03:41:39.957Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': '50',
        'speech': '',
        'action': 'check_guess',
        'actionIncomplete': false,
        'parameters': {
          'guess': '50'
        },
        'contexts': [
          {
            'name': 'game',
            'parameters': {
              'guess.original': '50',
              'guess': '50'
            },
            'lifespan': 5
          },
          {
            'name': '_assistant_',
            'parameters': {
              'answer': 68,
              'guess.original': '50',
              'guess': '50'
            },
            'lifespan': 99
          }
        ],
        'metadata': {
          'intentId': '1e46ffc2-651f-4ac0-a54e-9698feb88880',
          'webhookUsed': 'true',
          'intentName': 'provide_guess'
        },
        'fulfillment': {
          'speech': ''
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'e420f007-501d-4bc8-b551-5d97772bc50c',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getArgument('guess')).to.equal('50');
  });
});

/**
 * Describes the behavior for ApiAiAssistant isRequestFromApiAi method.
 */
describe('ApiAiAssistant#isRequestFromApiAi', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should confirm request is from API.ai.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1',
      'Google-Assistant-Signature': 'YOUR_PRIVATE_KEY'
    };
    let body = {
      'id': '93ada919-582d-4694-a965-4278453a6503',
      'timestamp': '2016-12-01T17:36:16.886Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'talk to action snippets',
        'speech': '',
        'action': 'input.welcome',
        'actionIncomplete': false,
        'parameters': {

        },
        'contexts': [
          {
            'name': 'number',
            'lifespan': 5
          },
          {
            'name': '_actions_on_google_',
            'lifespan': 99
          }
        ],
        'metadata': {
          'intentId': '1b1f35cb-ef66-41c4-9703-89446c00cfe8',
          'webhookUsed': 'true',
          'webhookForSlotFillingUsed': 'false',
          'intentName': 'Default Welcome Intent'
        },
        'fulfillment': {
          'speech': 'Good day!',
          'messages': [
            {
              'type': 0,
              'speech': 'Hello!'
            }
          ]
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'f23e77a5-8b09-495d-b9b3-6835d737abf3',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const HEADER_KEY = 'Google-Assistant-Signature';
    const HEADER_VALUE = 'YOUR_PRIVATE_KEY';

    expect(assistant.isRequestFromApiAi(HEADER_KEY, HEADER_VALUE)).to.equal(true);
  });
});

/**
 * Describes the behavior for ApiAiAssistant isRequestFromApiAi method.
 */
describe('ApiAiAssistant#isRequestFromApiAi', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should confirm request is NOT from API.ai.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480373842830',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to hello action'
            }
          ],
          'arguments': [
            {
              'name': 'agent_info'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const HEADER_KEY = 'Google-Assistant-Signature';
    const HEADER_VALUE = 'YOUR_PRIVATE_KEY';

    expect(assistant.isRequestFromApiAi(HEADER_KEY, HEADER_VALUE)).to.equal(false);
  });
});

/**
 * Describes the behavior for ApiAiAssistant getRawInput method.
 */
describe('ApiAiAssistant#getRawInput', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should raw input from API.ai.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1',
      'Google-Assistant-Signature': 'YOUR_PRIVATE_KEY'
    };
    let body = {
      'id': 'fdeca0bc-264a-4152-81fe-7d3c3d92bdfb',
      'timestamp': '2016-12-01T19:02:49.021Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'is it 667',
        'speech': '',
        'action': 'input.number',
        'actionIncomplete': false,
        'parameters': {
          'number': '667'
        },
        'contexts': [
          {
            'name': 'number',
            'parameters': {
              'number': '667',
              'number.original': '667'
            },
            'lifespan': 5
          },
          {
            'name': '_actions_on_google_',
            'parameters': {
              'number': '667',
              'number.original': '667'
            },
            'lifespan': 99
          }
        ],
        'metadata': {
          'intentId': '18ac04d6-9e5d-43ae-ab46-7b51a8658746',
          'webhookUsed': 'true',
          'webhookForSlotFillingUsed': 'false',
          'intentName': 'number_intent'
        },
        'fulfillment': {
          'speech': '',
          'messages': [
            {
              'type': 0,
              'speech': ''
            }
          ]
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'f23e77a5-8b09-495d-b9b3-6835d737abf3',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getRawInput()).to.equal('is it 667');
  });
});

/**
 * Describes the behavior for ApiAiAssistant setContext method.
 */
describe('ApiAiAssistant#setContext', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'id': '4bef6e67-c09d-4a43-ae7b-97c4457582c7',
      'timestamp': '2016-12-01T19:27:58.837Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'talk to action snippets',
        'speech': '',
        'action': 'input.welcome',
        'actionIncomplete': false,
        'parameters': {

        },
        'contexts': [
          {
            'name': 'number',
            'lifespan': 5
          }
        ],
        'metadata': {
          'intentId': '1b1f35cb-ef66-41c4-9703-89446c00cfe8',
          'webhookUsed': 'true',
          'webhookForSlotFillingUsed': 'false',
          'intentName': 'Default Welcome Intent'
        },
        'fulfillment': {
          'speech': 'Good day!',
          'messages': [
            {
              'type': 0,
              'speech': 'Hi!'
            }
          ]
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'f23e77a5-8b09-495d-b9b3-6835d737abf3',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const CONTEXT_NUMBER = 'number';

    function handler (assistant) {
      assistant.setContext(CONTEXT_NUMBER);
      assistant.ask('Welcome to action snippets! Say a number.');
    }

    let actionMap = new Map();
    actionMap.set('input.welcome', handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'speech': 'Welcome to action snippets! Say a number.',
      'data': {
        'google': {
          'expect_user_response': true,
          'is_ssml': false,
          'no_input_prompts': [

          ]
        }
      },
      'contextOut': [
        {
          'name': '_actions_on_google_',
          'lifespan': 100,
          'parameters': {

          }
        },
        {
          'name': 'number',
          'lifespan': 1
        }
      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ApiAiAssistant ask with no inputs method.
 */
describe('ApiAiAssistant#ask', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'id': '2a8b7faa-29c0-4ccf-a973-726f9eaf3e2c',
      'timestamp': '2016-12-04T18:34:31.218Z',
      'result': {
        'source': 'agent',
        'resolvedQuery': 'talk to action snippets',
        'speech': '',
        'action': 'input.welcome',
        'actionIncomplete': false,
        'parameters': {

        },
        'contexts': [
          {
            'name': 'number',
            'parameters': {

            },
            'lifespan': 5
          },
          {
            'name': '_actions_on_google_',
            'parameters': {

            },
            'lifespan': 99
          }
        ],
        'metadata': {
          'intentId': '1b1f35cb-ef66-41c4-9703-89446c00cfe8',
          'webhookUsed': 'true',
          'webhookForSlotFillingUsed': 'false',
          'intentName': 'Default Welcome Intent'
        },
        'fulfillment': {
          'speech': 'Hello!',
          'messages': [
            {
              'type': 0,
              'speech': 'Hello!'
            }
          ]
        },
        'score': 1
      },
      'status': {
        'code': 200,
        'errorType': 'success'
      },
      'sessionId': 'f23e77a5-8b09-495d-b9b3-6835d737abf3',
      'originalRequest': null
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ApiAiAssistant({
      request: mockRequest,
      response: mockResponse
    });

    function handler (assistant) {
      assistant.ask('Welcome to action snippets! Say a number.',
        ['Say any number', 'Pick a number', 'What is the number?']);
    }

    let actionMap = new Map();
    actionMap.set('input.welcome', handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'speech': 'Welcome to action snippets! Say a number.',
      'data': {
        'google': {
          'expect_user_response': true,
          'is_ssml': false,
          'no_input_prompts': [
            {
              'text_to_speech': 'Say any number'
            },
            {
              'text_to_speech': 'Pick a number'
            },
            {
              'text_to_speech': 'What is the number?'
            }
          ]
        }
      },
      'contextOut': [
        {
          'name': '_actions_on_google_',
          'lifespan': 100,
          'parameters': {

          }
        }
      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

// ---------------------------------------------------------------------------
//                   Actions SDK support
// ---------------------------------------------------------------------------

/**
 * Describes the behavior for ActionsSdkAssistant ask method.
 */
describe('ActionsSdkAssistant#ask', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480373842830',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to hello action'
            }
          ],
          'arguments': [
            {
              'name': 'agent_info'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const RAW_INTENT = 'raw.input';

    function handler (assistant) {
      return new Promise(function (resolve, reject) {
        let inputPrompt = assistant.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
          'I can read out an ordinal like ' +
          '<say-as interpret-as="ordinal">123</say-as></speak>');
        let expectedIntent = assistant.buildExpectedIntent(RAW_INTENT);
        resolve(assistant.ask(inputPrompt, [expectedIntent]));
      });
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'conversation_token': '{"state":null,"data":{}}',
      'expect_user_response': true,
      'expected_inputs': [
        {
          'input_prompt': {
            'initial_prompts': [
              {
                'ssml': '<speak>Hi! <break time="1"/> I can read out an ordinal like <say-as interpret-as="ordinal">123</say-as></speak>'
              }
            ],
            'no_match_prompts': [

            ],
            'no_input_prompts': [

            ]
          },
          'possible_intents': [
            {
              'intent': 'raw.input'
            }
          ]
        }
      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant ask method with function handler.
 */
describe('ActionsSdkAssistant#ask', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480373842830',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to hello action'
            }
          ],
          'arguments': [
            {
              'name': 'agent_info'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const RAW_INTENT = 'raw.input';

    function handler (assistant) {
      let inputPrompt = assistant.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
        'I can read out an ordinal like ' +
        '<say-as interpret-as="ordinal">123</say-as></speak>');
      let expectedIntent = assistant.buildExpectedIntent(RAW_INTENT);
      assistant.ask(inputPrompt, [expectedIntent]);
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'conversation_token': '{"state":null,"data":{}}',
      'expect_user_response': true,
      'expected_inputs': [
        {
          'input_prompt': {
            'initial_prompts': [
              {
                'ssml': '<speak>Hi! <break time="1"/> I can read out an ordinal like <say-as interpret-as="ordinal">123</say-as></speak>'
              }
            ],
            'no_match_prompts': [

            ],
            'no_input_prompts': [

            ]
          },
          'possible_intents': [
            {
              'intent': 'raw.input'
            }
          ]
        }
      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant tell method.
 */
describe('ActionsSdkAssistant#tell', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480389944033',
        'type': 2,
        'conversation_token': '{"state":null,"data":{"state":null,"data":{}}}'
      },
      'inputs': [
        {
          'intent': 'raw.input',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'bye'
            }
          ],
          'arguments': [
            {
              'name': 'raw_text',
              'raw_text': 'bye',
              'text_value': 'bye'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const RAW_INTENT = 'raw.input';

    function handler (assistant) {
      return new Promise(function (resolve, reject) {
        resolve(assistant.tell('Goodbye!'));
      });
    }

    let actionMap = new Map();
    actionMap.set(RAW_INTENT, handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'expect_user_response': false,
      'final_response': {
        'speech_response': {
          'text_to_speech': 'Goodbye!'
        }
      }
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getRawInput method.
 */
describe('ActionsSdkAssistant#getRawInput', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should get the raw user input for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480389944033',
        'type': 2,
        'conversation_token': '{"state":null,"data":{"state":null,"data":{}}}'
      },
      'inputs': [
        {
          'intent': 'raw.input',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'bye'
            }
          ],
          'arguments': [
            {
              'name': 'raw_text',
              'raw_text': 'bye',
              'text_value': 'bye'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getRawInput()).to.equal('bye');
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant askForText method.
 */
describe('ActionsSdkAssistant#askForText', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480463613280',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [
            {
              'name': 'agent_info'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    function handler (assistant) {
      return new Promise(function (resolve, reject) {
        resolve(assistant.askForText('What can I help you with?'));
      });
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'conversation_token': '{"state":null,"data":{}}',
      'expect_user_response': true,
      'expected_inputs': [
        {
          'input_prompt': {
            'initial_prompts': [
              {
                'text_to_speech': 'What can I help you with?'
              }
            ],
            'no_match_prompts': [

            ],
            'no_input_prompts': [

            ]
          },
          'possible_intents': [
            {
              'intent': 'assistant.intent.action.TEXT'
            }
          ]
        }
      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant askForText method with SSML.
 */
describe('ActionsSdkAssistant#askForText', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480464628054',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [
            {
              'name': 'agent_info'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    function handler (assistant) {
      return new Promise(function (resolve, reject) {
        resolve(assistant.askForText('<speak>What <break time="1"/> can I help you with?</speak>'));
      });
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, handler);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'conversation_token': '{"state":null,"data":{}}',
      'expect_user_response': true,
      'expected_inputs': [
        {
          'input_prompt': {
            'initial_prompts': [
              {
                'ssml': '<speak>What <break time="1"/> can I help you with?</speak>'
              }
            ],
            'no_match_prompts': [

            ],
            'no_input_prompts': [

            ]
          },
          'possible_intents': [
            {
              'intent': 'assistant.intent.action.TEXT'
            }
          ]
        }
      ]
    };
    expect(mockResponse.body).to.deep.equal(expectedResponse);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant ask (advanced usage) method.
 */
describe('ActionsSdkAssistant#ask', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {

      },
      'conversation': {
        'conversation_id': '1480528109466',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [

          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const PROVIDE_NUMBER_INTENT = 'PROVIDE_NUMBER';

    function handler (assistant) {
      return new Promise(function (resolve, reject) {
        let inputPrompt = assistant.buildInputPrompt(false, 'Welcome to action snippets! Say a number.',
          ['Sorry, say that again?', 'Sorry, that number again?', 'What was that number?'],
          ['Say any number', 'Pick a number', 'What is the number?']);
        let expectedIntent = assistant.buildExpectedIntent(PROVIDE_NUMBER_INTENT);
        resolve(assistant.ask(inputPrompt, [expectedIntent], {started: true}));
      });
    }

    function provideNumberIntent (assistant) {
      assistant.tell('You said ' + assistant.getRawInput());
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, handler);
    actionMap.set(PROVIDE_NUMBER_INTENT, provideNumberIntent);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'conversation_token': '{"started":true}',
      'expect_user_response': true,
      'expected_inputs': [
        {
          'input_prompt': {
            'initial_prompts': [
              {
                'text_to_speech': 'Welcome to action snippets! Say a number.'
              }
            ],
            'no_match_prompts': [
              {
                'text_to_speech': 'Sorry, say that again?'
              },
              {
                'text_to_speech': 'Sorry, that number again?'
              },
              {
                'text_to_speech': 'What was that number?'
              }
            ],
            'no_input_prompts': [
              {
                'text_to_speech': 'Say any number'
              },
              {
                'text_to_speech': 'Pick a number'
              },
              {
                'text_to_speech': 'What is the number?'
              }
            ]
          },
          'possible_intents': [
            {
              'intent': 'PROVIDE_NUMBER'
            }
          ]
        }
      ]
    };
    expect(JSON.stringify(mockResponse.body)).to.equal(JSON.stringify(expectedResponse));
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant askForPermissions method.
 */
describe('ActionsSdkAssistant#askForPermissions', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should return the valid JSON in the response object for the success case.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {

      },
      'conversation': {
        'conversation_id': '1480532856956',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'GET_RIDE',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'get me a ride in a big car'
            }
          ],
          'arguments': [

          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const GET_RIDE = 'GET_RIDE';

    function getRide (assistant) {
      assistant.askForPermissions('To get you a ride', [
        assistant.SupportedPermissions.NAME,
        assistant.SupportedPermissions.DEVICE_PRECISE_LOCATION
      ], {
        carType: 'big'
      });
    }

    let actionMap = new Map();
    actionMap.set(GET_RIDE, getRide);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'conversation_token': '{"carType":"big"}',
      'expect_user_response': true,
      'expected_inputs': [
        {
          'input_prompt': {
            'initial_prompts': [
              {
                'text_to_speech': 'PLACEHOLDER_FOR_PERMISSION'
              }
            ],
            'no_match_prompts': [
            ],
            'no_input_prompts': [
            ]
          },
          'possible_intents': [
            {
              'intent': 'assistant.intent.action.PERMISSION',
              'input_value_spec': {
                'permission_value_spec': {
                  'opt_context': 'To get you a ride',
                  'permissions': ['NAME', 'DEVICE_PRECISE_LOCATION']
                }
              }
            }
          ]
        }
      ]
    };

    expect(JSON.stringify(mockResponse.body)).to.equal(JSON.stringify(expectedResponse));
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getUser method.
 */
describe('ActionsSdkAssistant#getUser', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request info.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480476553943',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [
            {
              'name': 'agent_info'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getUser().user_id).to.equal('11112226094657824893');
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getUserName method.
 */
describe('ActionsSdkAssistant#getUserName', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request user.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893',
        'profile': {
          'display_name': 'John Smith',
          'given_name': 'John',
          'family_name': 'Smith'
        }
      },
      'conversation': {
        'conversation_id': '1480476553943',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [
            {
              'name': 'permission_granted',
              'text_value': 'true'
            }
          ]
        }
      ]
    };
    let mockRequest = new MockRequest(headers, body);
    let mockResponse = new MockResponse();

    let assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getUserName().displayName).to.equal('John Smith');
    expect(assistant.getUserName().givenName).to.equal('John');
    expect(assistant.getUserName().familyName).to.equal('Smith');

    // Test the false case

    body.user.profile = undefined;

    mockRequest = new MockRequest(headers, body);
    mockResponse = new MockResponse();

    assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getUserName()).to.equal(null);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getDeviceLocation method.
 */
describe('ActionsSdkAssistant#getDeviceLocation', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request user.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480476553943',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [
            {
              'name': 'permission_granted',
              'text_value': 'true'
            }
          ]
        }
      ],
      'device': {
        'location': {
          'coordinates': {
            'latitude': 37.3861,
            'longitude': 122.0839
          },
          'formatted_address': '123 Main St, Anytown, CA 12345, United States',
          'zip_code': '12345',
          'city': 'Anytown'
        }
      }
    };
    let mockRequest = new MockRequest(headers, body);
    let mockResponse = new MockResponse();

    let assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getDeviceLocation().coordinates).to.deep.equal({
      latitude: 37.3861,
      longitude: 122.0839
    });
    expect(assistant.getDeviceLocation().address)
      .to.equal('123 Main St, Anytown, CA 12345, United States');
    expect(assistant.getDeviceLocation().zipCode).to.equal('12345');
    expect(assistant.getDeviceLocation().city).to.equal('Anytown');

    // Test the false case

    body.device = undefined;

    mockRequest = new MockRequest(headers, body);
    mockResponse = new MockResponse();

    assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getDeviceLocation()).to.equal(null);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant isPermissionGranted method.
 */
describe('ActionsSdkAssistant#isPermissionGranted', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request user.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480476553943',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [
            {
              'name': 'permission_granted',
              'text_value': 'true'
            }
          ]
        }
      ]
    };
    let mockRequest = new MockRequest(headers, body);
    let mockResponse = new MockResponse();

    let assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.isPermissionGranted()).to.equal(true);

    // Test the false case

    body.inputs[0].arguments[0].text_value = false;

    mockRequest = new MockRequest(headers, body);
    mockResponse = new MockResponse();

    assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.isPermissionGranted()).to.equal(false);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getApiVersion method.
 */
describe('ActionsSdkAssistant#getApiVersion', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant request info.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480476553943',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [
            {
              'name': 'agent_info'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getApiVersion()).to.equal('v1');
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getDialogState method.
 */
describe('ActionsSdkAssistant#getDialogState', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant dialog state info.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480540140642',
        'type': 2,
        'conversation_token': '{"started":true}'
      },
      'inputs': [
        {
          'intent': 'PROVIDE_NUMBER',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': '5'
            }
          ],
          'arguments': [
            {
              'name': 'number',
              'raw_text': '5',
              'text_value': '5'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    let dialogState = {'started': true};

    expect(dialogState).to.deep.equal(assistant.getDialogState());
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getActionVersionLabel method.
 */
describe('ActionsSdkAssistant#getActionVersionLabel', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant action version label info.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1',
      'Agent-Version-Label': '1.0.0'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480540140642',
        'type': 2,
        'conversation_token': '{"started":true}'
      },
      'inputs': [
        {
          'intent': 'PROVIDE_NUMBER',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': '5'
            }
          ],
          'arguments': [
            {
              'name': 'number',
              'raw_text': '5',
              'text_value': '5'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getActionVersionLabel()).to.equal('1.0.0');
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getConversationId method.
 */
describe('ActionsSdkAssistant#getConversationId', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant conversation ID.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1',
      'Agent-Version-Label': '1.0.0'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480540140642',
        'type': 2,
        'conversation_token': '{"started":true}'
      },
      'inputs': [
        {
          'intent': 'PROVIDE_NUMBER',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': '5'
            }
          ],
          'arguments': [
            {
              'name': 'number',
              'raw_text': '5',
              'text_value': '5'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    expect(assistant.getConversationId()).to.equal('1480540140642');
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getArgument method.
 */
describe('ActionsSdkAssistant#getArgument', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant intent.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1',
      'Agent-Version-Label': '1.0.0'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480543005681',
        'type': 2,
        'conversation_token': '{"started":true}'
      },
      'inputs': [
        {
          'intent': 'PROVIDE_NUMBER',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': '45'
            }
          ],
          'arguments': [
            {
              'name': 'number',
              'raw_text': '45',
              'text_value': '45'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const PROVIDE_NUMBER_INTENT = 'PROVIDE_NUMBER';

    function mainIntent (assistant) {
      let inputPrompt = assistant.buildInputPrompt(false, 'Welcome to action snippets! Say a number.',
        ['Sorry, say that again?', 'Sorry, that number again?', 'What was that number?'],
        ['Say any number', 'Pick a number', 'What is the number?']);
      let expectedIntent = assistant.buildExpectedIntent(PROVIDE_NUMBER_INTENT);
      assistant.ask(inputPrompt, [expectedIntent], {started: true});
    }

    function provideNumberIntent (assistant) {
      expect(assistant.getArgument('number')).to.equal('45');
      assistant.tell('You said ' + assistant.getArgument('number'));
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
    actionMap.set(PROVIDE_NUMBER_INTENT, provideNumberIntent);

    assistant.handleRequest(actionMap);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant tell with SSML method.
 */
describe('ActionsSdkAssistant#tell', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant tell SSML.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1',
      'Agent-Version-Label': '1.0.0'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480548909986',
        'type': 2,
        'conversation_token': '{"state":null,"data":{}}'
      },
      'inputs': [
        {
          'intent': 'raw.input',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': '45'
            }
          ],
          'arguments': [
            {
              'name': 'raw_text',
              'raw_text': '45',
              'text_value': '45'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const RAW_INTENT = 'raw.input';

    function mainIntent (assistant) {
      let inputPrompt = assistant.buildInputPrompt(false, 'Welcome to action snippets! Say anything.');
      let expectedIntent = assistant.buildExpectedIntent(RAW_INTENT);
      assistant.ask(inputPrompt, [expectedIntent]);
    }

    function rawInputIntent (assistant) {
      assistant.tell('<speak>You said <break time="2"/>' + assistant.getRawInput() + '</speak>');
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
    actionMap.set(RAW_INTENT, rawInputIntent);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'expect_user_response': false,
      'final_response': {
        'speech_response': {
          'ssml': '<speak>You said <break time="2"/>45</speak>'
        }
      }
    };
    expect(JSON.stringify(mockResponse.body)).to.equal(JSON.stringify(expectedResponse));
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant getArgument method.
 */
describe('ActionsSdkAssistant#getArgument', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant intent.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1',
      'Agent-Version-Label': '1.0.0'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480543005681',
        'type': 2,
        'conversation_token': '{"started":true}'
      },
      'inputs': [
        {
          'intent': 'PROVIDE_NUMBER',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': '45'
            }
          ],
          'arguments': [
            {
              'name': 'number',
              'raw_text': '45',
              'text_value': '45'
            }
          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const PROVIDE_NUMBER_INTENT = 'PROVIDE_NUMBER';

    function mainIntent (assistant) {
      let inputPrompt = assistant.buildInputPrompt(false, 'Welcome to action snippets! Say a number.',
        ['Sorry, say that again?', 'Sorry, that number again?', 'What was that number?'],
        ['Say any number', 'Pick a number', 'What is the number?']);
      let expectedIntent = assistant.buildExpectedIntent(PROVIDE_NUMBER_INTENT);
      assistant.ask(inputPrompt, [expectedIntent], ['$SchemaOrg_Number'], {started: true});
    }

    function provideNumberIntent (assistant) {
      expect(assistant.getArgument('number')).to.equal('45');
      assistant.tell('You said ' + assistant.getArgument('number'));
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
    actionMap.set(PROVIDE_NUMBER_INTENT, provideNumberIntent);

    assistant.handleRequest(actionMap);
  });
});

/**
 * Describes the behavior for ActionsSdkAssistant buildExpectedIntent method.
 */
describe('ActionsSdkAssistant#buildExpectedIntent', function () {
  // Success case test, when the API returns a valid 200 response with the response object
  it('Should validate assistant runtime entity request.', function () {
    let headers = {
      'Content-Type': 'application/json',
      'Google-Assistant-API-Version': 'v1',
      'Agent-Version-Label': '1.0.0'
    };
    let body = {
      'user': {
        'user_id': '11112226094657824893'
      },
      'conversation': {
        'conversation_id': '1480714814340',
        'type': 1
      },
      'inputs': [
        {
          'intent': 'assistant.intent.action.MAIN',
          'raw_inputs': [
            {
              'input_type': 2,
              'query': 'talk to action snippets'
            }
          ],
          'arguments': [

          ]
        }
      ]
    };
    const mockRequest = new MockRequest(headers, body);
    const mockResponse = new MockResponse();

    const assistant = new ActionsSdkAssistant({
      request: mockRequest,
      response: mockResponse
    });

    const PROVIDE_TIME_INTENT = 'PROVIDE_TIME';

    function mainIntent (assistant) {
      let runtimeEntity = assistant.newRuntimeEntity('$CustomTypeTime',
        [assistant.newItem('18:00:00', ['six', '6 pm']),
         assistant.newItem('19:00:00', ['seven', '7 pm'])]);

      let inputPrompt = assistant.buildInputPrompt(false, 'Welcome to action snippets! Say a time.');
      let expectedIntent = assistant.buildExpectedIntent(PROVIDE_TIME_INTENT, [runtimeEntity]);
      assistant.ask(inputPrompt, [expectedIntent]);
    }

    function provideTimeIntent (assistant) {
      assistant.tell('You said ' + assistant.getArgument('time'));
    }

    let actionMap = new Map();
    actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
    actionMap.set(PROVIDE_TIME_INTENT, provideTimeIntent);

    assistant.handleRequest(actionMap);

    // Validating the response object
    let expectedResponse = {
      'conversation_token': '{"state":null,"data":{}}',
      'expect_user_response': true,
      'expected_inputs': [
        {
          'input_prompt': {
            'initial_prompts': [
              {
                'text_to_speech': 'Welcome to action snippets! Say a time.'
              }
            ],
            'no_match_prompts': [

            ],
            'no_input_prompts': [

            ]
          },
          'possible_intents': [
            {
              'intent': 'PROVIDE_TIME',
              'input_value_spec': {
                'option_value_spec': {
                  'options': [
                    {
                      'name': '$CustomTypeTime',
                      'items': [
                        {
                          'key': '18:00:00',
                          'synonyms': [
                            'six',
                            '6 pm'
                          ]
                        },
                        {
                          'key': '19:00:00',
                          'synonyms': [
                            'seven',
                            '7 pm'
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      ]
    };
    expect(JSON.stringify(mockResponse.body)).to.equal(JSON.stringify(expectedResponse));
  });
});
