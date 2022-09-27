import { gql } from '@apollo/client';

export const GET_ME = gql`
  query getUser {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId 
        authors
        title
        description
        image
        link 
      }
    }
  }
`;