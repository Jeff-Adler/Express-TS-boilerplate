import { TestFactory } from '../../../utils/testing/factory';

import { NextFunction, Request, Response } from 'express';

import { isAuthorized } from '../isAuthorized';
import { hasPermission } from '../hasPermission';

// jest.mock('express');

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

    done();
  });

  afterAll(async (done) => {
    await factory.close();

    done();
  });

  beforeEach(async (done) => {
    mockRequest = {
      header: jest.fn(),
    };

    mockResponse = {
      json: jest.fn(),
      status: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn(),
      locals: {},
    };

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
      // Set Authentication header on mock Request
      mockRequest = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Set the headers as the return value for whenever header function is called.
      // Must be written separately from above code, because otherwise mockRequest.headers is not guarenteed to exist
      mockRequest = {
        ...mockRequest,
        header: jest.fn().mockReturnValue(mockRequest.headers!['Authorization']),
      };

      await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);

      done();
    });

    test('Returns 401 status is invalid credentials are sent', async (done) => {
      mockRequest = {
        headers: {
          Authorization: 'Bearer invalidToken',
        },
      };

      mockRequest = {
        ...mockRequest,
        header: jest.fn().mockReturnValue(mockRequest.headers!['Authorization']),
      };

      // Need to figure out what to mock so that send can fire
      mockResponse = {
        json: jest.fn().mockReturnValue(mockResponse),
        send: jest.fn().mockReturnValue(mockResponse),
        status: jest.fn().mockReturnValue(mockResponse),
      };

      await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith('Authentication Failed');

      expect(mockNext).toHaveBeenCalledTimes(0);

      done();
    });
  });
});
