const mongoose = require('mongoose'); // mongoose 선언

const productSchema = mongoose.Schema({  // schema 작성
  ID: {
    type: String,
    maxLength: 10,
    trim: true, // space 없애줌
    unique: 1, // 유일
  },
  name: {
    type: String,
    maxLength: 50,
  },
  price: {
    type: Number,
    default: 0, // 값이 정해지지 않았다면 디폴트 0
  },
  counts: {
    type: Number,
    default: 0, // 값이 정해지지 않았다면 디폴트 0
  },
});

const Product = mongoose.model('Product', productSchema); // Schema를 model로 감싸줌

module.exports = { Product }; // Product라는 모델을 본 파일 밖에서도 사용할 수 있도록 export 구문을 작성해줌

//curl -X POST -H "Content-Type: application/json" -d '{"ID":"1234", "name": "고기", "price": 5000, "counts":3}' http://localhost:8000/products
