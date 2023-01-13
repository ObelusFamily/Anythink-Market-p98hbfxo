//TODO: seeds script should come here, so we'll be able to put some data in our local env
// const path = require("path");
require("dotenv").config({ path: require("find-config")(".env") });
var mongoose = require("mongoose");
var { faker } = require("@faker-js/faker");
var generator = require('generate-password');

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
  user.username = faker.name.firstName();
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

async function insertCollection(Collection, documents) {
  session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Collection.insertMany(documents, { session });
    await session.commitTransaction();
  }
  catch(error) {
    await session.abortTransaction();
  }
  finally {
    await session.endSession();
  }
};

async function process() {
  generatePasswords(100);
  createDocuments(100, 'User');
  createDocuments(100, 'Item');
  createDocuments(100, 'Comment');

  await mongoose.connect(process.env.MONGODB_URI);
  var isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";
  if (!isProduction) { mongoose.set("debug", true); }

  await clearDocuments();
  await insertDocuments();
  mongoose.disconnect();
}

process();