//引入Express模块
const express = require("express");

//引入CORS模块

const cors = require("cors");

//引入MySQL模块

const mysql = require("mysql");
// 引入body-parser模块
const bodyParser = require("body-parser");

//创建MySQL连接池
const pool = mysql.createPool({
  //数据库服务器地址
  host: "127.0.0.1",
  //数据库用户名
  user: "root",
  //数据库用户密码
  password: "",
  //数据库服务器端口号
  port: 3306,
  //数据库名称
  database: "dangao",
  //编码方式
  charset: "utf8",
  //连接限制
  connectionLimit: 15,
});

//创建Express实例
const app = express();

// 将bodyParser作为app的中间件
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

//将CORS作为app的中间件使用
app.use(
  cors({
    origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
  })
);

//获取所有商品信息的API
app.get("/flower", (req, res) => {
  //鲜花轮播图
  let sql = "SELECT pid,pic FROM flowerbanner";
  pool.query(sql, (err, results) => {
    if (err) throw err;
    // 鲜花分类
    let sql = "SELECT DISTINCT category,detail,categoryimg FROM flower;";
    pool.query(sql, (err, result) => {
      if (err) throw err;
      //人气热卖列表
      let sql = "SELECT fid,title,price,price1,img FROM flower";
      pool.query(sql, (err, data) => {
        if (err) throw err;
        res.send({ message: "查询成功", code: 1, results, result, data });
      });
    });
  });
});

// 鲜花分类列表接口
app.get("/classlist", (req, res) => {
  let $category = req.query.category;
  let sql = "SELECT fid,title,price,price1,img FROM flower WHERE category=?";
  pool.query(sql, [$category], (err, results) => {
    if (err) throw err;
    // console.log(results);
    res.send({ message: "查询成功", code: 1, results });
  });
});

// 鲜花详情接口
app.get("/flowerdetail", (req, res) => {
  let $fid = req.query.fid;
  let sql = "SELECT fid,title,price,price1,img FROM flower WHERE fid=?";
  pool.query(sql, [$fid], (err, result) => {
    if (err) throw err;
    // console.log(result);
    res.send({ message: "查询成功", code: 1, result });
  });
});
//主页
app.get('/index',(req,res)=>{
  pool.query('select cid,img_a,details,title,price,discount_prices from  cake_details',(err,result)=>{
    if(err) throw err;
    res.send(result)
  })
})
//主页品牌
app.get('/brand',(req,res)=>{
  pool.query('select brand_img from cake_classify_details',(err,result)=>{
    if(err) throw err;
    res.send(result)
    console.log(result)
  })
})
app.get('/datalis', (req, res) => {
  pool.query('select cid,img_a,img_b,img_c,aid,details,details_img_a,details_img_b,details_img_c,title,price,discount_prices from cake_details', (err, result) => {
    if (err) throw err;
    res.send({
      message: "查询成功",
      code: 1,
      result
    })
    // console.log({
    //   result: result
    // })
  })
})

//面板接口
app.get('/will', (req, res) => {
  pool.query('select brand,brand_img from cake_classify_details', (err, result) => {
    if (err) throw err;
    res.send({
      message: "查询成功",
      code: 1,
      result
    })
    // console.log({
    //   result: result
    // })
  })
})
//蛋糕详情页接口
app.get("/page", (req, res) => {
  let $cid = req.query.cid;
  let sql = "select cid,img_a,img_b,img_c,aid,details,details_img_a,details_img_b,details_img_c,title,price,discount_prices from cake_details where cid=?";
  pool.query(sql, [$cid], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send({
      message: "查询成功",
      code: 1,
      result: result
    });
  });
});
// 获取用户详细信息(包括标题,正文,作者等)
app.get('/details', (req, res) => {
  //获取URL地址栏的参数
  let id = req.query.id;
  //SQL查询
  let sql = 'SELECT id,nickname,avatar,cake_number FROM  cakehome_author';
  // 执行SQL查询
  pool.query(sql, [id], (error, results) => {
    if (error) throw error;
    //results代表的返回的结果集,为数组类型;同是在该数组中包含了一个
    //对象,该对象就是文章的详细信息,在使用时,无需返回数组可直接返回对象
    //所以results[0]代表的就是文章详细信息的对象
    //results此时的结果如 [{id:1,subject:'AA',nickname:'淘气的松鼠'}]
    res.send({ message: '查询成功', code: 1, articleInfo: results[0] });
  });

});
//用户登录的接口
app.post('/login', (req, res) => {
  //获取用户名和密码
  let username = req.body.username;
  let password = req.body.password;
  //以用户名和密码为条件进行查找
  let sql = 'SELECT id,username,avatar,cake_number,nickname FROM cakehome_author WHERE username=? AND password=MD5(?)';
  pool.query(sql, [username, password], (error, results) => {
    if (error) throw error;
    if (results.length == 0) {
      res.send({ message: '登录失败', code: 0 });
    } else {
      res.send({ message: '登录成功', code: 1, userInfo: results[0] });
    }
  });

});
// 用户注册的接口
app.post('/register', (req, res) => {
  //console.log(md5('12345678')) ;
  //获取用户名和密码
  let username = req.body.username;
  let password = req.body.password;
  //查找用户是否存在
  let sql = 'SELECT COUNT(id) AS count FROM cakehome_author WHERE username=?';
  pool.query(sql, [username], (error, results) => {
    if (error) throw error;
    //如果用户不存在,则插入记录
    if (results[0].count == 0) {
      sql = 'INSERT INTO cakehome_author(username,password) VALUES(?,MD5(?))';
      pool.query(sql, [username, password], (error, results) => {
        if (error) throw error;
        res.send({ message: '注册成功', code: 1 });
      });
    } else { //否则产生合理的错误提示
      res.send({ message: '用户已存在', code: 0 });
    }
  });
});

module.exports = app;
