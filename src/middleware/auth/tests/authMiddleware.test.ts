import { TestFactory } from '../../../utils/testing/factory';

import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { isAuthorized } from '../isAuthorized';
import { hasPermission } from '../hasPermission';
import { User } from '../../../components/user/model';
import { getConnection } from 'typeorm';
import { Role } from '../../../components/user/utils/Roles';

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
      headers: {
        Authorization: ``,
      },
      header: jest.fn(),
    };

    mockResponse = {
      json: jest.fn(),
      status: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn(),
      locals: jest.fn(),
      // locals: {
      //   currentUser: '',
      // },
    };

    done();
  });

  afterEach(async (done) => {
    jest.clearAllMocks();

    done();
  });

  describe('Testing hasPermission', () => {
    test('Proceeds to next middleware if user with ADMIN role is permitted', async (done) => {
      mockRequest = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      mockRequest = {
        ...mockRequest,
        header: jest.fn().mockReturnValue(mockRequest.headers!['Authorization']),
      };

      const roles: Array<Role> = ['ADMIN'];

      const decoded = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
      const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail(decoded.id);
      const { id, email } = user;
      const testToken = jwt.sign({ id, email }, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      mockResponse = {
        send: jest.fn().mockReturnValue(mockResponse),
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        locals: {
          currentUser: user,
        },
      };

      // await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      // expect(mockResponse.setHeader).toHaveBeenCalledWith(
      //   expect.stringMatching('token'),
      //   expect.stringMatching(testToken)
      // );

      const hasPermissionOuterFunc = hasPermission(roles);
      hasPermissionOuterFunc(mockRequest as Request, mockResponse as Response, mockNext);
      // This is where hasPermission test really starts
      hasPermission(roles);

      expect(mockNext).toHaveBeenCalledTimes(1);

      done();
    });

    test('Proceeds to next middleware if user with USER role is permitted', async (done) => {
      const roles = ['ADMIN', 'USER'];
      done();
    });

    test.todo('Returns 401 status if user does not have permission');
  });

  describe('Testing isAuthorized', () => {
    test('Sets token in response header if valid credentials are sent', async (done) => {
      mockRequest = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      mockRequest = {
        ...mockRequest,
        header: jest.fn().mockReturnValue(mockRequest.headers!['Authorization']),
      };

      const decoded = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
      const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail(decoded.id);
      const { id, email } = user;
      const testToken = jwt.sign({ id, email }, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        expect.stringMatching('token'),
        expect.stringMatching(testToken)
      );

      done();
    });

    test('Sets user to res.locals in response header if valid credentials are sent', async (done) => {
      mockRequest = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      mockRequest = {
        ...mockRequest,
        header: jest.fn().mockReturnValue(mockRequest.headers!['Authorization']),
      };

      const decoded = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
      const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail(decoded.id);

      mockResponse = {
        send: jest.fn().mockReturnValue(mockResponse),
        status: jest.fn().mockReturnThis(),
        locals: {
          currentUser: '',
        },
      };

      await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Object.keys(mockResponse)).toContain('locals');
      expect(Object.values(mockResponse)).toContainEqual({ currentUser: user });

      done();
    });

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

    test('Does not set token if invalid credentials are sent', async (done) => {
      mockRequest = {
        headers: {
          Authorization: `Bearer invalidToken`,
        },
      };

      mockRequest = {
        ...mockRequest,
        header: jest.fn().mockReturnValue(mockRequest.headers!['Authorization']),
      };

      mockResponse = {
        send: jest.fn().mockReturnValue(mockResponse),
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
      };

      await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledTimes(0);

      done();
    });

    test('Does not set user if invalid credentials are sent', async (done) => {
      mockRequest = {
        headers: {
          Authorization: `Bearer invalid token`,
        },
      };

      mockRequest = {
        ...mockRequest,
        header: jest.fn().mockReturnValue(mockRequest.headers!['Authorization']),
      };

      const decoded = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
      const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail(decoded.id);

      mockResponse = {
        send: jest.fn().mockReturnValue(mockResponse),
        status: jest.fn().mockReturnThis(),
        locals: {
          currentUser: '',
        },
      };

      await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Object.keys(mockResponse)).toContain('locals');
      expect(Object.values(mockResponse)).not.toContainEqual({ currentUser: user });

      done();
    });

    test('Returns 401 status and does not call next middleware if invalid credentials are sent', async (done) => {
      mockRequest = {
        headers: {
          Authorization: 'Bearer invalidToken',
        },
      };

      mockRequest = {
        ...mockRequest,
        header: jest.fn().mockReturnValue(mockRequest.headers!['Authorization']),
      };

      mockResponse = {
        send: jest.fn().mockReturnValue(mockResponse),
        status: jest.fn().mockReturnThis(),
      };

      await isAuthorized(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith('Authentication Failed');

      expect(mockNext).toHaveBeenCalledTimes(0);

      done();
    });
  });
});
