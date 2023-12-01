const mongoose = require('mongoose'); // mongoose 선언

const salesSchema = mongoose.Schema({  // schema 작성
  ID: {
    type: String,
    trim: true, // space 없애줌
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // 추가 시점
    expires:60*60*24*90, // 30일 기한
  },
  data: [mongoose.Schema.Types.Mixed],
  // name: {
  //   type: String,
  //   maxLength: 20,
  //   required: true,
  //   trim: true,
  // },
  // price: {
  //   type: Number,
  //   required: true,
  // },
  // counts: {
  //   type: Number,
  //   required: true,
  // },
});

const Sales = mongoose.model('Sales', salesSchema); // Schema를 model로 감싸줌

module.exports = { Sales }; // Product라는 모델을 본 파일 밖에서도 사용할 수 있도록 export 구문을 작성해줌

//curl -X POST -H "Content-Type: application/json" -d '{"ID":"1234", "name": "고기", "price": 5000, "counts":3}' http://localhost:8000/products