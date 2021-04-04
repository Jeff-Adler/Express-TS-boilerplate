import { TestFactory } from '../../../utils/testing/factory';

import { NextFunction, Request, Response } from 'express';

import { isAuthorized } from '../isAuthorized';
import { hasPermission } from '../hasPermission';

describe('Testing Authentication middleware', () => {
  let factory: TestFactory = new TestFactory();

  let token: string;

  // Partial keyword lets us not have to worry about mocking every aspect of Request/Response objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction = jest.fn();

  beforeAll(async (done) => {
    await factory.init();

    const result = await factory.loginAdminUser();
    token = result.body.token;

    // lets us turn mockRequest into an empty object
    mockRequest = {};

    mockResponse = {
      json: jest.fn(),
      status: jest.fn(),
      send: jest.fn(),
    };

    done();
  });

  afterAll(async (done) => {
    await factory.close();

    done();
  });

  describe('Testing hasPermission', () => {
    test.todo('Proceeds to next middleware if user is permitted');

    test.todo('Returns 401 status if user is not permitted');
  });

  describe('Testing isAuthorized', () => {
    test.todo('Sets token in response header if valid credentials are sent');

    test.todo('Sets user to res.locals in response header if valid credentials are sent');

    test('Proceeds to next middleware if valid credentials are sent', async (done) => {
      mockRequest = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);

      done();
    });

    // test('Returns 401 status is invalid credentials are sent', async (done) => {
    //   const expectedResponse = 'Authentication Failed';

    //   mockRequest = {
    //     headers: {
    //       Authorization: 'Bearer invalidToken',
    //     },
    //   };

    //   await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

    //   expect(mockNext).toHaveBeenCalledTimes(0);

    //   // console.log(mockResponse);
    //   expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);

    //   done();
    // });
  });
});
