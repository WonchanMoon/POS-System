const mongoose = require('mongoose'); // mongoose 선언

const productSchema = mongoose.Schema({  // schema 작성
  ID: {
    type: String,
    trim: true, // space 없애줌
    unique: 1, // 유일
    // required: true,
  },
  name: {
    type: String,
    maxLength: 20,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  counts: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    maxLength: 10,
    default: "",
  }
});

const Product = mongoose.model('Product', productSchema); // Schema를 model로 감싸줌

module.exports = { Product }; // Product라는 모델을 본 파일 밖에서도 사용할 수 있도록 export 구문을 작성해줌
