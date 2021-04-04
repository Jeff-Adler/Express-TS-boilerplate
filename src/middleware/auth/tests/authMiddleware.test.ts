import { TestFactory } from '../../../utils/testing/factory';

import { NextFunction, Request, Response } from 'express';

import { isAuthorized } from '../isAuthorized';
import { hasPermission } from '../hasPermission';

describe('Testing Authentication middleware', () => {
  let factory: TestFactory = new TestFactory();

  // Partial keyword lets us not have to worry about mocking every aspect of Request/Response objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction = jest.fn();

  beforeAll(async (done) => {
    await factory.init();

    // lets us turn mockRequest into an empty object
    mockRequest = {};
    // jset.fn allows us to say we will return a json, but the function that invokes it is just an empty function
    mockResponse = {
      json: jest.fn(),
    };

    done();
  });

  afterAll(async (done) => {
    await factory.close();

    done();
  });

  //Ensure isAuthorized is broken up into separate functions for each utility it serves
  //User jest.mock to mock middleware
  describe('Testing hasPermission', () => {
    test.todo('Proceeds to next middleware if user is permitted');

    test.todo('Returns 401 status if user is not permitted');
  });

  describe('Testing isAuthorized', () => {
    test.todo('Sets token in response header if valid credentials are sent');

    test.todo('Sets user to res.locals in response header if valid credentials are sent');

    // test('Proceeds to next middleware if valid credentials are sent', async (done) => {
    //   // const mockRequest: any = {
    //   //   body: {
    //   //     firstName: 'J',
    //   //     lastName: 'Doe',
    //   //     email: 'jdoe@abc123.com',
    //   //     password: 'Abcd1234',
    //   //     passwordConfirm: 'Abcd1234',
    //   //     company: 'ABC Inc.',
    //   //   },
    //   // };

    //   // const mockResponse: any = {
    //   //   json: jest.fn(),
    //   //   status: jest.fn(),
    //   // };

    //   // const mockNext: NextFunction = jest.fn();

    //   // await userRegister(mockRequest, mockResponse, mockNext);

    //   // this should be the expected return value:
    //   expect(mockNext).toHaveBeenCalledTimes(1);

    //   done();
    // });

    test('Returns 401 status is invalid credentials are sent', async (done) => {
      const expectedResponse = 'Authentication Failed';

      mockRequest = {
        headers: {
          Authorization: 'Bearer invalidToken',
        },
      };

      isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);
      // console.log(mockResponse.json);
      expect(mockNext).toHaveBeenCalledTimes(0);

      expect(mockResponse.json).toBeCalledWith(expectedResponse);

      done();
    });
  });
});
