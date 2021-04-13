# Boilerplate code for Express app with TypeScript

File structure inspired by [https://github.com/aionic-org/aionic-core](https://github.com/aionic-org/aionic-core)

User model plus authentication strategy inspired by [https://medium.com/javascript-in-plain-english/creating-a-rest-api-with-jwt-authentication-and-role-based-authorization-using-typescript-fbfa3cab22a4](https://medium.com/javascript-in-plain-english/creating-a-rest-api-with-jwt-authentication-and-role-based-authorization-using-typescript-fbfa3cab22a4)

## Technologies

- TypeScript
- Node.js
- Express
- TypeORM
- Jest+Supertest

### Using VSCode debugger:

- To debug with ts-node-dev and development TypeORM connection and database (preferred method), use `npm run start:debug`, and debug with 'attach start:debug' task.
  -- Credit to 'https://www.otricks.com/what-is-the-ideal-setup-for-working-with-nodejs-typescript-in-vs-code/' for this setup!!

- To debug in test environment,  
   -- In console, run `npm run test:debug`
  -- In VSCode, start debug task `Attach to test:debug`.
  -- If you hit breakpoint in jest.js, just continue the debugger

- To debug with VSCode/tsc defaults and debugger TypeORM connection and database, get global node path with console command 'which node', and change your runtimeExecutable path to that path in launch.json configuration 'Debugger'.
