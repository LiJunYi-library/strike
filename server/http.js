const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const server = express();

function arrayLoopMap(num, cb) {
  const arr = [];
  for (let index = 0; index < num; index++) {
    arr.push(cb(index));
  }
  return arr;
}
server.use(cors());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use((req, res, next) => {
  req.on("aborted", () => {
    console.log("请求被中止");
  });
  next();
});

const list = arrayLoopMap(20, (i) => ({
  value: "value1" + i,
  label: "label1" + i,
}));

const classlist = [
  {
    frontBigCateId: "22",
    frontBigCateName: "中方红",
  },
  {
    frontBigCateId: "1",
    frontBigCateName: "李俊义",
  },
  {
    frontBigCateId: "2",
    frontBigCateName: "钟锦伟",
  },
  {
    frontBigCateId: "3",
    frontBigCateName: "牛奶水饮",
  },
  {
    frontBigCateId: "4",
    frontBigCateName: "休闲零食",
  },
  {
    frontBigCateId: "5",
    frontBigCateName: "中外美酒",
  },
  {
    frontBigCateId: "6",
    frontBigCateName: "粮油调味",
  },
  {
    frontBigCateId: "7",
    frontBigCateName: "个人洗护",
  },
  {
    frontBigCateId: "8",
    frontBigCateName: "美容护肤",
  },
  {
    frontBigCateId: "9",
    frontBigCateName: "母婴用品",
  },
];

const listData = {
  message: "操作成功",
  data: list,
  code: 200,
};

const pagin = {
  message: "操作成功",
  data: {
    total: 100,
    list,
  },
  code: 200,
};

const configs = {
  message: "操作成功",
  data: {
    list,
    classlist,
  },
  code: 200,
};

const page = {
  message: "操作成功",
  data: {
    total: 100,
    list,
    classlist,
  },
  code: 200,
};

function cPage() {
  return {
    total: 100,
    list,
    classlist,
  };
}

function response(data, code = 200, message = "操作成功") {
  return {
    message,
    code,
    data,
  };
}

// server.get("/serve/list", (req, res) => {
//   setTimeout(() => {
//     res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
//     res.end(JSON.stringify(list));
//   }, 3000);
// });

server.post("/serve/list", (req, res) => {
  const time = req?.body?.time ?? 3000;
  setTimeout(() => {
    if (req.body?.list) {
      listData.data = req.body.list;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(listData));
  }, time);
});

server.post("/serve/page", (req, res) => {
  console.log(req.body);
  const paList = cPage();
  const time = req?.body?.time ?? 3000;
  setTimeout(() => {
    if (req.body?.list) {
      paList.list = req.body.list;
      paList.total = req.body.list.length;
    }
    paList.time = time;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response(paList)));
  }, time);
});

server.post("/serve/configs", (req, res) => {
  setTimeout(() => {
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify(configs));
  }, 2000);
});

server.post("/serve/pagin", (req, res) => {
  setTimeout(() => {
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end(JSON.stringify(pagin));
  }, 3000);
});

server.get("/", (req, res) => {
  setTimeout(() => {
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    res.end("hellow!");
  }, 1000);
});

server.listen(5000, () => {});
