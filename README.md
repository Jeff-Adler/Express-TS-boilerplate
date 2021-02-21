# Boilerplate code for Express app with TypeScript

File structure inspired by [https://github.com/aionic-org/aionic-core](https://github.com/aionic-org/aionic-core)

User model plus authentication strategy inspired by [https://medium.com/javascript-in-plain-english/creating-a-rest-api-with-jwt-authentication-and-role-based-authorization-using-typescript-fbfa3cab22a4](https://medium.com/javascript-in-plain-english/creating-a-rest-api-with-jwt-authentication-and-role-based-authorization-using-typescript-fbfa3cab22a4)

## Technologies

- TypeScript
- Node.js
- Express
- TypeORM
- Passportjs

## To Dos

- Complete profile routes
- Build abstract Controller class (or maybe Services class)
- - Create UPDATE method that takes valid fields for model as input, and says only those roles can be updated. Could call it as an argument to super(), which will have an interface that defines what is updateable
- Abstract methods used throughout controller into Services, e.g. findUser.
- - Possible stretch: move that to abstract servicesClass

### Possible stretch:

- When a user initiliazes the app, they pass in a set of roles to either function or class constructor like "user", "admin," etc.
- - This will dynamically create a union type Role of all and only the roles they passed in.
- - Then, from type Role, they can dynamically decide which roles to assign to different models and routes. In other words, you'd say that 'route x is for someone of role a, and route Y is for someone of role b"
