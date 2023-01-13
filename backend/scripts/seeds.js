//TODO: seeds script should come here, so we'll be able to put some data in our local env
require("dotenv").config();
var mongoose = require("mongoose");
var { faker } = require("@faker-js/faker");
var generator = require('generate-password');
const [ MONGODB_URI, NODE_ENV ] = [process.env.MONGODB_URI, process.env.NODE_ENV];

require("../models/User");
require("../models/Item");
require("../models/Comment");

let User = mongoose.model("User");
let Item = mongoose.model("Item");
let Comment = mongoose.model("Comment");

let session;
let users = [];
let items = [];
let comments = [];
let passwords = [];

function generatePasswords(count) {
  passwords = generator.generateMultiple(count, {
    length: 8,
    numbers: true,
    symbols: true,
    strict: true
  });
}

function createRandomUser(index) {
  const user = new User;
  const username = faker.name.firstName() + faker.name.lastName();
  user.username = username.replace(/[^a-zA-Z]/g, "");
  user.email = faker.internet.email();
  user.setPassword(passwords[index]);
  users.push(user);
}

function createRandomItem() {
  const item = new Item;
  item.title = faker.commerce.productName();
  item.description = faker.commerce.productDescription();
  item.image = faker.image.imageUrl();
  items.push(item);
}

function createRandomComment() {
  const comment = new Comment;
  comment.body = faker.commerce.productAdjective();
  comments.push(comment);
}


function createDocuments(count, docType) {
  Array.from({ length: count }).forEach((_, index) => {
    switch(docType) {
      case 'User': createRandomUser(index); break;
      case 'Item': createRandomItem(); break;
      case 'Comment': createRandomComment();
    }
  });
}

async function clearDocuments() {
  await User.deleteMany();
  await Item.deleteMany();
  await Comment.deleteMany();
}

async function insertDocuments() {
  await insertCollection(User, users);
  await insertCollection(Item, items);
  await insertCollection(Comment, comments);

}

async function insertCollection(DocType, documents) {
  session = await mongoose.startSession();
  try {
    await DocType.insertMany(documents, { session });
    console.log('Documents added > ', await DocType.countDocuments());
  }
  catch(error) {
    console.log('Errors >> ', error);
  }
  finally {
    await session.endSession();
  }
};

async function run() {
  generatePasswords(10);
  createDocuments(10, 'User');
  console.log('Users >> ', users.map(({ username }) => username ));
  createDocuments(10, 'Item');
  createDocuments(10, 'Comment');

  mongoose.connect(MONGODB_URI);
  var isProduction = NODE_ENV === "production" || NODE_ENV === "prod";
  // if (!isProduction) { mongoose.set("debug", true); }

  await clearDocuments();
  await insertDocuments();
  await mongoose.disconnect();
}

run();