var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//用户注册
router.post('/register', function(req, res, next) {
  let uname=req.body.uname;
  let pwd=req.body.password;
  //COUNT：mysql聚合函数
  let sql="SELECT COUNT(id) AS count FROM xzqa_author WHERE username=? ";
  pool.query(sql,[uname],(err,result)=>{
    if(err) throw err;
    if(result[0].count==0){
      sql="INSERT INTO xzqa_author(username,password) VALUES(?,MD5(?))";
      pool.query(sql,[uname,pwd],(err,result)=>{
        // 来自任何客户端都允许访问
        res.set('Access-Control-Allow-Origin', "*");
        if(err) throw err;
        if(result.affectedRows!=0){
          res.send({code:1})
        }
      })
    }else{
      res.send({code:0})
    }
  })
});
//用户登录
router.post('/login', function(req, res, next) {
  let uname=req.body.uname;
  let pwd=req.body.password;
  //COUNT：mysql聚合函数
  let sql="SELECT id,username,avatar,article_number,nickname FROM xzqa_author WHERE username=? AND password=MD5(?)";
  pool.query(sql,[uname,pwd],(err,result)=>{
  	// 来自任何客户端都允许访问
    res.set('Access-Control-Allow-Origin', "*");
    if(err) throw err;
    if(result.length!=0){
      res.send(result[0])
    }else{
      res.send({code:0})
    }
  })
});

module.exports = router;
