const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
            users: async () => {
                return User.find()
                    .select('-__v -password')
                    .populate('savedBooks');
            },
            me: async (parent, args, context) => {
                if (context.user) {
                    const userData = await User.findOne({ _id: context.user._id})
                        .select('-__v -password')
                        .populate('savedBooks');
                    return userData
                }
                throw new AuthenticationError('Cannot find a user with this id!');
            }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError('There is no account associated with this email.');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password.')
            }
            const token = signToken(user);

            return { token, user }
        },
        saveBook: async (parent, {book}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id },
                    { $addToSet: { savedBooks: book} },
                    { new: true, runValidators: true }
                );

                return updatedUser;
            };
            throw new AuthenticationError('Must be logged in to use this feature');
        },
        deleteBook: async (parent, {bookId}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id },
                    { $pull: { savedBooks: {bookId: bookId } } },
                    { new: true }
                );
                return updatedUser;
            };
            throw new AuthenticationError('Must be logged in to use this feature');
        }
    }
};

module.exports = resolvers;