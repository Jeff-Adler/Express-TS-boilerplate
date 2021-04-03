import { TestFactory } from '../../../utils/testing/factory';

import { NextFunction, Request, Response } from 'express';

import { isAuthorized } from '../isAuthorized';
import { hasPermission } from '../hasPermission';

describe('Testing Authentication middleware', () => {
  let factory: TestFactory = new TestFactory();

  beforeAll(async (done) => {
    await factory.init();

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

    test.todo('Proceeds to next middleware if valid credentials are sent');

    test.todo('Returns 401 status is invalid credentials are sent');
  });
});
