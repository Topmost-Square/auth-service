const { gql } = require('apollo-server');

module.exports = gql`
  type Query {
    getAllUsers: [User]
  }
  
  type User {
    id: ID!
    email: String!
    token: String
  }
  
  type RefreshResponse {
    token: String
  }
  
  type Mutation {
    register(email: String, password: String, confirmPassword: String): User
    login(email: String, password: String): User
    refresh: RefreshResponse 
  }
`;
