import { mock } from "mockjs"

const serviceData = mock({
  code: 0,
  data: {
    total: 6,
    "list|6": [
      //生成6条数据 数组
      {
        id: "@id", //生成商品id，自增1
        name: "@ctitle(4)", //生成商品名 ， 都是中国人的名字
        desc: "@ctitle(10)", //生成商品信息，长度为10个汉字
        price: "@integer(0, 100)",
        status: "@boolean",
        createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
      }
    ]
  },
  msg: "ok"
})
mock(/service/, "get", () => {
  return serviceData
})
