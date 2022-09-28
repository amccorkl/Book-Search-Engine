const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    //get the current logged in user 
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
        
        return userData;
      }
      throw new AuthenticationError('You need to be logged in!');
    }
  },

  Mutation: {
    //create a user, token, and send back to client 
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    //login a user, sign a token, and send back to client 
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    // can access the data using context  
    saveBook: async (parent, { input }, context) => {
      //if context has a 'user' property, that means th euser executing this mutation has a valid JWT and is logged in
      console.log(context);
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      // if the user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError("You need to be logged in first.");
    },

    //set up mutation so a logged in user can only remove their books 
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
        if (!updatedUser) {
          console.log('Couldn not find user');
        }
        return updatedUser;
      }
      throw new AuthenticationError('Not logged in');
    },
  }
};

module.exports = resolvers;