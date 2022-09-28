const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    //get the current logged in user 
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('thoughts');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    //create a user, token, and send back to client 
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    //login a user, sign a token, and send back to client 
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect email or password');
      };

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect login or password');
      }

      const token = signToken(user);
      return { token, user };
    },

    // can access the data using context  
    saveBook: async (parent, { book }, context) => {
      //if context has a 'user' property, that means th euser executing this mutation has a valid JWT and is logged in
      console.log(context);
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: {
              savedBooks: {
                book
          }} },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      // if the user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError("You need to be logged in first.");
    },

    //set up mutation so a logged in user can only remove their books 
    removeBook: async (parent, { book }) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: book.bookId } } },
            { new: true }
          );
        
      }
        return updatedUser;
      }
  },
};

module.exports = resolvers;