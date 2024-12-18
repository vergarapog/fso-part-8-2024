const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book');
const { GraphQLError } = require("graphql");
const person = require("../first-part-sample/models/person");
const jwt = require('jsonwebtoken')
const User = require('./models/user')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


// let authors = [
//   {
//     name: "Robert Martin",
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: "Martin Fowler",
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963,
//   },
//   {
//     name: "Fyodor Dostoevsky",
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821,
//   },
//   {
//     name: "Joshua Kerievsky", // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   {
//     name: "Sandi Metz", // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
 */

// let books = [
//   {
//     title: "Clean Code",
//     published: 2008,
//     author: "Robert Martin",
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring"],
//   },
//   {
//     title: "Agile software development",
//     published: 2002,
//     author: "Robert Martin",
//     id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//     genres: ["agile", "patterns", "design"],
//   },
//   {
//     title: "Refactoring, edition 2",
//     published: 2018,
//     author: "Martin Fowler",
//     id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring"],
//   },
//   {
//     title: "Refactoring to patterns",
//     published: 2008,
//     author: "Joshua Kerievsky",
//     id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring", "patterns"],
//   },
//   {
//     title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
//     published: 2012,
//     author: "Sandi Metz",
//     id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring", "design"],
//   },
//   {
//     title: "Crime and punishment",
//     published: 1866,
//     author: "Fyodor Dostoevsky",
//     id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//     genres: ["classic", "crime"],
//   },
//   {
//     title: "Demons",
//     published: 1872,
//     author: "Fyodor Dostoevsky",
//     id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//     genres: ["classic", "revolution"],
//   },
// ];

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

 type Author {
    name: String!
    id: String!
    born: Int
    bookCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: String!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook (
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor (
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const { genre } = args
      if(!genre) return Book.find({})
      
      return Book.find({genres: genre})
      // const {author, genre} = args
      // if(!author && !genre) return books

      // return books.filter((book) => {
      //   const matchesAuthor = author ? book.author === author : true;
      //   const matchesGenre = genre ? book.genres.includes(genre) : true;

      //   return matchesAuthor && matchesGenre;
      // })
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: async (root) => {
      const bookCount = await Book.find({author: root._id})
      return bookCount.length
    }
  },
  Book: {
    author: async (root) => {
      const author = await Author.findById(root.author)
      return author
    }
  },
  Mutation: {
    addBook: async (root, {title, published, author, genres}, {currentUser}) => {

      if(!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      if (title.length < 5) {
        throw new GraphQLError('Title must be at least 5 characters long', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: title,
          },
        })
      }

      if (author.length < 4) {
        throw new GraphQLError('Author must be at least 4 characters long', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: author,
          },
        })
      }

      let existingAuthor = await Author.findOne({name: author})
      if(!existingAuthor) {
        existingAuthor = new Author({name: author});
        await existingAuthor.save()
      }

      const newBook = new Book({title, published, author: existingAuthor._id, genres});

      try {
        await newBook.save()
      } catch (error) {
        console.log(error)
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }

      return newBook

      // books = books.concat(newBook);

      // if(!authors.find(author => author.name === args.author)) {
      //   const newAuthor = {name: args.author, id: uuid() }
      //   authors = authors.concat(newAuthor)
      // }

      // return newBook
    },
    editAuthor: async (root, args, {currentUser}) => {

      if(!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const {name, setBornTo} = args

      const author = await Author.findOne({name:name})
      author.born = setBornTo

      try {
        await author.save()
      } catch (err) {
        throw new GraphQLError('Saving author birthdate failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            err
          }
        })

      }

      return author
      // const author = authors.find(a => a.name === name);
      // if(!author) {
      //   return null
      // }

      // const updatedAuthor = {...author, born: setBornTo}

      // authors = authors.map(a => a.name === name ? updatedAuthor : a)

      // return updatedAuthor
    },
    createUser: async (root, args) => {
      const user = new User({username: args.username, favoriteGenre: args.favoriteGenre})

      try {
        await user.save()
      } catch (error) {
        throw new GraphQLError('Creating user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      }

      return user
    },
    login: async(root, args) => {
      const user = await User.findOne({ username: args.username} )

      if (!user || args.password !== "secret") {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user.id
      }

      return {value: jwt.sign(userForToken, process.env.JWT_SECRET)}
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({req, res}) => {
    const auth = req ? req.headers.authorization : null

    if(auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      )

      const currentUser = await User.findById(decodedToken.id)

      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
